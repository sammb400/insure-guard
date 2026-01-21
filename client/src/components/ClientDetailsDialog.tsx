import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Client, useData } from "@/lib/DataContext";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  const { policies } = useData();

  if (!client) return null;

  const clientPolicies = policies.filter(p => p.clientId === client.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>Information and policies for {client.name}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Contact Info</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm">{client.email}</p>
                <p className="text-sm">{client.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Identity</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm">ID: {client.idNumber || "N/A"}</p>
                <p className="text-sm">KRA: {client.kraPin || "N/A"}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Policies ({clientPolicies.length})</h4>
            {clientPolicies.length > 0 ? (
              <div className="space-y-3">
                {clientPolicies.map(policy => (
                  <div key={policy.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{policy.policyNumber}</p>
                      <p className="text-xs text-muted-foreground">{policy.type} - {policy.carrier}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={policy.status} />
                      <p className="text-xs text-muted-foreground mt-1">Exp: {format(new Date(policy.expirationDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No policies found for this client.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}