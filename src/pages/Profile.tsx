import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Crown, ChevronRight, BookCheck, Mail, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const { data: completedCount } = useQuery({
    queryKey: ["completed-count"],
    queryFn: async () => {
      const { count } = await supabase.from("completed_lessons").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Profil</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* User card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-warm rounded-2xl p-6 shadow-soft text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 right-6 w-16 h-16 rounded-full border border-primary-foreground/30" />
          </div>
          <div className="w-16 h-16 rounded-full bg-card/30 mx-auto flex items-center justify-center">
            <UserIcon size={28} className="text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-primary-foreground mt-3">{profile?.name || "Foydalanuvchi"}</h2>
          <p className="text-xs text-primary-foreground/80 mt-1">{user?.email}</p>
          {profile?.is_premium && (
            <div className="mt-2 inline-flex items-center gap-1 bg-card/20 px-3 py-1 rounded-full">
              <Crown size={12} className="text-primary-foreground" />
              <span className="text-[10px] font-bold text-primary-foreground">Pro ✦</span>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3" style={{ minHeight: 56 }}>
          <div className="w-10 h-10 rounded-[10px] bg-success/15 flex items-center justify-center">
            <BookCheck size={18} className="text-success" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Bajarilgan darslar</h3>
            <p className="text-xs text-muted-foreground">{completedCount} ta dars tugatilgan</p>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3" style={{ minHeight: 56 }}>
          <div className="w-10 h-10 rounded-[10px] bg-secondary flex items-center justify-center">
            <Mail size={18} className="text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Email</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={handleLogout}
          className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 press-scale-sm"
          style={{ minHeight: 56 }}
        >
          <div className="w-10 h-10 rounded-[10px] bg-destructive/10 flex items-center justify-center">
            <LogOut size={18} className="text-destructive" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-sm text-foreground">Chiqish</h3>
            <p className="text-xs text-muted-foreground">Hisobdan chiqish</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground/50" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;
