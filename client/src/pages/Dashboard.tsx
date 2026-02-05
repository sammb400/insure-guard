import Layout from "@/components/Layout";
import { useData, type DashboardStats } from "@/lib/DataContext";
import { StatsCard } from "@/components/StatsCard";
import { Users, FileText, DollarSign, AlertCircle, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

function StatsGrid({ stats }: { stats: DashboardStats | null }) {
  const [, setLocation] = useLocation();
  if (!stats) return <Skeleton className="h-32 w-full rounded-xl" />;
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Active Policies" 
        value={stats.totalActivePolicies} 
        icon={FileText} 
        trend="12%" 
        trendUp={true} 
      />
      <StatsCard 
        title="Premium Volume" 
        value={`Kes${Number(stats.totalPremiumVolume).toLocaleString()}`} 
        icon={DollarSign} 
        color="emerald"
        trend="8%" 
        trendUp={true}
      />
      <div onClick={() => setLocation("/policies")} className="cursor-pointer transition-transform hover:scale-[1.02]">
        <StatsCard 
          title="Expiring Soon" 
          value={stats.upcomingExpirations} 
          icon={AlertCircle} 
          color="destructive"
          trend="2" 
          trendUp={false}
        />
      </div>
      <StatsCard 
        title="Active Clients" 
        value={stats.activeClients} 
        icon={Users} 
        color="accent"
        trend="5%" 
        trendUp={true}
      />
    </div>
  );
}

export default function Dashboard() {
  const { stats, policies, isLoading } = useData();
  const [, setLocation] = useLocation();

  const expiringPolicies = policies
    .filter(p => new Date(p.expirationDate) > new Date() && new Date(p.expirationDate) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))
    .slice(0, 5);

  const installmentPolicies = policies
    .filter(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.expirationDate);
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return durationDays <= 45 && p.status === 'active';
    })
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your agency's performance and alerts.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full order-2 md:order-1">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : (
              <StatsGrid stats={stats} />
            )}
          </div>

          <Card className="md:col-span-2 lg:col-span-3 shadow-md border-border/60 order-3 md:order-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Policy Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.slice(0, 5).map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{policy.policyNumber}</p>
                        <p className="text-sm text-muted-foreground">{policy.type} - {policy.carrier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Kes{Number(policy.premium).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(policy.startDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                  {policies.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No recent activity.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-6 order-1 md:order-2">
          <Card className="flex-1 min-w-[280px] border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-500">
                <CreditCard className="h-5 w-5" />
                Partially Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {installmentPolicies.map((policy) => (
                    <div 
                      key={policy.id} 
                      className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setLocation(`/policies?policyId=${policy.id}`)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{policy.policyNumber}</p>
                        <p className="text-xs text-muted-foreground">{policy.carrier}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">Kes{Number(policy.premium).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Instalment</p>
                      </div>
                    </div>
                  ))}
                  {installmentPolicies.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                      <p>No partially paid policies.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[280px] border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
                <AlertCircle className="h-5 w-5" />
                Upcoming Expirations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringPolicies.map((policy) => (
                    <div 
                      key={policy.id} 
                      className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setLocation(`/policies?policyId=${policy.id}`)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{policy.policyNumber}</p>
                        <StatusBadge status="expiring" className="bg-amber-100 text-amber-800 border-amber-200" />
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-bold text-destructive">
                          {Math.ceil((new Date(policy.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                        <p className="text-xs text-muted-foreground">remaining</p>
                      </div>
                    </div>
                  ))}
                  {expiringPolicies.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                      <p>No policies expiring soon.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
