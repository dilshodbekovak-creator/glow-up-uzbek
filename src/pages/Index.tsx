import { motion } from "framer-motion";
import heroImg from "@/assets/hero-illustration.png";
import ModuleCard from "@/components/ModuleCard";
import moduleBody from "@/assets/module-body.png";
import moduleCycle from "@/assets/module-cycle.png";
import moduleWellness from "@/assets/module-wellness.png";
import moduleMental from "@/assets/module-mental.png";

const modules = [
  {
    title: "Tana haqida bilim",
    description: "O'zingizning tanangiz haqida asosiy bilimlar",
    image: moduleBody,
    color: "bg-glow-peach",
    lessons: 8,
  },
  {
    title: "Hayz sikli",
    description: "Hayz davri va uning bosqichlari haqida",
    image: moduleCycle,
    color: "bg-glow-rose",
    lessons: 6,
  },
  {
    title: "Tibbiy salomatlik",
    description: "Shifokorga qachon murojaat qilish kerak",
    image: moduleWellness,
    color: "bg-glow-mint",
    lessons: 5,
  },
  {
    title: "Ruhiy salomatlik",
    description: "Hissiyotlar va stress bilan ishlash",
    image: moduleMental,
    color: "bg-glow-lavender",
    lessons: 7,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen pb-24 gradient-soft">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground font-medium"
        >
          Xush kelibsiz 👋
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
        className="mx-5 rounded-2xl gradient-warm p-5 flex items-center gap-4 shadow-soft"
      >
        <div className="flex-1">
          <h2 className="text-lg font-bold text-primary-foreground leading-snug">
            O'zingni bil, o'zingga g'amxo'rlik qil
          </h2>
          <p className="text-xs text-primary-foreground/80 mt-1.5">
            Ishonchli va xavfsiz muhitda sog'liqingiz haqida o'rganing
          </p>
          <button className="mt-3 bg-card/90 text-primary font-bold text-xs px-4 py-2 rounded-xl shadow-card hover:bg-card transition-colors">
            Boshlash →
          </button>
        </div>
        <img
          src={heroImg}
          alt="Glow illustration"
          className="w-24 h-24 object-contain animate-float"
        />
      </motion.div>

      {/* Modules */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-bold text-foreground mb-3">O'quv modullari</h2>
        <div className="grid gap-3">
          {modules.map((mod, i) => (
            <ModuleCard key={mod.title} {...mod} index={i} />
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 mt-7">
        <h2 className="text-lg font-bold text-foreground mb-3">Sizning natijangiz</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <p className="text-2xl font-extrabold text-primary">0</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tugatilgan darslar</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <p className="text-2xl font-extrabold text-secondary-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-0.5">Kun streak</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
