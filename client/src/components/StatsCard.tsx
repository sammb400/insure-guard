import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "accent" | "destructive" | "emerald";
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, color = "primary" }: StatsCardProps) {
  const colorStyles = {
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    destructive: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-lg p-2.5 ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`font-medium ${trendUp ? "text-emerald-600" : "text-red-600"}`}>
            {trendUp ? "+" : ""}{trend}
          </span>
          <span className="ml-1 text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
