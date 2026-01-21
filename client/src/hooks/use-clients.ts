import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { Client } from "@/lib/DataContext";

export function useClients() {
  return useQuery({
    queryKey: ["clients", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, "clients"), 
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Client[];
      return clients.sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!auth.currentUser,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: Omit<Client, "id">) => {
      const data = { ...client, userId: auth.currentUser?.uid };
      const docRef = await addDoc(collection(db, "clients"), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Client> & { id: string }) => {
      const docRef = doc(db, "clients", id);
      await updateDoc(docRef, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "clients", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    }
  });
}
