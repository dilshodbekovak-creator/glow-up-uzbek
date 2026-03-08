import { Home, BookOpen, CalendarHeart, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Bosh sahifa" },
  { path: "/modules", icon: BookOpen, label: "Kurslar" },
  { path: "/tracker", icon: CalendarHeart, label: "Sikl" },
  { path: "/profile", icon: User, label: "Profil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto" style={{ minHeight: 56, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
              style={{ minHeight: 44 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
