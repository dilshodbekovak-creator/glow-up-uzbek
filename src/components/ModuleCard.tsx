import { motion } from "framer-motion";

interface ModuleCardProps {
  title: string;
  description: string;
  image: string;
  color: string;
  lessons: number;
  index: number;
}

const ModuleCard = ({ title, description, image, color, lessons, index }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`rounded-2xl p-4 shadow-card cursor-pointer hover:shadow-soft transition-shadow ${color}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-card/60 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src={image} alt={title} className="w-12 h-12 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          <span className="text-[10px] font-semibold text-primary mt-1 inline-block">
            {lessons} ta dars
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ModuleCard;
