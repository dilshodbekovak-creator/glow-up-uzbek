import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Heart, Shield, Droplets, Activity } from "lucide-react";

const modules = [
  { emoji: "🩺", title: "Ayollar reproduktiv tizimi", desc: "Reproduktiv tizim qanday ishlashi va asosiy anatomik tuzilishlar haqida." },
  { emoji: "🌸", title: "Hayz sikli", desc: "Hayz siklining bosqichlari va normal sikl haqida muhim bilimlar." },
  { emoji: "🧬", title: "Ayol gormonlari", desc: "Estrogen va progesteron sikl davomida qanday ishlashi va PMS haqida." },
  { emoji: "🔬", title: "Vaginal ajralmalar", desc: "Qaysi ajralmalar normal va qachon muammo belgisi bo'lishi mumkin." },
  { emoji: "🩸", title: "Anemiya", desc: "Anemiya nima va nega u ayollar orasida ko'p uchraydi." },
];

const learnings = [
  "Ayollar reproduktiv tizimi qanday ishlashini",
  "Hayz siklining bosqichlari va normal sikl qanday bo'lishini",
  "Gormonlar salomatlikka qanday ta'sir qilishini",
  "Vaginal ajralmalar qaysi holatda normal ekanini",
  "Anemiya va uning ayollar salomatligiga ta'sirini",
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-warm relative overflow-hidden px-6 pt-16 pb-14 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-10 w-32 h-32 rounded-full border-2 border-primary-foreground/40" />
          <div className="absolute bottom-6 left-8 w-20 h-20 rounded-full border border-primary-foreground/30" />
          <div className="absolute top-20 left-16 w-8 h-8 rounded-full bg-primary-foreground/20" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold text-primary-foreground leading-tight">
            Porla — nur senda yashaydi.
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-3 leading-relaxed">
            Ayollar salomatligini tushunishga yordam beruvchi platforma.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => navigate("/auth")}
              className="h-12 px-6 rounded-full bg-card text-primary font-bold text-sm shadow-card press-scale inline-flex items-center gap-1.5"
            >
              Boshlash <ArrowRight size={14} />
            </button>
            <button
              onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 px-6 rounded-full border-2 border-primary-foreground/40 text-primary-foreground font-semibold text-sm press-scale"
            >
              Kurslarni ko'rish
            </button>
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section className="px-6 py-12 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-foreground mb-3">Porla haqida</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Porla — ayollar uchun yaratilgan ta'lim platformasi bo'lib, u reproduktiv salomatlik haqida tushunarli va ishonchli bilimlarni o'rganishga yordam beradi.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Internetda salomatlik haqida ko'plab chalkash yoki noto'g'ri ma'lumotlar mavjud. Porla esa muhim mavzularni sodda, tushunarli va tizimli video darslar orqali tushuntiradi.
          </p>
        </motion.div>
      </section>

      {/* What you'll learn */}
      <section className="px-6 py-10 bg-secondary/30 max-w-full">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Nimalarni o'rganasiz?</h2>
            <p className="text-sm text-muted-foreground mb-4">Porla kurslari orqali siz quyidagilarni o'rganasiz:</p>
            <div className="space-y-3">
              {learnings.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 bg-card rounded-2xl p-3.5 shadow-card"
                >
                  <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="px-6 py-12 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Kurs modullari</h2>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                    {mod.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Cycle Tracker */}
      <section className="px-6 py-10 gradient-soft">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={20} className="text-primary" />
              <h2 className="text-xl font-bold text-foreground">Sikl kalendari</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Porla ilovasi sizga hayz siklini kuzatishga yordam beradi.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">Sikl kalendari orqali siz:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                sikl kunlarini kuzatishingiz
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                yaqinlashayotgan hayz kunlarini ko'rishingiz
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                sikl fazalariga oid foydali maslahatlarni olishingiz mumkin
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-14 text-center max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-foreground leading-snug">
            Tanangizni tushunish sog'lom hayotning birinchi qadamidir.
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Porla bilan o'rganishni boshlang.</p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-5 h-12 px-8 rounded-full gradient-warm text-primary-foreground font-bold text-sm shadow-soft press-scale inline-flex items-center gap-1.5"
          >
            Boshlash <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-sm font-semibold text-foreground mb-3">Porla — ayollar salomatligi platformasi.</p>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
