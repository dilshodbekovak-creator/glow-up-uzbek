import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      const predictedNext = addDays(start, 28);
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
        {/* Next period prediction */}
        {daysUntilNext !== null && daysUntilNext > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glow-rose rounded-2xl p-4 mb-4 text-center"
          >
            <p className="text-sm font-bold text-foreground">
              Keyingi hayzgacha: <span className="text-primary">{daysUntilNext} kun</span>
            </p>
          </motion.div>
        )}

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
      </div>
    </div>
  );
};

export default Tracker;
