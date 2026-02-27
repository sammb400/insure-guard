import {setGlobalOptions} from "firebase-functions/v2";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import {Transporter} from "nodemailer";

// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();

// Set global options for all functions.
setGlobalOptions({maxInstances: 10});

// Lazily initialize nodemailer transporter
let transporter: Transporter | null = null;

interface Policy {
  id?: string;
  clientId: string;
  userId: string;
  expiryDate: admin.firestore.Timestamp;
  [key: string]: unknown;
}

interface UserProfile {
  email: string;
  displayName?: string;
  // Sometimes used interchangeably with displayName in your logic
  name?: string;
  [key: string]: unknown;
}

/**
 * Initializes and returns a Nodemailer transporter.
 * It uses secrets for configuration, which are injected as environment
 * variables at runtime.
 * @return {Transporter} The Nodemailer transporter.
 */
function getTransporter() {
  if (!transporter) {
    if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
      throw new Error(
        "Email credentials (NODEMAILER_USER, NODEMAILER_PASS) are missing " +
        "from environment variables."
      );
    }

    logger.info("Initializing nodemailer transporter...");
    transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: parseInt(process.env.NODEMAILER_PORT || "465", 10),
      secure: process.env.NODEMAILER_SECURE === "true",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Helper to fetch documents by ID in chunks to avoid Firestore 'in' query limit of 30.
 * @param collectionName The name of the collection to query.
 * @param ids The list of document IDs to fetch.
 */
async function fetchDocsByIds(collectionName: string, ids: string[]) {
  const chunks = [];
  const chunkSize = 30;

  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      db.collection(collectionName)
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get()
    )
  );

  const docsMap = new Map<string, admin.firestore.DocumentData>();
  results.forEach((snapshot) => {
    snapshot.forEach((doc) => {
      docsMap.set(doc.id, doc.data());
    });
  });

  return docsMap;
}

/**
 * A scheduled function that runs at the beginning of every week (Monday 9:00 AM)
 * to check for insurance policies that are about to expire.
 */
export const weeklyPolicyExpirationCheck = onSchedule(
  {
    schedule: "every monday 09:00",
    timeZone: "Africa/Nairobi",
  },
  async () => {
    try {
      logger.info("Running weekly policy expiration check...");

      // 1. Define time window and get expiring policies
      const now = admin.firestore.Timestamp.now();
      const sevenDaysFromNow = admin.firestore.Timestamp.fromDate(
        new Date(now.toDate().getTime() + 7 * 24 * 60 * 60 * 1000),
      );

      const policiesSnapshot = await db
        .collection("policies")
        .where("expiryDate", ">=", now)
        .where("expiryDate", "<=", sevenDaysFromNow)
        .get();

      if (policiesSnapshot.empty) {
        logger.info("No policies found expiring in the next 7 days.");
        return;
      }

      // 2. Collect unique client IDs and agent IDs from policies
      const clientIds = new Set<string>();
      const agentIds = new Set<string>();

      policiesSnapshot.docs.forEach((doc) => {
        const policy = doc.data() as Policy;
        if (policy.clientId) {
          clientIds.add(policy.clientId);
        }
        if (policy.userId) {
          agentIds.add(policy.userId);
        }
      });

      if (agentIds.size === 0) {
        logger.info(
          "Expiring policies found, but none are linked to an agent (userId).",
        );
        return;
      }

      // 3. Fetch all related clients and map them by ID
      const clientsMap = await fetchDocsByIds("clients", Array.from(clientIds));

      // 4. Fetch all related agents (users) and map them by ID
      const agentsMap = await fetchDocsByIds("users", Array.from(agentIds));

      // 5. Group policies by agent email
      interface ExpiringPolicySummary {
        id: string;
        policyHolderName: string;
        expiryDate: string;
      }

      const policiesByAgentEmail = new Map<string, ExpiringPolicySummary[]>();
      policiesSnapshot.docs.forEach((doc) => {
        const policy = doc.data() as Policy;

        // Identify Agent directly from policy
        if (!policy.userId) return;
        const agent = agentsMap.get(policy.userId) as UserProfile;
        if (!agent || !agent.email) return;

        // Identify Client (for name only)
        const client = clientsMap.get(policy.clientId);
        const clientName = client?.name || "Unknown Client";

        if (!policiesByAgentEmail.has(agent.email)) {
          policiesByAgentEmail.set(agent.email, []);
        }
        let agentPolicies = policiesByAgentEmail.get(agent.email);
        if (!agentPolicies) {
          agentPolicies = [];
          policiesByAgentEmail.set(agent.email, agentPolicies);
        }
        const expiryDate = policy.expiryDate.toDate().toLocaleDateString();
        agentPolicies.push({
          id: doc.id,
          policyHolderName: clientName,
          expiryDate: expiryDate,
        });
      });

      // 6. Send one email to each agent
      const mailer = getTransporter();
      const emailPromises = Array.from(policiesByAgentEmail.entries()).map(
        async ([agentEmail, agentPolicies]) => {
          const mailOptions = {
            from: `"InsureGuard Alerts" <${process.env.NODEMAILER_USER}>`,
            to: agentEmail,
            subject: "Weekly Report: Policies Expiring This Week",
            html: `<h2>Weekly Policy Expiration Report</h2>` +
              `<p>Hello,</p>` +
              `<p>The following policies for your clients are set to expire within the next 7 days:</p>` +
              `<ul>${agentPolicies.map((p) =>
                `<li>Policy #${p.id} (Holder: ${p.policyHolderName}) - Expires on: ${p.expiryDate}</li>`
              ).join("")}</ul>` +
              `<p>Please review and take the necessary renewal actions.</p><br/>` +
              `<p>Thank you,</p><p>InsureGuard Automated System</p>`,
          };
          await mailer.sendMail(mailOptions);
          logger.info(
            `Sent expiration report to ${agentEmail} for ${agentPolicies.length} policies.`,
          );
        },
      );

      await Promise.all(emailPromises);
      logger.info("All policy expiration emails have been sent successfully.");
    } catch (error) {
      logger.error("Error running weekly policy expiration check:", error);
    }
  },
);

/**
 * Creates a user profile in Firestore when a new user signs up.
 */
export const createUserProfile = functions.auth.user().onCreate(
  async (user) => {
  const {uid, email, displayName} = user;

  const userProfile: UserProfile = {
    email: email || "",
    displayName: displayName || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    policies: [],
    claims: [],
  };

  try {
    await db.collection("users").doc(uid).set(userProfile);
    logger.info(`User profile created for UID: ${uid}`);
  } catch (error) {
    logger.error(`Error creating user profile for UID: ${uid}`, error);
  }
  });
