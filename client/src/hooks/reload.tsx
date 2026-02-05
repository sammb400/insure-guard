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
    onRegistered(r: any) {
      if (r) {
        // Check for updates every hour
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh) {
      const lastPrompted = localStorage.getItem("lastUpdatePrompt");
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (!lastPrompted || now - parseInt(lastPrompted, 10) > oneDay) {
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
        localStorage.setItem("lastUpdatePrompt", now.toString());
      }
    }
  }, [needRefresh, toast, updateServiceWorker]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const deferredPrompt = e as any;

      const lastPrompted = localStorage.getItem("lastInstallPrompt");
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (!lastPrompted || now - parseInt(lastPrompted, 10) > oneDay) {
        toast({
          title: "Install App",
          description: "Install InsureGuard to your home screen for the best experience.",
          action: (
            <ToastAction altText="Install" onClick={() => deferredPrompt.prompt()}>
              Install
            </ToastAction>
          ),
        });
        localStorage.setItem("lastInstallPrompt", now.toString());
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [toast]);

  return null;
}