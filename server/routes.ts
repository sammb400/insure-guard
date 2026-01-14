import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Clients
  app.get(api.clients.list.path, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const client = await storage.getClient(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  });

  app.post(api.clients.create.path, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    try {
      const input = api.clients.update.input.parse(req.body);
      const client = await storage.updateClient(Number(req.params.id), input);
      res.json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Policies
  app.get(api.policies.list.path, async (req, res) => {
    const policies = await storage.getPolicies();
    res.json(policies);
  });

  app.get(api.policies.get.path, async (req, res) => {
    const policy = await storage.getPolicy(Number(req.params.id));
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.json(policy);
  });

  app.post(api.policies.create.path, async (req, res) => {
    try {
      const input = api.policies.create.input.parse(req.body);
      const policy = await storage.createPolicy(input);
      res.status(201).json(policy);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingClients = await storage.getClients();
  if (existingClients.length === 0) {
    console.log("Seeding database...");
    
    const client1 = await storage.createClient({
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "555-0101",
      address: "123 Maple Ave, Springfield, IL",
      status: "active",
      lastContactDate: new Date(),
    });

    const client2 = await storage.createClient({
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "555-0102",
      address: "456 Oak Dr, Springfield, IL",
      status: "active",
      lastContactDate: new Date(),
    });

    const client3 = await storage.createClient({
      name: "Michael Brown",
      email: "m.brown@example.com",
      phone: "555-0103",
      address: "789 Pine Ln, Springfield, IL",
      status: "inactive",
      lastContactDate: new Date("2023-12-01"),
    });

    // Create Policies
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    // Client 1 Policies
    await storage.createPolicy({
      clientId: client1.id,
      policyNumber: "AUTO-1001",
      type: "Auto",
      carrier: "SafeDrive Insurance",
      startDate: new Date("2023-01-15").toISOString().split('T')[0],
      expirationDate: nextWeek.toISOString().split('T')[0], // Expiring soon
      premium: "1200.00",
      status: "active"
    });

    await storage.createPolicy({
      clientId: client1.id,
      policyNumber: "HOME-2001",
      type: "Home",
      carrier: "SecureHome Corp",
      startDate: new Date("2023-05-20").toISOString().split('T')[0],
      expirationDate: nextYear.toISOString().split('T')[0],
      premium: "850.50",
      status: "active"
    });

    // Client 2 Policies
    await storage.createPolicy({
      clientId: client2.id,
      policyNumber: "LIFE-3001",
      type: "Life",
      carrier: "FamilyFirst Life",
      startDate: new Date("2020-03-10").toISOString().split('T')[0],
      expirationDate: new Date("2030-03-10").toISOString().split('T')[0],
      premium: "500.00",
      status: "active"
    });
    
    // Client 3 Policies (Expired)
    await storage.createPolicy({
      clientId: client3.id,
      policyNumber: "AUTO-1002",
      type: "Auto",
      carrier: "SafeDrive Insurance",
      startDate: new Date("2022-01-01").toISOString().split('T')[0],
      expirationDate: new Date("2023-01-01").toISOString().split('T')[0],
      premium: "1100.00",
      status: "expired"
    });

    console.log("Database seeded successfully.");
  }
}
