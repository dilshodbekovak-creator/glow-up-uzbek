import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from "date-fns";
import { getDayPhase, type PeriodEntry, type PhaseInfo } from "./cycleUtils";

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const phaseColorMap: Record<string, string> = {
  menstruation: "bg-cycle-menstruation text-white",
  follicular: "bg-cycle-follicular text-foreground",
  ovulation: "bg-cycle-ovulation text-white",
  luteal: "bg-cycle-luteal text-white",
  predicted: "bg-cycle-predicted text-foreground",
};

interface CycleCalendarProps {
  periods: PeriodEntry[];
  onDayClick: (day: Date, info: PhaseInfo | null) => void;
}

const CycleCalendar = ({ periods, onDayClick }: CycleCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const offset = startDay === 0 ? 6 : startDay - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>
        <h2 className="font-bold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {days.map((day) => {
          const phaseInfo = getDayPhase(day, periods);
          const today = isToday(day);
          const phaseClass = phaseInfo ? phaseColorMap[phaseInfo.phase ?? ""] ?? "" : "";

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day, phaseInfo)}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                ${phaseClass}
                ${today && !phaseInfo ? "ring-2 ring-primary bg-transparent" : ""}
                ${today && phaseInfo ? "ring-2 ring-foreground/30" : ""}
                ${!phaseInfo && !today ? "text-foreground hover:bg-muted" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CycleCalendar;
