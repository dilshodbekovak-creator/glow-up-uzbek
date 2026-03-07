import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, ArrowRight } from "lucide-react";

const moduleColors = [
  "bg-porla-petal",
  "bg-accent",
  "bg-secondary/30",
];

const moduleNewTexts: Record<string, string> = {};

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

  const progress = totalLessons && totalLessons > 0 ? Math.round(((completedCount ?? 0) / totalLessons) * 100) : 0;

  const renamedTitles: Record<string, string> = {
    "Hayz Sikli Ilmi": "Sikl va tanani anglash",
    "Sog'liq va Gigiyena": "Sog'lom turmush asoslari",
    "Psixologiya": "Ichki dunyo va ruhiyat",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 gradient-soft"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground font-medium"
        >
          Salom, {profile?.name || "Mehmon"}! ✨
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-foreground leading-tight"
        >
          Porla
        </motion.h1>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-5 rounded-2xl gradient-warm p-6 shadow-soft relative overflow-hidden"
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-4 w-20 h-20 rounded-full border-2 border-primary-foreground/40" />
          <div className="absolute bottom-3 left-6 w-12 h-12 rounded-full border border-primary-foreground/30" />
          <div className="absolute top-8 left-20 w-6 h-6 rounded-full bg-primary-foreground/20" />
        </div>
        <h2 className="text-lg font-bold text-primary-foreground leading-snug relative z-10">
          Porla — nur senda yashaydi!
        </h2>
        <p className="text-xs text-primary-foreground/80 mt-1.5 relative z-10">
          Sog'lom hayot yo'lida ishonchli hamrohing
        </p>
        <button
          onClick={() => navigate("/modules")}
          className="mt-4 bg-card text-primary font-semibold text-sm px-5 h-10 rounded-full shadow-card hover:bg-card/90 transition-colors press-scale relative z-10 inline-flex items-center gap-1.5"
        >
          Sayohatni boshlash <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Stats — Sizning yo'lingiz */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-semibold text-foreground mb-3">Sizning yo'lingiz</h2>

        {completedCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-5 shadow-card text-center"
          >
            <div className="text-3xl mb-2">🌱</div>
            <p className="text-sm font-semibold text-foreground">Hali hech narsa tugallanmagan</p>
            <p className="text-xs text-muted-foreground mt-1">Birinchi qadamni qo'ying!</p>
            <button
              onClick={() => navigate("/modules")}
              className="mt-3 h-10 px-5 rounded-[14px] gradient-warm text-primary-foreground font-semibold text-sm shadow-soft press-scale"
            >
              Birinchi darsni boshlash
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-4 shadow-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <p className="text-xs text-muted-foreground">Bajarilgan darslar</p>
              </div>
              <p className="text-2xl font-bold text-primary">{completedCount}</p>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full gradient-warm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{progress}% tugallangan</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl p-4 shadow-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame size={14} className="text-warning" />
                <p className="text-xs text-muted-foreground">Barcha darslar</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalLessons ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-3">🔥 Ketma-ket kunlar: 0</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modules — O'quv yo'llari */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-semibold text-foreground mb-3">O'quv yo'llari</h2>
        <div className="grid gap-3">
          {modules?.map((mod, i) => {
            const lessonCount = lessonCounts?.[mod.id] ?? 0;
            const estimatedMin = lessonCount * 12;
            const displayTitle = renamedTitles[mod.title] || mod.title;
            const isFirst = i === 0;
            const bgColor = moduleColors[i % moduleColors.length];

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate(`/modules/${mod.id}`)}
                className={`rounded-2xl p-4 shadow-card cursor-pointer press-scale-sm ${bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-card/60 flex items-center justify-center text-2xl flex-shrink-0">
                    {mod.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-foreground leading-tight">{displayTitle}</h3>
                      {isFirst && (
                        <span className="text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                          Yangi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lessonCount} dars · {estimatedMin} daqiqa
                    </p>
                    {isFirst ? (
                      <span className="text-[10px] font-semibold text-success mt-1 inline-block">
                        Bepul boshlash
                      </span>
                    ) : !profile?.is_premium ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-primary-foreground gradient-warm px-2.5 py-0.5 rounded-full">
                        🔒 Pro ✦
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
