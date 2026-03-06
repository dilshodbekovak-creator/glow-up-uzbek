import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Darsliklar</h1>
      </div>

      <div className="px-5 space-y-3">
        {modules?.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/modules/${mod.id}`)}
            className="rounded-2xl p-4 shadow-card cursor-pointer hover:shadow-soft transition-shadow bg-glow-peach"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-card/60 flex items-center justify-center text-2xl flex-shrink-0">
                {mod.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-foreground">{mod.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lessonCounts?.[mod.id] ?? 0} ta dars • {mod.price.toLocaleString()} so'm
                </p>
                {!profile?.is_premium && (
                  <span className="text-[10px] font-semibold text-primary mt-1 inline-block">
                    🔒 Premium
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ModulesList;
