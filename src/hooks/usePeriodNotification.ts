import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

export function usePeriodNotification() {
  const { data: periods } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("period_tracking")
        .select("*")
        .order("start_date", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!periods || periods.length === 0) return;

    const latest = periods[0];
    if (!latest.predicted_next_date) return;

    const daysUntil = differenceInDays(parseISO(latest.predicted_next_date), new Date());

    if (daysUntil <= 2 && daysUntil >= 0) {
      const message =
        daysUntil === 0
          ? "Bugun taxminiy hayz boshlanish kuni! 🌸"
          : daysUntil === 1
          ? "Ertaga taxminiy hayz boshlanishi kutilmoqda 🌸"
          : "2 kundan so'ng taxminiy hayz boshlanishi kutilmoqda 🌸";

      // In-app toast
      toast.info(message, { duration: 6000 });

      // Browser notification
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Glow - Hayz eslatmasi", { body: message, icon: "/favicon.ico" });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification("Glow - Hayz eslatmasi", { body: message, icon: "/favicon.ico" });
            }
          });
        }
      }
    }
  }, [periods]);
}
