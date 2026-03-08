import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Minus, Plus, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePeriodNotification } from "@/hooks/usePeriodNotification";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  differenceInDays,
  getDay,
  isToday,
  isWithinInterval,
  parseISO,
} from "date-fns";

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const Tracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tapState, setTapState] = useState<"idle" | "start_selected">("idle");
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState(28);

  usePeriodNotification();

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

  const saveMutation = useMutation({
    mutationFn: async ({ start, end }: { start: Date; end: Date }) => {
      const predictedNext = addDays(start, cycleLength);
      const { error } = await supabase.from("period_tracking").insert({
        user_id: user!.id,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
        predicted_next_date: format(predictedNext, "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Hayz kunlari saqlandi!");
      setTapState("idle");
      setSelectedStart(null);
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("period_tracking")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("O'chirildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const handleDayTap = (day: Date) => {
    if (tapState === "idle") {
      setSelectedStart(day);
      setTapState("start_selected");
    } else if (tapState === "start_selected" && selectedStart) {
      const diff = differenceInDays(day, selectedStart);
      if (diff < 1 || diff > 10) {
        toast.error("Hayz davri 1-10 kun orasida bo'lishi kerak");
        return;
      }
      saveMutation.mutate({ start: selectedStart, end: day });
    }
  };

  const isInPeriod = (day: Date) => {
    return periods?.some((p) => {
      if (!p.end_date) return isSameDay(parseISO(p.start_date), day);
      return isWithinInterval(day, {
        start: parseISO(p.start_date),
        end: parseISO(p.end_date),
      });
    });
  };

  const isPredicted = (day: Date) => {
    return periods?.some((p) => {
      if (!p.predicted_next_date || !p.end_date) return false;
      const predStart = parseISO(p.predicted_next_date);
      const originalDuration = differenceInDays(parseISO(p.end_date), parseISO(p.start_date));
      const predEnd = addDays(predStart, originalDuration);
      return isWithinInterval(day, { start: predStart, end: predEnd });
    });
  };

  const latestPeriod = periods?.[0];
  const daysUntilNext = latestPeriod?.predicted_next_date
    ? differenceInDays(parseISO(latestPeriod.predicted_next_date), new Date())
    : null;

  const currentCycleDay = latestPeriod
    ? differenceInDays(new Date(), parseISO(latestPeriod.start_date)) + 1
    : null;
  const isInCycleRange = currentCycleDay !== null && currentCycleDay > 0 && currentCycleDay <= cycleLength;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const offset = startDay === 0 ? 6 : startDay - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 bg-background"
    >
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Porla Kalendari</h1>
          <p className="text-[10px] text-muted-foreground">Siklni kuzatib boring</p>
        </div>
        <button
          onClick={() => {
            if ("Notification" in window) {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") toast.success("Bildirishnomalar yoqildi! 🔔");
                else toast.error("Bildirishnomalar rad etildi");
              });
            } else {
              toast.error("Brauzer bildirishnomalarni qo'llab-quvvatlamaydi");
            }
          }}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
          title="Eslatmalarni sozlash"
        >
          <Bell size={18} className="text-foreground" />
        </button>
      </div>

      <div className="px-5">
        {/* Stats cards — always show both */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-porla-peach rounded-2xl p-4 text-center shadow-card"
          >
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Keyingi hayzgacha</p>
            <p className="text-2xl font-bold text-primary">
              {daysUntilNext !== null && daysUntilNext > 0 ? daysUntilNext : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">kun</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-4 text-center shadow-card"
          >
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Sikl kuni</p>
            <p className="text-2xl font-bold text-foreground">
              {isInCycleRange ? currentCycleDay : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">{cycleLength} kunlik sikldan</p>
          </motion.div>
        </div>

        {/* Cycle length selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl p-4 mb-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Sikl uzunligi</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCycleLength(Math.max(28, cycleLength - 1))}
                className="w-11 h-11 rounded-full border-[1.5px] border-primary flex items-center justify-center press-scale"
              >
                <Minus size={16} className="text-primary" />
              </button>
              <span className="text-lg font-bold text-primary w-8 text-center">{cycleLength}</span>
              <button
                onClick={() => setCycleLength(Math.min(35, cycleLength + 1))}
                className="w-11 h-11 rounded-full border-[1.5px] border-primary flex items-center justify-center press-scale"
              >
                <Plus size={16} className="text-primary" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">28–35 kun orasida</p>
        </motion.div>

        {/* Tap instruction */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            {tapState === "idle"
              ? "Hayz boshlanish kunini tanlang"
              : "Endi tugash kunini tanlang"}
          </p>
        </motion.div>

        {/* Legend — above calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3"
        >
          <div className="flex items-center justify-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Hayz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-porla-peach" />
              <span className="text-muted-foreground">Taxminiy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-primary bg-transparent" />
              <span className="text-muted-foreground">Bugun</span>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ minHeight: 44, minWidth: 44 }} className="flex items-center justify-center">
              <ChevronLeft size={20} className="text-muted-foreground" />
            </button>
            <h2 className="font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ minHeight: 44, minWidth: 44 }} className="flex items-center justify-center">
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((day) => {
              const inPeriod = isInPeriod(day);
              const predicted = isPredicted(day);
              const today = isToday(day);
              const isStart = selectedStart && isSameDay(day, selectedStart);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayTap(day)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                    ${inPeriod ? "bg-destructive text-destructive-foreground shadow-soft" : ""}
                    ${predicted && !inPeriod ? "bg-porla-peach text-foreground" : ""}
                    ${isStart ? "ring-2 ring-primary" : ""}
                    ${today && !inPeriod && !predicted ? "ring-2 ring-primary bg-transparent" : ""}
                    ${!inPeriod && !predicted && !today ? "text-foreground hover:bg-muted" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </motion.div>

        {tapState === "start_selected" && (
          <button
            onClick={() => {
              setTapState("idle");
              setSelectedStart(null);
            }}
            className="w-full mt-3 h-11 rounded-[14px] bg-muted text-muted-foreground text-sm font-medium press-scale"
          >
            Bekor qilish
          </button>
        )}

        {/* Saved periods */}
        {periods && periods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">Saqlangan davrlar</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {periods.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between bg-muted rounded-xl px-4"
                    style={{ minHeight: 48 }}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(parseISO(p.start_date), "dd.MM.yyyy")}
                        {p.end_date && ` — ${format(parseISO(p.end_date), "dd.MM.yyyy")}`}
                      </p>
                      {p.end_date && (
                        <p className="text-[10px] text-muted-foreground">
                          {differenceInDays(parseISO(p.end_date), parseISO(p.start_date)) + 1} kun
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="w-10 h-10 rounded-[10px] bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Tracker;
