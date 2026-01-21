import { createContext, useContext, ReactNode } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { usePolicies, useCreatePolicy } from "@/hooks/use-policies";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/use-clients";

export interface DashboardStats {
  totalActivePolicies: number;
  totalPremiumVolume: number;
  upcomingExpirations: number;
  activeClients: number;
}

export interface Policy {
  id: string;
  policyNumber: string;
  type: string;
  carrier: string;
  premium: number | string;
  startDate: string;
  expirationDate: string;
  status: string;
  clientId: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  kraPin?: string;
  idNumber?: string;
}

interface DataContextType {
  stats: DashboardStats | null;
  policies: Policy[];
  clients: Client[];
  isLoading: boolean;
  addClient: (client: Omit<Client, "id">) => Promise<void>;
  updateClient: (id: string, data: Partial<Omit<Client, "id">>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addPolicy: (policy: Omit<Policy, "id">) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  stats: null,
  policies: [],
  clients: [],
  isLoading: true,
  addClient: async () => {},
  updateClient: async () => {},
  deleteClient: async () => {},
  addPolicy: async () => {},
  refreshData: async () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: policies, isLoading: policiesLoading, refetch: refetchPolicies } = usePolicies();
  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = useClients();
  
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const createPolicyMutation = useCreatePolicy();

  const refreshData = async () => {
    await Promise.all([
      refetchStats(),
      refetchPolicies(),
      refetchClients()
    ]);
  };

  const addClient = async (client: Omit<Client, "id">) => {
    await createClientMutation.mutateAsync(client);
    await refetchStats();
  };

  const updateClient = async (id: string, data: Partial<Omit<Client, "id">>) => {
    await updateClientMutation.mutateAsync({ id, ...data });
    await refetchStats();
  };

  const deleteClient = async (id: string) => {
    await deleteClientMutation.mutateAsync(id);
    await refetchStats();
  };

  const addPolicy = async (policy: Omit<Policy, "id">) => {
    await createPolicyMutation.mutateAsync(policy);
    await refetchStats();
  };

  const isLoading = statsLoading || policiesLoading || clientsLoading;

  return (
    <DataContext.Provider value={{ 
      stats: stats || null, 
      policies: policies || [], 
      clients: clients || [], 
      isLoading,
      addClient, 
      updateClient,
      deleteClient,
      addPolicy,
      refreshData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);