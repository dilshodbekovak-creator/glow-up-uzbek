import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen pb-24 gradient-soft">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground font-medium"
        >
          Salom, {profile?.name || "Mehmon"}! 🌸
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-extrabold text-foreground"
        >
          Glow
        </motion.h1>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-5 rounded-2xl gradient-warm p-5 shadow-soft"
      >
        <h2 className="text-lg font-bold text-primary-foreground leading-snug">
          O'zingni bil, o'zingga g'amxo'rlik qil
        </h2>
        <p className="text-xs text-primary-foreground/80 mt-1.5">
          Ishonchli va xavfsiz muhitda sog'liqingiz haqida o'rganing
        </p>
        <button
          onClick={() => navigate("/modules")}
          className="mt-3 bg-card/90 text-primary font-bold text-xs px-4 py-2 rounded-xl shadow-card hover:bg-card transition-colors"
        >
          Boshlash →
        </button>
      </motion.div>

      {/* Stats */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-bold text-foreground mb-3">Sizning natijangiz</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <p className="text-2xl font-extrabold text-primary">{completedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tugatilgan darslar</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <p className="text-2xl font-extrabold text-secondary-foreground">{totalLessons ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Jami darslar</p>
          </motion.div>
        </div>
      </div>

      {/* Modules */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-bold text-foreground mb-3">O'quv modullari</h2>
        <div className="grid gap-3">
          {modules?.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => navigate(`/modules/${mod.id}`)}
              className="rounded-2xl p-4 shadow-card cursor-pointer hover:shadow-soft transition-shadow bg-glow-peach"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-card/60 flex items-center justify-center text-2xl flex-shrink-0">
                  {mod.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mod.price.toLocaleString()} so'm
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
    </div>
  );
};

export default Index;
