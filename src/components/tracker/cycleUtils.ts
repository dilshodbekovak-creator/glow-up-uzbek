import { addDays, differenceInDays, parseISO, isWithinInterval, isBefore, startOfDay } from "date-fns";

export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal" | "predicted" | null;

export interface PeriodEntry {
  id: string;
  start_date: string;
  end_date: string | null;
  predicted_next_date: string | null;
  cycle_length: number;
  period_length: number;
}

export interface PhaseInfo {
  phase: CyclePhase;
  label: string;
  description: string;
  color: string;
  isPredicted?: boolean;
}

export const PHASE_INFO: Record<string, Omit<PhaseInfo, "phase" | "isPredicted">> = {
  menstruation: {
    label: "Hayz davri",
    description: "Bachadon ichki qavati ajralib chiqadigan davr. Bu tabiiy jarayon bo'lib, odatda 3-7 kun davom etadi.",
    color: "bg-cycle-menstruation",
  },
  follicular: {
    label: "Follikulyar faza",
    description: "Ovulyatsiyaga tayyorgarlik bosqichi. Gormonlar ta'sirida tuxumdon follikullari o'sa boshlaydi.",
    color: "bg-cycle-follicular",
  },
  ovulation: {
    label: "Ovulyatsiya",
    description: "Tuxum hujayra tuxumdondan ajralib chiqadigan davr. Homiladorlik ehtimoli eng yuqori bo'lgan kunlar.",
    color: "bg-cycle-ovulation",
  },
  luteal: {
    label: "Luteal faza",
    description: "Ovulyatsiyadan keyingi bosqich. Progesteron gormoni ko'payadi va tana keyingi hayzga tayyorlanadi.",
    color: "bg-cycle-luteal",
  },
  predicted: {
    label: "Taxminiy hayz",
    description: "Bu kunlar faqat taxminiy hisobga asoslangan. Aniq emas — haqiqiy hayz boshlanishi farq qilishi mumkin.",
    color: "bg-cycle-predicted",
  },
};

export function getPhaseForDay(
  dayInCycle: number,
  periodLength: number,
  cycleLength: number
): CyclePhase {
  if (dayInCycle < 1 || dayInCycle > cycleLength) return null;
  if (dayInCycle <= periodLength) return "menstruation";
  
  const ovulationDay = cycleLength - 14;
  if (dayInCycle <= ovulationDay - 2) return "follicular";
  if (dayInCycle <= ovulationDay + 1) return "ovulation";
  return "luteal";
}

export function getDayPhase(
  day: Date,
  periods: PeriodEntry[]
): PhaseInfo | null {
  const today = startOfDay(new Date());
  const target = startOfDay(day);

  for (const period of periods) {
    const start = parseISO(period.start_date);
    const periodLength = period.period_length || 5;
    const cycleLength = period.cycle_length || 28;
    const end = addDays(start, cycleLength - 1);

    // Check if day is within this cycle's range
    if (isWithinInterval(target, { start, end })) {
      const dayInCycle = differenceInDays(target, start) + 1;
      const phase = getPhaseForDay(dayInCycle, periodLength, cycleLength);
      if (phase) {
        const info = PHASE_INFO[phase];
        return { phase, ...info, isPredicted: false };
      }
    }

    // Check predicted next period (future months only show menstruation)
    if (period.predicted_next_date) {
      const predStart = parseISO(period.predicted_next_date);
      const predEnd = addDays(predStart, periodLength - 1);

      if (isWithinInterval(target, { start: predStart, end: predEnd })) {
        // Future → only show predicted period
        if (!isBefore(target, today)) {
          return {
            phase: "predicted",
            ...PHASE_INFO.predicted,
            isPredicted: true,
          };
        }
      }

      // For predicted cycles further out, generate additional predictions
      for (let i = 1; i <= 6; i++) {
        const futureStart = addDays(predStart, cycleLength * i);
        const futureEnd = addDays(futureStart, periodLength - 1);
        if (isWithinInterval(target, { start: futureStart, end: futureEnd })) {
          if (!isBefore(target, today)) {
            return {
              phase: "predicted",
              ...PHASE_INFO.predicted,
              isPredicted: true,
            };
          }
        }
      }
    }
  }

  return null;
}
