import Layout from "@/components/Layout";
import { useData } from "@/lib/DataContext";
import { CreateClientDialog } from "@/components/CreateClientDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClientDetailsDialog } from "@/components/ClientDetailsDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Client } from "@/lib/DataContext";

export default function Clients() {
  const { clients, policies, isLoading, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToView, setClientToView] = useState<Client | null>(null);

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (client.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships.</p>
          </div>
          <CreateClientDialog />
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search clients..." 
              className="pl-9 border-none bg-secondary/50 focus-visible:ring-0" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
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
            filteredClients?.map((client) => (
              <Card key={client.id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={client.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">{client.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">ID: {client.id}</p>
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
                      <DropdownMenuItem onClick={() => setClientToView(client)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setClientToEdit(client)}>Edit Client</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setClientToDelete(client)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <StatusBadge status={client.status || 'active'} />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{policies?.filter(p => p.clientId === client.id).length || 0}</span> Policies
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {!isLoading && filteredClients?.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              No clients found matching your search.
            </div>
          )}
        </div>

        <CreateClientDialog 
          open={!!clientToEdit} 
          onOpenChange={(open) => !open && setClientToEdit(null)}
          client={clientToEdit || undefined}
        />

        <ClientDetailsDialog 
          open={!!clientToView}
          onOpenChange={(open) => !open && setClientToView(null)}
          client={clientToView}
        />

        <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
          <AlertDialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the client
                and remove their data from our servers.
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
      </div>
    </Layout>
  );
}
