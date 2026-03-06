import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from "date-fns";

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const Tracker = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const offset = startDay === 0 ? 6 : startDay - 1;

  const toggleDate = (date: Date) => {
    setSelectedDates((prev) => {
      const exists = prev.find((d) => isSameDay(d, date));
      if (exists) return prev.filter((d) => !isSameDay(d, date));
      return [...prev, date];
    });
  };

  const isSelected = (date: Date) => selectedDates.some((d) => isSameDay(d, date));

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Hayz kalendari</h1>
      </div>

      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          {/* Month nav */}
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

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => toggleDate(day)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                    ${selected ? "gradient-warm text-primary-foreground shadow-soft" : ""}
                    ${today && !selected ? "ring-2 ring-primary/30" : ""}
                    ${!selected ? "text-foreground hover:bg-muted" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-glow-rose rounded-2xl p-4 flex items-start gap-3"
        >
          <Droplets size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-foreground">Kunlarni belgilang</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hayz kunlaringizni belgilab boring. Bu sizga siklni kuzatishda yordam beradi.
              Ma'lumotlaringiz faqat shu qurilmada saqlanadi.
            </p>
          </div>
        </motion.div>

        {selectedDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="font-bold text-sm text-foreground mb-2">Belgilangan kunlar</h3>
            <p className="text-sm text-primary font-semibold">
              {selectedDates.length} kun belgilangan
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tracker;
