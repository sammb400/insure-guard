import { useEffect } from "react";
// @ts-ignore
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export function ReloadPrompt() {
  const { toast } = useToast();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error: any) {
      console.error("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "Update Available",
        description: "A new version of the app is available. Update now to get the latest features.",
        action: (
          <ToastAction altText="Update" onClick={() => updateServiceWorker(true)}>
            Update
          </ToastAction>
        ),
        duration: Infinity,
      });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const deferredPrompt = e as any;
      
      toast({
        title: "Install App",
        description: "Install InsureGuard to your home screen for the best experience.",
        action: (
          <ToastAction altText="Install" onClick={() => deferredPrompt.prompt()}>
            Install
          </ToastAction>
        ),
      });
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [toast]);

  return null;
}