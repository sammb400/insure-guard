import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useData } from "@/lib/DataContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/lib/DataContext";

interface CreateClientDialogProps {
  client?: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateClientDialog({ client, open: controlledOpen, onOpenChange }: CreateClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const { addClient, updateClient } = useData();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;
  
  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      kraPin: "",
      idNumber: "",
      status: "active",
    }
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        email: client.email,
        phone: client.phone,
        kraPin: client.kraPin || "",
        idNumber: client.idNumber || "",
        status: client.status || "active",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        kraPin: "",
        idNumber: "",
        status: "active",
      });
    }
  }, [client, open, form]);

  async function onSubmit(data: any) {
    try {
      if (client) {
        await updateClient(client.id, data);
        toast({ title: "Success", description: "Client updated successfully" });
      } else {
        await addClient(data);
        toast({ title: "Success", description: "Client created successfully" });
      }
      setOpen && setOpen(false);
      if (!client) form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : `Failed to ${client ? 'update' : 'create'} client`,
        variant: "destructive" 
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!client && (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>{client ? "Update client details." : "Enter the details of the new client here."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kraPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KRA Pin</FormLabel>
                    <FormControl>
                      <Input placeholder="A000..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (client ? "Updating..." : "Creating...") : (client ? "Update Client" : "Create Client")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
