import Layout from "@/components/Layout";
import { useData } from "@/lib/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyDetailsDialog } from "@/components/PolicyDetailsDialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Filter, MoreHorizontal, Car, Home, Heart, Briefcase, Activity } from "lucide-react";
import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useSearch } from "wouter";

const PolicyIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'auto': return <Car className="h-4 w-4" />;
    case 'home': return <Home className="h-4 w-4" />;
    case 'life': return <Heart className="h-4 w-4" />;
    case 'business': return <Briefcase className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

function CreatePolicyDialog({ open: controlledOpen, onOpenChange: setControlledOpen, policy }: { open?: boolean; onOpenChange?: (open: boolean) => void; policy?: Policy }) {
  const { addPolicy, updatePolicy, clients } = useData();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [formData, setFormData] = useState({
    policyNumber: "",
    carrier: "",
    type: "Auto",
    premium: "",
    startDate: new Date().toISOString().split('T')[0],
    expirationDate: "",
    clientId: "",
    status: "active"
  });
  const [paymentType, setPaymentType] = useState("full");

  useEffect(() => {
    if (open) {
      if (policy) {
        setFormData({
          policyNumber: policy.policyNumber,
          carrier: policy.carrier,
          type: policy.type,
          premium: policy.premium.toString(),
          startDate: policy.startDate.split('T')[0],
          expirationDate: policy.expirationDate.split('T')[0],
          clientId: policy.clientId,
          status: policy.status
        });
        setPaymentType("full");
      } else {
        setFormData({
          policyNumber: "",
          carrier: "",
          type: "Auto",
          premium: "",
          startDate: new Date().toISOString().split('T')[0],
          expirationDate: "",
          clientId: "",
          status: "active"
        });
        setPaymentType("full");
      }
    }
  }, [open, policy]);

  useEffect(() => {
    if (!policy && formData.startDate) {
      const start = new Date(formData.startDate);
      const exp = new Date(start);
      if (paymentType === "installments") {
        exp.setMonth(exp.getMonth() + 1);
      } else {
        exp.setFullYear(exp.getFullYear() + 1);
      }
      setFormData(prev => ({ ...prev, expirationDate: exp.toISOString().split('T')[0] }));
    }
  }, [paymentType, formData.startDate, policy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      premium: parseFloat(formData.premium),
      startDate: new Date(formData.startDate).toISOString(),
      expirationDate: new Date(formData.expirationDate).toISOString(),
    };

    if (policy) {
      await updatePolicy(policy.id, data);
    } else {
      await addPolicy(data);
    }
    if (setOpen) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>Create Policy</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Policy" : "Create Policy"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input id="policyNumber" required value={formData.policyNumber} onChange={e => setFormData({...formData, policyNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Input id="carrier" required value={formData.carrier} onChange={e => setFormData({...formData, carrier: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Life">Life</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="premium">Premium</Label>
              <Input id="premium" type="number" required value={formData.premium} onChange={e => setFormData({...formData, premium: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={formData.clientId} onValueChange={v => setFormData({...formData, clientId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!policy && (
            <div className="space-y-3 border rounded-md p-3 bg-muted/20">
              <Label>Payment Terms</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="full" 
                    name="paymentType" 
                    value="full" 
                    checked={paymentType === "full"} 
                    onChange={() => setPaymentType("full")}
                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                  />
                  <Label htmlFor="full" className="font-normal">Pay in Full (1 Year Coverage)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="installments" 
                    name="paymentType" 
                    value="installments" 
                    checked={paymentType === "installments"} 
                    onChange={() => setPaymentType("installments")}
                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                  />
                  <Label htmlFor="installments" className="font-normal">Pay with Instalments (1 Month Coverage)</Label>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input id="expirationDate" type="date" required value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Save Policy</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Policies() {
  const search = useSearch();
  const { policies, clients, isLoading, updatePolicy, deletePolicy } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [policyToEdit, setPolicyToEdit] = useState<Policy | undefined>();
  const [policyToDelete, setPolicyToDelete] = useState<Policy | undefined>();
  const [policyToView, setPolicyToView] = useState<Policy | undefined>();
  const [policyToRenew, setPolicyToRenew] = useState<Policy | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const policyId = params.get("policyId");
    if (policyId && policies.length > 0) {
      const policy = policies.find(p => p.id === policyId);
      if (policy) {
        setPolicyToView(policy);
      }
    }
  }, [search, policies]);

  const filteredPolicies = policies?.filter(policy => {
    const matchesSearch = policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || policy.type === typeFilter;
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  })?.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  const handleDelete = async () => {
    if (policyToDelete) {
      await deletePolicy(policyToDelete.id);
      setPolicyToDelete(undefined);
    }
  };

  const handleRenew = async () => {
    if (policyToRenew) {
      // Extend by 1 year
      const currentExp = new Date(policyToRenew.expirationDate);
      const newExp = new Date(currentExp.setFullYear(currentExp.getFullYear() + 1));
      
      await updatePolicy(policyToRenew.id, { expirationDate: newExp.toISOString().split('T')[0] });
      setPolicyToRenew(undefined);
    }
  };

  const isRenewable = (policy: Policy) => {
    const expirationDate = new Date(policy.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

  const headerSearch = (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search policies..." 
          className="pl-9 border-none bg-secondary/50 focus-visible:ring-0 h-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9">
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
          <Button variant="outline" size="sm" className="gap-2 h-9">
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
  );

  return (
    <Layout headerContent={headerSearch}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
            <p className="text-muted-foreground">Manage and track insurance policies.</p>
          </div>
          <CreatePolicyDialog />
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
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
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
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="grid gap-1 sm:gap-2 text-sm mb-2 sm:mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium truncate max-w-[120px]">
                        {clients?.find(c => c.id === policy.clientId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium</span>
                      <span className="font-medium">Kes {Number(policy.premium).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{format(new Date(policy.expirationDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 sm:pt-4">
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
          onOpenChange={(open) => !open && setPolicyToEdit(undefined)}
          policy={policyToEdit}
        />

        <PolicyDetailsDialog 
          open={!!policyToView}
          onOpenChange={(open) => !open && setPolicyToView(undefined)}
          policy={policyToView ?? null}
        />

        <AlertDialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(undefined)}>
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

        <AlertDialog open={!!policyToRenew} onOpenChange={(open) => !open && setPolicyToRenew(undefined)}>
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
