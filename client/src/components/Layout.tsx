import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReloadPrompt } from "@/hooks/reload";

export default function Layout({ children, headerContent }: { children: React.ReactNode; headerContent?: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [avatar, setAvatar] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const isCollapsed = collapsed && !isMobile;
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().photoURL) {
          setAvatar(docSnap.data().photoURL);
        }
      }
    };
    fetchAvatar();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Clients", icon: Users, href: "/clients" },
    { label: "Policies", icon: FileText, href: "/policies" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/clients")) return "Clients";
    if (path.startsWith("/policies")) return "Policies";
    if (path.startsWith("/settings")) return "Settings";
    return "";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <ReloadPrompt />
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen ${isCollapsed ? "w-16" : "w-64"} border-r bg-card/50 backdrop-blur-xl transition-all duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className={`flex h-16 items-center ${isCollapsed ? "justify-center" : "justify-between px-6"} border-b`}>
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <ShieldCheck className="h-6 w-6 text-accent" />
              {!isCollapsed && <span>InsureGuard</span>}
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                  flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {!isCollapsed && item.label}
                </Link>
              );
            })}
            
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive`}
            >
              <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
              {!isCollapsed && "Sign Out"}
            </button>
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className={`hidden md:flex w-full mb-2 ${isCollapsed ? "justify-center px-0" : "justify-start gap-2"}`}
              onClick={() => setCollapsed(!collapsed)}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              {!isCollapsed && <span>Collapse</span>}
            </Button>
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg bg-secondary/50 p-3`}>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={avatar || user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isCollapsed ? "md:pl-16" : "md:pl-64"} min-w-0 transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 md:px-6 backdrop-blur-lg gap-4">
          <div className="flex items-center gap-4 text-muted-foreground shrink-0">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className={`text-xl font-semibold text-foreground ml-2 md:ml-0 ${headerContent ? 'hidden lg:block' : ''}`}>{getPageTitle(location)}</h1>
          </div>
          
          {headerContent && (
            <div className="flex-1 flex items-center max-w-2xl">
              {headerContent}
            </div>
          )}

          <div className="flex items-center gap-4 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-muted-foreground hover:text-primary mr-2 md:mr-0"
              onClick={() => toast({ title: "Notifications", description: "You have no new notifications at this time." })}
            >
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
