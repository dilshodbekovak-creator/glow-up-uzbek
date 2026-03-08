import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const cardBgs = ["bg-secondary/30", "bg-primary/5", "bg-secondary/20", "bg-warning/10", "bg-destructive/5"];

const ModulesList = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: lessonCounts } = useQuery({
    queryKey: ["lesson-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("module_id");
      const counts: Record<string, number> = {};
      data?.forEach((l) => { counts[l.module_id] = (counts[l.module_id] || 0) + 1; });
      return counts;
    },
  });

  // Find which modules have free lessons (first lesson of modules at sort_order 1 and 2)
  const freeModuleIndices = [0, 1]; // Module 1 & 2 have free first lessons

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Kurslar</h1>
      </div>

      <div className="px-5 space-y-3">
        {modules?.map((mod, i) => {
          const lessonCount = lessonCounts?.[mod.id] ?? 0;
          const hasFree = freeModuleIndices.includes(i);
          const bgColor = cardBgs[i % cardBgs.length];

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/modules/${mod.id}`)}
              className={`rounded-2xl p-4 shadow-card cursor-pointer press-scale-sm ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-card/60 flex items-center justify-center text-2xl flex-shrink-0">
                  {mod.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-foreground">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{lessonCount} dars</p>
                  {hasFree ? (
                    <span className="text-[10px] font-semibold text-success mt-1 inline-block">Bepul dars mavjud</span>
                  ) : !profile?.is_premium ? (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-primary-foreground gradient-warm px-2.5 py-0.5 rounded-full">
                      🔒 Pro ✦
                    </span>
                  ) : null}
                </div>
                <ArrowRight size={16} className="text-muted-foreground/40" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ModulesList;
