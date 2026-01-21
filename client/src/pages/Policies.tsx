import Layout from "@/components/Layout";
import { useData } from "@/lib/DataContext";
import { CreatePolicyDialog } from "@/components/CreatePolicyDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyDetailsDialog } from "@/components/PolicyDetailsDialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Filter, MoreHorizontal, Car, Home, Heart, Briefcase, Activity } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Policy } from "@/lib/DataContext";

const PolicyIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'auto': return <Car className="h-4 w-4" />;
    case 'home': return <Home className="h-4 w-4" />;
    case 'life': return <Heart className="h-4 w-4" />;
    case 'business': return <Briefcase className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export default function Policies() {
  const { policies, clients, isLoading, updatePolicy, deletePolicy } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [policyToView, setPolicyToView] = useState<Policy | null>(null);
  const [policyToRenew, setPolicyToRenew] = useState<Policy | null>(null);

  const filteredPolicies = policies?.filter(policy => {
    const matchesSearch = policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || policy.type === typeFilter;
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async () => {
    if (policyToDelete) {
      await deletePolicy(policyToDelete.id);
      setPolicyToDelete(null);
    }
  };

  const handleRenew = async () => {
    if (policyToRenew) {
      // Extend by 1 year
      const currentExp = new Date(policyToRenew.expirationDate);
      const newExp = new Date(currentExp.setFullYear(currentExp.getFullYear() + 1));
      
      await updatePolicy(policyToRenew.id, { expirationDate: newExp.toISOString().split('T')[0] });
      setPolicyToRenew(null);
    }
  };

  const isRenewable = (policy: Policy) => {
    const expirationDate = new Date(policy.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
            <p className="text-muted-foreground">Manage and track insurance policies.</p>
          </div>
          <CreatePolicyDialog />
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search policies..." 
              className="pl-9 border-none bg-secondary/50 focus-visible:ring-0" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Type: </span>
                {typeFilter === 'all' ? 'All' : typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("Auto")}>Auto</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("Home")}>Home</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("Life")}>Life</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("Health")}>Health</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("Business")}>Business</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Status: </span>
                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("expired")}>Expired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredPolicies?.map((policy) => (
              <Card key={policy.id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                      <PolicyIcon type={policy.type} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{policy.policyNumber}</CardTitle>
                      <p className="text-xs text-muted-foreground">{policy.carrier}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setPolicyToView(policy)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPolicyToEdit(policy)}>Edit Policy</DropdownMenuItem>
                      <DropdownMenuItem disabled={!isRenewable(policy)} onClick={() => setPolicyToRenew(policy)}>Renew</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setPolicyToDelete(policy)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium truncate max-w-[120px]">
                        {clients?.find(c => c.id === policy.clientId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium</span>
                      <span className="font-medium">${Number(policy.premium).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{format(new Date(policy.expirationDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <StatusBadge status={policy.status} />
                    <div className="text-xs text-muted-foreground">
                      {policy.type}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {!isLoading && filteredPolicies?.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              No policies found matching your search.
            </div>
          )}
        </div>

        <CreatePolicyDialog 
          open={!!policyToEdit} 
          onOpenChange={(open) => !open && setPolicyToEdit(null)}
          policy={policyToEdit || undefined}
        />

        <PolicyDetailsDialog 
          open={!!policyToView}
          onOpenChange={(open) => !open && setPolicyToView(null)}
          policy={policyToView}
        />

        <AlertDialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(null)}>
          <AlertDialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!policyToRenew} onOpenChange={(open) => !open && setPolicyToRenew(null)}>
          <AlertDialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
            <AlertDialogHeader>
              <AlertDialogTitle>Renew Policy?</AlertDialogTitle>
              <AlertDialogDescription>
                This will extend the policy expiration date by 1 year.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRenew}>Confirm Renewal</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
