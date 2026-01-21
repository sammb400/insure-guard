import { useQuery } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return null;
      const policiesColl = collection(db, "policies");
      const clientsColl = collection(db, "clients");
      
      const policiesQuery = query(policiesColl, where("userId", "==", auth.currentUser.uid));
      const clientsQuery = query(clientsColl, where("userId", "==", auth.currentUser.uid));
      
      const policiesSnapshot = await getCountFromServer(policiesQuery);
      const clientsSnapshot = await getCountFromServer(clientsQuery);
      
      // Calculate premium volume and expirations manually since we don't have backend aggregation
      const allPolicies = await getDocs(policiesQuery);
      let totalPremium = 0;
      let upcomingExpirations = 0;
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      allPolicies.forEach(doc => {
        const data = doc.data();
        totalPremium += Number(data.premium || 0);
        const expDate = new Date(data.expirationDate);
        if (expDate > now && expDate < thirtyDaysFromNow) {
          upcomingExpirations++;
        }
      });

      return {
        totalActivePolicies: policiesSnapshot.data().count,
        totalPremiumVolume: totalPremium,
        upcomingExpirations: upcomingExpirations,
        activeClients: clientsSnapshot.data().count,
      };
    },
    enabled: !!auth.currentUser,
  });
}
