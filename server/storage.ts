import { db } from "./db";
import {
  clients, policies,
  type Client, type InsertClient, type UpdateClientRequest,
  type Policy, type InsertPolicy, type UpdatePolicyRequest
} from "@shared/schema";
import { eq, sql, desc, lt, gte, and } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: UpdateClientRequest): Promise<Client>;

  // Policies
  getPolicies(): Promise<Policy[]>;
  getPoliciesByClientId(clientId: number): Promise<Policy[]>;
  getPolicy(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalActivePolicies: number;
    upcomingExpirations: number;
    totalPremiumVolume: number;
    activeClients: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.id));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, updates: UpdateClientRequest): Promise<Client> {
    const [client] = await db.update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async getPolicies(): Promise<Policy[]> {
    return await db.select().from(policies).orderBy(desc(policies.id));
  }

  async getPoliciesByClientId(clientId: number): Promise<Policy[]> {
    return await db.select().from(policies).where(eq(policies.clientId, clientId));
  }

  async getPolicy(id: number): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const [policy] = await db.insert(policies).values(insertPolicy).returning();
    return policy;
  }

  async getDashboardStats() {
    // Active Policies
    const activePoliciesCount = await db.select({ count: sql<number>`count(*)` })
      .from(policies)
      .where(eq(policies.status, 'active'));
    
    // Upcoming Expirations (Next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // Note: This is a simplified check. In real app, consider date handling carefully with DB timezone.
    const upcomingExpirationsCount = await db.select({ count: sql<number>`count(*)` })
      .from(policies)
      .where(
        and(
          eq(policies.status, 'active'),
          gte(policies.expirationDate, today.toISOString().split('T')[0]),
          lt(policies.expirationDate, thirtyDaysFromNow.toISOString().split('T')[0])
        )
      );

    // Total Premium Volume
    const totalPremium = await db.select({ total: sql<number>`sum(${policies.premium})` })
      .from(policies)
      .where(eq(policies.status, 'active'));

    // Active Clients
    const activeClientsCount = await db.select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.status, 'active'));

    return {
      totalActivePolicies: Number(activePoliciesCount[0]?.count || 0),
      upcomingExpirations: Number(upcomingExpirationsCount[0]?.count || 0),
      totalPremiumVolume: Number(totalPremium[0]?.total || 0),
      activeClients: Number(activeClientsCount[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
