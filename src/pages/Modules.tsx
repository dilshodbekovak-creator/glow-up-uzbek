import { motion } from "framer-motion";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ModuleDetail = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { profile } = useAuth();

  const { data: module } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId!)
        .single();
      return data;
    },
    enabled: !!moduleId,
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId!)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!moduleId,
  });

  const { data: completedLessons } = useQuery({
    queryKey: ["completed-lessons", moduleId],
    queryFn: async () => {
      const lessonIds = lessons?.map((l) => l.id) ?? [];
      if (lessonIds.length === 0) return [];
      const { data } = await supabase
        .from("completed_lessons")
        .select("lesson_id")
        .in("lesson_id", lessonIds);
      return data?.map((c) => c.lesson_id) ?? [];
    },
    enabled: !!lessons && lessons.length > 0,
  });

  const completedCount = completedLessons?.length ?? 0;
  const totalCount = lessons?.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleBuy = () => {
    const moduleName = module?.title ?? "modul";
    const msg = encodeURIComponent(`Salom! Men ${moduleName} darsligini sotib olmoqchiman.`);
    window.open(`https://t.me/your_admin_username?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">
          {module?.emoji} {module?.title}
        </h1>
      </div>

      <div className="px-5">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-card mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-foreground">Taraqqiyot</span>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} dars
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-warm transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>

        {/* Buy button for non-premium */}
        {!profile?.is_premium && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleBuy}
            className="w-full mb-4 py-3 rounded-xl gradient-warm text-primary-foreground font-bold text-sm shadow-soft"
          >
            🔒 Sotib olish — {module?.price?.toLocaleString()} so'm
          </motion.button>
        )}

        {/* Lessons */}
        <div className="space-y-2">
          {lessons?.map((lesson, li) => {
            const isCompleted = completedLessons?.includes(lesson.id);
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: li * 0.05 }}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 cursor-pointer hover:shadow-soft transition-shadow shadow-card"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-glow-mint" : "gradient-warm"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-foreground text-xs font-bold">✓</span>
                  ) : !profile?.is_premium ? (
                    <Lock size={12} className="text-primary-foreground" />
                  ) : (
                    <Play size={12} className="text-primary-foreground ml-0.5" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">
                  {lesson.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {li + 1}/{totalCount}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
