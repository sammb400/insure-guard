import Layout from "@/components/Layout";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatsCard } from "@/components/StatsCard";
import { Users, FileText, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolicies } from "@/hooks/use-policies";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function StatsGrid({ stats }: { stats: any }) {
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
        value={`$${Number(stats.totalPremiumVolume).toLocaleString()}`} 
        icon={DollarSign} 
        color="emerald"
        trend="8%" 
        trendUp={true}
      />
      <StatsCard 
        title="Expiring Soon" 
        value={stats.upcomingExpirations} 
        icon={AlertCircle} 
        color="destructive"
        trend="2" 
        trendUp={false}
      />
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
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: policies, isLoading: policiesLoading } = usePolicies();

  const expiringPolicies = policies
    ?.filter(p => new Date(p.expirationDate) > new Date() && new Date(p.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .slice(0, 5) || [];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your agency's performance and alerts.</p>
        </div>

        {statsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <StatsGrid stats={stats} />
        )}

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 shadow-md border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Policy Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {policies?.slice(0, 5).map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{policy.policyNumber}</p>
                        <p className="text-sm text-muted-foreground">{policy.type} - {policy.carrier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(policy.premium).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(policy.startDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                  {(!policies || policies.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No recent activity.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
                <AlertCircle className="h-5 w-5" />
                Upcoming Expirations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
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
    </Layout>
  );
}
