import { pgTable, text, serial, integer, boolean, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  status: text("status").default("active"), // active, inactive
  avatar: text("avatar"), // URL to avatar image
  lastContactDate: timestamp("last_contact_date"),
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  policyNumber: text("policy_number").notNull(),
  type: text("type").notNull(), // Auto, Home, Life, Health, Business
  carrier: text("carrier").notNull(),
  startDate: date("start_date").notNull(),
  expirationDate: date("expiration_date").notNull(),
  premium: decimal("premium").notNull(),
  status: text("status").notNull().default("active"), // active, pending, expired, cancelled
});

export const clientsRelations = relations(clients, ({ many }) => ({
  policies: many(policies),
}));

export const policiesRelations = relations(policies, ({ one }) => ({
  client: one(clients, {
    fields: [policies.clientId],
    references: [clients.id],
  }),
}));

export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true });

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;

export type CreateClientRequest = InsertClient;
export type UpdateClientRequest = Partial<InsertClient>;
export type CreatePolicyRequest = InsertPolicy;
export type UpdatePolicyRequest = Partial<InsertPolicy>;
