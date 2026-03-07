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

  // Calculate current cycle day
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
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Hayz kalendari</h1>
      </div>

      <div className="px-5">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {daysUntilNext !== null && daysUntilNext > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-glow-rose rounded-2xl p-4 text-center"
            >
              <p className="text-[10px] text-muted-foreground font-medium mb-1">Keyingi hayzgacha</p>
              <p className="text-2xl font-extrabold text-primary">{daysUntilNext}</p>
              <p className="text-[10px] text-muted-foreground">kun</p>
            </motion.div>
          )}
          {isInCycleRange && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-2xl p-4 text-center shadow-card"
            >
              <p className="text-[10px] text-muted-foreground font-medium mb-1">Sikl kuni</p>
              <p className="text-2xl font-extrabold text-foreground">{currentCycleDay}</p>
              <p className="text-[10px] text-muted-foreground">{cycleLength} kunlik sikldan</p>
            </motion.div>
          )}
        </div>

        {/* Cycle length selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl p-4 mb-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Sikl uzunligi</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCycleLength(Math.max(28, cycleLength - 1))}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <Minus size={14} className="text-foreground" />
              </button>
              <span className="text-lg font-extrabold text-primary w-8 text-center">{cycleLength}</span>
              <button
                onClick={() => setCycleLength(Math.min(35, cycleLength + 1))}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <Plus size={14} className="text-foreground" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">28–35 kun orasida</p>
        </motion.div>

        {/* Tap instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-center"
        >
          <p className="text-xs text-muted-foreground font-medium">
            {tapState === "idle"
              ? "Hayz boshlanish kunini tanlang"
              : "Endi tugash kunini tanlang"}
          </p>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={20} className="text-muted-foreground" />
            </button>
            <h2 className="font-bold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground">
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
                    ${inPeriod ? "bg-primary text-primary-foreground shadow-soft" : ""}
                    ${predicted && !inPeriod ? "bg-glow-rose text-foreground" : ""}
                    ${isStart ? "ring-2 ring-primary" : ""}
                    ${today && !inPeriod && !predicted ? "ring-2 ring-foreground/30" : ""}
                    ${!inPeriod && !predicted ? "text-foreground hover:bg-muted" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full gradient-warm" />
              <span className="text-muted-foreground">Hayz kunlari</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-glow-rose" />
              <span className="text-muted-foreground">Taxminiy kunlar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-foreground/30" />
              <span className="text-muted-foreground">Bugun</span>
            </div>
          </div>
        </motion.div>

        {tapState === "start_selected" && (
          <button
            onClick={() => {
              setTapState("idle");
              setSelectedStart(null);
            }}
            className="w-full mt-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
          >
            Bekor qilish
          </button>
        )}

        {/* Saved periods list with delete */}
        {periods && periods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="text-sm font-bold text-foreground mb-3">Saqlangan davrlar</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {periods.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
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
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
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
    </div>
  );
};

export default Tracker;
