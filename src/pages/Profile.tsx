import { motion } from "framer-motion";
import { ArrowLeft, Shield, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Profil</h1>
      </div>

      <div className="px-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-warm rounded-2xl p-5 shadow-soft text-center"
        >
          <div className="w-16 h-16 rounded-full bg-card/30 mx-auto flex items-center justify-center text-2xl">
            🌸
          </div>
          <h2 className="text-lg font-bold text-primary-foreground mt-3">
            {profile?.name || "Foydalanuvchi"}
          </h2>
          <p className="text-xs text-primary-foreground/80 mt-1">{user?.email}</p>
          {profile?.is_premium && (
            <div className="mt-2 inline-flex items-center gap-1 bg-card/20 px-3 py-1 rounded-full">
              <Crown size={12} className="text-primary-foreground" />
              <span className="text-[10px] font-bold text-primary-foreground">Premium</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Shield size={18} className="text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Maxfiylik</h3>
            <p className="text-xs text-muted-foreground">Ma'lumotlaringiz xavfsiz saqlanadi</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleLogout}
          className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={18} className="text-destructive" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-foreground">Chiqish</h3>
            <p className="text-xs text-muted-foreground">Hisobdan chiqish</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
