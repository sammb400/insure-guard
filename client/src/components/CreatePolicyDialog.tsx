import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPolicySchema } from "@shared/schema";
import { useData } from "@/lib/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Policy } from "@/lib/DataContext";

// Enhance schema with coercion for numeric/date strings from form inputs
const formSchema = insertPolicySchema.extend({
  clientId: z.string(),
  premium: z.coerce.number(), // premium is decimal in DB, but simplified to number here
  startDate: z.string(),
  expirationDate: z.string(),
});

interface CreatePolicyDialogProps {
  policy?: Policy;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePolicyDialog({ policy, open: controlledOpen, onOpenChange }: CreatePolicyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const { clients, addPolicy, updatePolicy } = useData();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Auto",
      carrier: "",
      status: "active",
      policyNumber: "",
      premium: 0,
      clientId: "",
      startDate: "",
      expirationDate: "",
    }
  });

  useEffect(() => {
    if (policy) {
      form.reset({
        type: policy.type,
        carrier: policy.carrier,
        status: policy.status,
        policyNumber: policy.policyNumber,
        premium: Number(policy.premium),
        clientId: policy.clientId,
        startDate: policy.startDate,
        expirationDate: policy.expirationDate,
      });
    } else {
      form.reset({
        type: "Auto",
        carrier: "",
        status: "active",
        policyNumber: "",
        premium: 0,
        clientId: "",
        startDate: "",
        expirationDate: "",
      });
    }
  }, [policy, open, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const payload = {
        ...data, 
        premium: String(data.premium)
      } as any;

      if (policy) {
        await updatePolicy(policy.id, payload);
        toast({ title: "Success", description: "Policy updated successfully" });
      } else {
        await addPolicy(payload);
        toast({ title: "Success", description: "Policy created successfully" });
      }
      setOpen && setOpen(false);
      if (!policy) form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : `Failed to ${policy ? 'update' : 'create'} policy`,
        variant: "destructive" 
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!policy && (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Policy" : "Add New Policy"}</DialogTitle>
          <DialogDescription>{policy ? "Update policy details." : "Enter the details of the new policy here."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="POL-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Life">Life</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <FormControl>
                    <Input placeholder="Insurance Co." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="premium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Premium ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (policy ? "Updating..." : "Creating...") : (policy ? "Update Policy" : "Create Policy")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
