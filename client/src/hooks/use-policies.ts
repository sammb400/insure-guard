import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Policy } from "@/lib/DataContext";

export function usePolicies() {
  return useQuery({
    queryKey: ["policies", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, "policies"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Policy[];
    },
    enabled: !!auth.currentUser,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (policy: Omit<Policy, "id">) => {
      const data = { ...policy, userId: auth.currentUser?.uid };
      const docRef = await addDoc(collection(db, "policies"), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    }
  });
}
