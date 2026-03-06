import { motion } from "framer-motion";
import { ArrowLeft, Shield, Heart, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

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
          <h2 className="text-lg font-bold text-primary-foreground mt-3">Anonim foydalanuvchi</h2>
          <p className="text-xs text-primary-foreground/80 mt-1">
            Sizning ma'lumotlaringiz xavfsiz va maxfiy
          </p>
        </motion.div>

        {[
          { icon: Shield, title: "Maxfiylik", desc: "Ma'lumotlaringiz faqat qurilmangizda" },
          { icon: Heart, title: "Sevimli darslar", desc: "Saqlangan darslaringiz" },
          { icon: Info, title: "Ilova haqida", desc: "Glow v1.0 — Qizlar uchun sog'liq ilovasi" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:shadow-soft transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <item.icon size={18} className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
