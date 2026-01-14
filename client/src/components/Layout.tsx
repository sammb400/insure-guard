import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  ShieldCheck 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Clients", icon: Users, href: "/clients" },
    { label: "Policies", icon: FileText, href: "/policies" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-xl transition-transform md:translate-x-0 -translate-x-full">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <span>InsureGuard</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Alex Davis</p>
                <p className="truncate text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-lg">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Search className="h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search policies, clients..." 
              className="w-64 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
