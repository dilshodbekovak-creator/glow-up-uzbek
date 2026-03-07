import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const moduleColors = ["bg-porla-petal", "bg-accent", "bg-secondary/30"];

const renamedTitles: Record<string, string> = {
  "Hayz Sikli Ilmi": "Sikl va tanani anglash",
  "Sog'liq va Gigiyena": "Sog'lom turmush asoslari",
  "Psixologiya": "Ichki dunyo va ruhiyat",
};

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
      data?.forEach((l) => {
        counts[l.module_id] = (counts[l.module_id] || 0) + 1;
      });
      return counts;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 bg-background"
    >
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">O'quv yo'llari</h1>
      </div>

      <div className="px-5 space-y-3">
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
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/modules/${mod.id}`)}
              className={`rounded-2xl p-4 shadow-card cursor-pointer press-scale-sm ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-card/60 flex items-center justify-center text-2xl flex-shrink-0">
                  {mod.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground">{displayTitle}</h3>
                    {isFirst && (
                      <span className="text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                        Yangi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lessonCount} dars · {estimatedMin} daqiqa · {mod.price.toLocaleString()} so'm
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
    </motion.div>
  );
};

export default ModulesList;
