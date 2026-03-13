import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addDays, differenceInDays, parseISO } from "date-fns";

import CycleForm from "@/components/tracker/CycleForm";
import CycleCalendar from "@/components/tracker/CycleCalendar";
import CycleLegend from "@/components/tracker/CycleLegend";
import DayInfoPopup from "@/components/tracker/DayInfoPopup";
import type { PeriodEntry, PhaseInfo } from "@/components/tracker/cycleUtils";

const Tracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<PhaseInfo | null>(null);

  const { data: periods = [] } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("period_tracking")
        .select("*")
        .order("start_date", { ascending: false });
      return (data ?? []) as PeriodEntry[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      startDate,
      periodLength,
      cycleLength,
    }: {
      startDate: Date;
      periodLength: number;
      cycleLength: number;
    }) => {
      const endDate = addDays(startDate, periodLength - 1);
      const predictedNext = addDays(startDate, cycleLength);
      const { error } = await supabase.from("period_tracking").insert({
        user_id: user!.id,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        predicted_next_date: format(predictedNext, "yyyy-MM-dd"),
        cycle_length: cycleLength,
        period_length: periodLength,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Hayz davri saqlandi!");
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

  const handleDayClick = (day: Date, info: PhaseInfo | null) => {
    if (info) {
      setSelectedDay(day);
      setSelectedInfo(info);
    } else {
      setSelectedDay(null);
      setSelectedInfo(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 bg-background"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-foreground w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Hayz Sikli Kalendari</h1>
          <p className="text-[10px] text-muted-foreground">Siklni kuzatib boring</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Form */}
        <CycleForm onSubmit={(d) => saveMutation.mutate(d)} isLoading={saveMutation.isPending} />

        {/* Legend */}
        <CycleLegend />

        {/* Calendar */}
        <CycleCalendar periods={periods} onDayClick={handleDayClick} />

        {/* Day info popup */}
        <DayInfoPopup
          day={selectedDay}
          info={selectedInfo}
          onClose={() => { setSelectedDay(null); setSelectedInfo(null); }}
          onSaveActual={(day) => {
            const lastPeriod = periods[0];
            const periodLength = lastPeriod?.period_length || 5;
            const cycleLength = lastPeriod?.cycle_length || 28;
            saveMutation.mutate({ startDate: day, periodLength, cycleLength });
            setSelectedDay(null);
            setSelectedInfo(null);
          }}
        />

        {/* Saved periods */}
        {periods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-4 shadow-card"
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
                    className="flex items-center justify-between bg-muted rounded-xl px-4 min-h-[48px]"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(parseISO(p.start_date), "dd.MM.yyyy")}
                        {p.end_date && ` — ${format(parseISO(p.end_date), "dd.MM.yyyy")}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.period_length || 5} kun hayz · {p.cycle_length || 28} kunlik sikl
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"
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
