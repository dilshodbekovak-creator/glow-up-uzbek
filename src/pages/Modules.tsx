import { motion } from "framer-motion";
import { ArrowLeft, Play, Lock, Shield, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Module 1 and 2 have free first lessons
const FREE_LESSON_MODULE_INDICES = [0, 1];

const ModuleDetail = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { profile } = useAuth();

  const { data: module } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("*").eq("id", moduleId!).single();
      return data;
    },
    enabled: !!moduleId,
  });

  const { data: allModules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const moduleIndex = allModules?.findIndex(m => m.id === moduleId) ?? -1;
  const hasFreeLesson = FREE_LESSON_MODULE_INDICES.includes(moduleIndex);

  const { data: lessons } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").eq("module_id", moduleId!).order("sort_order");
      return data ?? [];
    },
    enabled: !!moduleId,
  });

  const { data: completedLessons } = useQuery({
    queryKey: ["completed-lessons", moduleId],
    queryFn: async () => {
      const lessonIds = lessons?.map((l) => l.id) ?? [];
      if (lessonIds.length === 0) return [];
      const { data } = await supabase.from("completed_lessons").select("lesson_id").in("lesson_id", lessonIds);
      return data?.map((c) => c.lesson_id) ?? [];
    },
    enabled: !!lessons && lessons.length > 0,
  });

  const completedCount = completedLessons?.length ?? 0;
  const totalCount = lessons?.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const estimatedMin = totalCount * 12;

  const handleBuy = () => {
    const msg = encodeURIComponent(`Salom! Men "${module?.title}" kursiga yozilmoqchiman.`);
    window.open(`https://t.me/porlapayment_bot?text=${msg}`, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      {/* Hero */}
      <div className="gradient-warm h-44 relative flex items-end">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-8 w-24 h-24 rounded-full border-2 border-primary-foreground/40" />
          <div className="absolute bottom-4 left-10 w-16 h-16 rounded-full border border-primary-foreground/30" />
        </div>
        <div className="px-5 pb-5 w-full relative z-10">
          <button onClick={() => navigate(-1)} className="text-primary-foreground mb-3 inline-flex items-center" style={{ minHeight: 44 }}>
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{module?.emoji}</span>
            <h1 className="text-xl font-bold text-primary-foreground leading-tight">{module?.title}</h1>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3 relative z-10">
        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 shadow-card mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Taraqqiyot</span>
            <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} dars bajarildi</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full rounded-full gradient-warm" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{Math.round(progress)}% tugallangan</p>
        </motion.div>


        {/* Buy button */}
        {!profile?.is_premium && (
          <div className="mb-4">
            <button onClick={handleBuy} className="w-full h-[52px] rounded-[14px] gradient-warm text-primary-foreground font-semibold text-[15px] shadow-soft press-scale flex items-center justify-center gap-2">
              <Shield size={16} />
              Kursga yozilish
            </button>
            <div className="flex items-center justify-center gap-4 mt-2.5 text-[10px] text-muted-foreground">
              <span>✓ 30 kunlik kafolat</span>
              <span>✓ Bir marta to'lov</span>
              <span>✓ Umrbod kirish</span>
            </div>
          </div>
        )}

        {/* Lessons */}
        <h3 className="text-sm font-semibold text-foreground mb-2 mt-2">Darslar</h3>
        <div className="space-y-2">
          {lessons?.map((lesson, li) => {
            const isCompleted = completedLessons?.includes(lesson.id);
            const isFirstLesson = li === 0;
            const isFree = isFirstLesson && hasFreeLesson;
            const isLocked = !profile?.is_premium && !isFree;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + li * 0.05 }}
                onClick={() => {
                  if (isLocked) return;
                  navigate(`/lesson/${lesson.id}`);
                }}
                className={`flex items-center gap-3 bg-card rounded-2xl px-4 shadow-card transition-colors ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer press-scale-sm hover:bg-muted/30"}`}
                style={{ minHeight: 56 }}
              >
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-success/20" : isLocked ? "bg-muted" : "gradient-warm"}`}>
                  {isCompleted ? (
                    <span className="text-success text-sm font-bold">✓</span>
                  ) : isLocked ? (
                    <Lock size={14} className="text-muted-foreground" />
                  ) : (
                    <Play size={14} className="text-primary-foreground ml-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground block leading-tight">{lesson.title}</span>
                  {isFree && !profile?.is_premium && (
                    <span className="text-[10px] text-success font-semibold">Bepul sinab ko'ring</span>
                  )}
                  {isLocked && (
                    <span className="text-[10px] text-muted-foreground">Premium dars</span>
                  )}
                </div>
                <ChevronRight size={14} className="text-muted-foreground/50" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ModuleDetail;
