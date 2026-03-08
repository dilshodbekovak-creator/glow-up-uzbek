import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, ArrowRight, Play } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const cycleInsights: Record<string, { range: [number, number]; message: string }[]> = {
  default: [
    { range: [1, 5], message: "Hayz davri. Tanangizga dam bering va iliq ichimliklar iching. 🌸" },
    { range: [6, 12], message: "Follikulyar faza. Energiya oshib bormoqda, yangi narsalarni boshlash uchun yaxshi vaqt! 💪" },
    { range: [13, 16], message: "Ovulatsiya davri. Eng yuqori energiya davrida ekansiz! ✨" },
    { range: [17, 24], message: "Luteal faza boshi. Hali yaxshi energiya bor, lekin tanangizni tinglang. 🧘" },
    { range: [25, 35], message: "Sikl oxiri yaqinlashmoqda. Energiya pasayishi mumkin. Temirga boy ovqatlar foydali. 🍃" },
  ],
};

const getCycleInsight = (cycleDay: number | null): string => {
  if (!cycleDay || cycleDay < 1) return "Sikl ma'lumotlarini kiritish uchun kalendarga o'ting.";
  const insight = cycleInsights.default.find(i => cycleDay >= i.range[0] && cycleDay <= i.range[1]);
  return insight ? `Bugun siklning ${cycleDay}-kuni. ${insight.message}` : "Sikl ma'lumotlarini yangilang.";
};

const Index = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: completedCount } = useQuery({
    queryKey: ["completed-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("completed_lessons")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: totalLessons } = useQuery({
    queryKey: ["total-lessons"],
    queryFn: async () => {
      const { count } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: lessonCounts } = useQuery({
    queryKey: ["lesson-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("module_id");
      const counts: Record<string, number> = {};
      data?.forEach((l) => {
        counts[l.module_id] = (counts[l.module_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Get latest incomplete lesson for "continue learning"
  const { data: continueLesson } = useQuery({
    queryKey: ["continue-lesson"],
    queryFn: async () => {
      const { data: completed } = await supabase.from("completed_lessons").select("lesson_id");
      const completedIds = completed?.map(c => c.lesson_id) ?? [];
      const { data: allLessons } = await supabase.from("lessons").select("*, modules(title, emoji)").order("sort_order");
      const next = allLessons?.find(l => !completedIds.includes(l.id));
      return next ?? null;
    },
  });

  // Cycle insight
  const { data: latestPeriod } = useQuery({
    queryKey: ["latest-period"],
    queryFn: async () => {
      const { data } = await supabase
        .from("period_tracking")
        .select("*")
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const currentCycleDay = latestPeriod
    ? differenceInDays(new Date(), parseISO(latestPeriod.start_date)) + 1
    : null;

  const progress = totalLessons && totalLessons > 0 ? Math.round(((completedCount ?? 0) / totalLessons) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 gradient-soft"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground font-medium">
          Salom, {profile?.name || "Mehmon"}! ✨
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl font-bold text-foreground leading-tight">
          Porla
        </motion.h1>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Sizning yo'lingiz</h2>
        {completedCount === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-card text-center">
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-sm font-semibold text-foreground">Hali hech narsa tugallanmagan</p>
            <p className="text-xs text-muted-foreground mt-1">Birinchi qadamni qo'ying!</p>
            <button onClick={() => navigate("/modules")} className="mt-3 h-10 px-5 rounded-full gradient-warm text-primary-foreground font-semibold text-sm shadow-soft press-scale">
              Birinchi darsni boshlash
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <p className="text-xs text-muted-foreground">Bajarilgan darslar</p>
              </div>
              <p className="text-2xl font-bold text-primary">{completedCount}</p>
              <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.6, duration: 0.8 }} className="h-full rounded-full gradient-warm" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{progress}% tugallangan</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={14} className="text-warning" />
                <p className="text-xs text-muted-foreground">Barcha darslar</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalLessons ?? 0}</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Continue Learning */}
      {continueLesson && (
        <div className="px-5 mt-5">
          <h2 className="text-lg font-semibold text-foreground mb-3">Davom ettirish</h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/lesson/${continueLesson.id}`)}
            className="bg-card rounded-2xl p-4 shadow-card cursor-pointer press-scale-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                <Play size={18} className="text-primary-foreground ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{(continueLesson as any)?.modules?.emoji} {(continueLesson as any)?.modules?.title}</p>
                <h3 className="font-semibold text-sm text-foreground leading-tight mt-0.5 truncate">{continueLesson.title}</h3>
              </div>
              <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Daily Cycle Insight */}
      <div className="px-5 mt-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-secondary/40 rounded-2xl p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Kunlik maslahat</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getCycleInsight(currentCycleDay)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Course preview cards */}
      <div className="px-5 mt-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">Kurslar</h2>
        <div className="grid gap-3">
          {modules?.slice(0, 3).map((mod, i) => {
            const lessonCount = lessonCounts?.[mod.id] ?? 0;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => navigate(`/modules/${mod.id}`)}
                className="bg-card rounded-2xl p-4 shadow-card cursor-pointer press-scale-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                    {mod.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{lessonCount} dars</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/50" />
                </div>
              </motion.div>
            );
          })}
        </div>
        {modules && modules.length > 3 && (
          <button onClick={() => navigate("/modules")} className="w-full mt-3 h-10 rounded-full border border-border text-sm font-semibold text-muted-foreground press-scale">
            Barcha kurslarni ko'rish
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Index;
