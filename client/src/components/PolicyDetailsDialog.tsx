import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Policy, useData } from "@/lib/DataContext";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

interface PolicyDetailsDialogProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PolicyDetailsDialog({ policy, open, onOpenChange }: PolicyDetailsDialogProps) {
  const { clients } = useData();

  if (!policy) return null;

  const client = clients.find(c => c.id === policy.clientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
        <DialogHeader>
          <DialogTitle>Policy Details</DialogTitle>
          <DialogDescription>Detailed information for policy {policy.policyNumber}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={policy.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Premium</p>
              <p className="text-xl font-bold">${Number(policy.premium).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Carrier</h4>
              <p className="text-sm font-medium mt-1">{policy.carrier}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
              <p className="text-sm font-medium mt-1">{policy.type}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
              <p className="text-sm mt-1">{format(new Date(policy.startDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Expiration Date</h4>
              <p className="text-sm mt-1">{format(new Date(policy.expirationDate), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h4>
            {client ? (
              <div className="rounded-lg border p-3 bg-muted/20">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Client not found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}