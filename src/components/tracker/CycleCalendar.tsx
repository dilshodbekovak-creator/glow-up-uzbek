import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  isSameDay,
} from "date-fns";
import { getDayPhase, type PeriodEntry, type PhaseInfo } from "./cycleUtils";

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const monthNames: Record<number, string> = {
  0: "Yanvar",
  1: "Fevral",
  2: "Mart",
  3: "Aprel",
  4: "May",
  5: "Iyun",
  6: "Iyul",
  7: "Avgust",
  8: "Sentyabr",
  9: "Oktyabr",
  10: "Noyabr",
  11: "Dekabr",
};

const phaseStyles: Record<string, { bg: string; text: string; ring?: string }> = {
  menstruation: { bg: "bg-cycle-menstruation", text: "text-white" },
  follicular: { bg: "bg-cycle-follicular", text: "text-foreground" },
  ovulation: { bg: "bg-cycle-ovulation", text: "text-white" },
  luteal: { bg: "bg-cycle-luteal", text: "text-white" },
  predicted: { bg: "bg-cycle-predicted", text: "text-foreground", ring: "ring-1 ring-cycle-predicted" },
};

interface CycleCalendarProps {
  periods: PeriodEntry[];
  onDayClick: (day: Date, info: PhaseInfo | null) => void;
}

const CycleCalendar = ({ periods, onDayClick }: CycleCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const offset = startDay === 0 ? 6 : startDay - 1;

  // Pre-compute phases for all days in the month
  const dayPhases = useMemo(() => {
    const map = new Map<string, PhaseInfo | null>();
    for (const day of days) {
      map.set(day.toISOString(), getDayPhase(day, periods));
    }
    return map;
  }, [days, periods]);

  const goToPrev = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setDirection(0);
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day: Date) => {
    const info = dayPhases.get(day.toISOString()) ?? null;
    setSelectedDay(day);
    onDayClick(day, info);
  };

  const monthLabel = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      {/* Header with month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrev}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors active:scale-95"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={goToToday}
          className="font-bold text-foreground text-sm hover:text-primary transition-colors"
        >
          {monthLabel}
        </button>

        <button
          onClick={goToNext}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors active:scale-95"
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid with animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-1"
        >
          {/* Empty offset cells */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const phaseInfo = dayPhases.get(day.toISOString()) ?? null;
            const today = isToday(day);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const phase = phaseInfo?.phase ?? null;
            const style = phase ? phaseStyles[phase] : null;

            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-sm font-semibold 
                  transition-all duration-150 relative
                  ${style ? `${style.bg} ${style.text}` : "text-foreground hover:bg-muted"}
                  ${today && !phase ? "ring-2 ring-primary" : ""}
                  ${today && phase ? "ring-2 ring-foreground/30" : ""}
                  ${isSelected ? "ring-2 ring-primary shadow-md scale-105" : ""}
                  ${style?.ring && !isSelected ? style.ring : ""}
                `}
              >
                <span className="relative z-10">{format(day, "d")}</span>
                {today && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Phase summary for current month */}
      <MonthPhaseSummary dayPhases={dayPhases} />
    </motion.div>
  );
};

/** Shows a compact summary of how many days each phase covers this month */
const MonthPhaseSummary = ({
  dayPhases,
}: {
  dayPhases: Map<string, PhaseInfo | null>;
}) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const info of dayPhases.values()) {
      if (info?.phase) {
        c[info.phase] = (c[info.phase] || 0) + 1;
      }
    }
    return c;
  }, [dayPhases]);

  const entries = Object.entries(counts);
  if (entries.length === 0) return null;

  const phaseLabels: Record<string, string> = {
    menstruation: "Hayz",
    follicular: "Follikulyar",
    ovulation: "Ovulyatsiya",
    luteal: "Luteal",
    predicted: "Taxminiy",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 flex flex-wrap gap-2 justify-center"
    >
      {entries.map(([phase, count]) => (
        <div
          key={phase}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
            phaseStyles[phase]?.bg ?? "bg-muted"
          } bg-opacity-20`}
        >
          <div className={`w-2 h-2 rounded-full ${phaseStyles[phase]?.bg ?? "bg-muted"}`} />
          <span className="text-[10px] font-medium text-foreground">
            {phaseLabels[phase] ?? phase}: {count} kun
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default CycleCalendar;
