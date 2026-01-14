import { z } from 'zod';
import { insertClientSchema, insertPolicySchema, clients, policies } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  clients: {
    list: {
      method: 'GET' as const,
      path: '/api/clients',
      responses: {
        200: z.array(z.custom<typeof clients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clients/:id',
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients',
      input: insertClientSchema,
      responses: {
        201: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/clients/:id',
      input: insertClientSchema.partial(),
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  policies: {
    list: {
      method: 'GET' as const,
      path: '/api/policies',
      responses: {
        200: z.array(z.custom<typeof policies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/policies/:id',
      responses: {
        200: z.custom<typeof policies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/policies',
      input: insertPolicySchema,
      responses: {
        201: z.custom<typeof policies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalActivePolicies: z.number(),
          upcomingExpirations: z.number(),
          totalPremiumVolume: z.number(),
          activeClients: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ClientInput = z.infer<typeof api.clients.create.input>;
export type PolicyInput = z.infer<typeof api.policies.create.input>;
