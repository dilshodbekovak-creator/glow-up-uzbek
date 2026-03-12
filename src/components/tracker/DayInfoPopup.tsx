import { format } from "date-fns";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PhaseInfo } from "./cycleUtils";

interface DayInfoPopupProps {
  day: Date | null;
  info: PhaseInfo | null;
  onClose: () => void;
}

const phaseEmojis: Record<string, string> = {
  menstruation: "🩸",
  follicular: "🌱",
  ovulation: "🥚",
  luteal: "🌙",
  predicted: "🔮",
};

const DayInfoPopup = ({ day, info, onClose }: DayInfoPopupProps) => (
  <AnimatePresence>
    {day && info && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="bg-card rounded-2xl p-5 shadow-card border border-border relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X size={14} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center text-lg`}>
            {phaseEmojis[info.phase ?? ""] ?? "📅"}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{info.label}</p>
            <p className="text-[10px] text-muted-foreground">{format(day, "dd MMMM yyyy")}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>

        {info.isPredicted && (
          <div className="mt-3 bg-cycle-predicted/30 rounded-xl px-3 py-2">
            <p className="text-[10px] text-muted-foreground font-medium">
              ⚠️ Bu kun faqat taxminiy hisob asosida ko'rsatilgan
            </p>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default DayInfoPopup;
