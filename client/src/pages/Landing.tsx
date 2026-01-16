import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShieldCheck, ArrowRight, Users, Clock, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-white/50 dark:bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">InsureFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-foreground sm:text-6xl mb-6">
              Insurance Management <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-muted-foreground mb-10 leading-relaxed">
              The all-in-one portal for insurance agents to track client policies, prioritize expirations, and grow their premium volume with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="bg-white dark:bg-card p-3 rounded-2xl shadow-sm w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">Client Management</h3>
              <p className="text-slate-600 dark:text-muted-foreground">Keep all client data, history, and communications in one secure place.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-card p-3 rounded-2xl shadow-sm w-fit">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">Priority Alerts</h3>
              <p className="text-slate-600 dark:text-muted-foreground">Never miss a renewal with automated expiration tracking and priority notifications.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-card p-3 rounded-2xl shadow-sm w-fit">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">Premium Analytics</h3>
              <p className="text-slate-600 dark:text-muted-foreground">Track your agency's performance with real-time premium volume and growth reports.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
