import Layout from "@/components/Layout";
import { usePolicies } from "@/hooks/use-policies";
import { CreatePolicyDialog } from "@/components/CreatePolicyDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { data: policies, isLoading } = usePolicies();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolicies = policies?.filter(policy => 
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Type
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Status
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredPolicies?.map((policy) => (
                  <TableRow key={policy.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-primary">
                      {policy.policyNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PolicyIcon type={policy.type} />
                        <span>{policy.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{policy.carrier}</TableCell>
                    <TableCell>${Number(policy.premium).toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(policy.expirationDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <StatusBadge status={policy.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Policy</DropdownMenuItem>
                          <DropdownMenuItem>Renew</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && filteredPolicies?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No policies found matching your search.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
