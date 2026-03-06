import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moduleBody from "@/assets/module-body.png";
import moduleCycle from "@/assets/module-cycle.png";
import moduleWellness from "@/assets/module-wellness.png";
import moduleMental from "@/assets/module-mental.png";

const modules = [
  {
    title: "Tana haqida bilim",
    image: moduleBody,
    color: "bg-glow-peach",
    lessons: [
      "Tanangizni tushunish",
      "O'sish davrlari",
      "Ovqatlanish va salomatlik",
      "Uyqu va dam olish",
      "Jismoniy faollik",
      "Gigiyena asoslari",
      "Teri va soch parvarishi",
      "Tana o'zgarishlari",
    ],
  },
  {
    title: "Hayz sikli",
    image: moduleCycle,
    color: "bg-glow-rose",
    lessons: [
      "Hayz nima?",
      "Sikl bosqichlari",
      "Gigienik vositalar",
      "Og'riq bilan kurashish",
      "Noma'lum belgilar",
      "Shifokorga murojaat",
    ],
  },
  {
    title: "Tibbiy salomatlik",
    image: moduleWellness,
    color: "bg-glow-mint",
    lessons: [
      "Profilaktik tekshiruvlar",
      "Emlash haqida",
      "Oziq-ovqat xavfsizligi",
      "Allergiya va immunitet",
      "Dori-darmonlar haqida",
    ],
  },
  {
    title: "Ruhiy salomatlik",
    image: moduleMental,
    color: "bg-glow-lavender",
    lessons: [
      "Hissiyotlarni boshqarish",
      "Stress bilan ishlash",
      "O'z-o'ziga ishonch",
      "Sog'lom munosabatlar",
      "Yordam so'rash",
      "Meditatsiya asoslari",
      "Ijobiy fikrlash",
    ],
  },
];

const Modules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">O'quv modullari</h1>
      </div>

      <div className="px-5 space-y-6">
        {modules.map((mod, mi) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.1 }}
          >
            <div className={`rounded-2xl p-4 ${mod.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <img src={mod.image} alt={mod.title} className="w-10 h-10 object-contain" />
                <h2 className="font-bold text-foreground">{mod.title}</h2>
              </div>
              <div className="space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-center gap-3 bg-card/70 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-card transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full gradient-warm flex items-center justify-center flex-shrink-0">
                      <Play size={12} className="text-primary-foreground ml-0.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{lesson}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {li + 1}/{mod.lessons.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
