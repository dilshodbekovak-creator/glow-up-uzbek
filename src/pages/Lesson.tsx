import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: lesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*, modules(title, emoji)")
        .eq("id", lessonId!)
        .single();
      return data;
    },
    enabled: !!lessonId,
  });

  const { data: isCompleted } = useQuery({
    queryKey: ["lesson-completed", lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("completed_lessons")
        .select("id")
        .eq("lesson_id", lessonId!)
        .maybeSingle();
      return !!data;
    },
    enabled: !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("completed_lessons").insert({
        user_id: user!.id,
        lesson_id: lessonId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-completed", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["completed-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["completed-count"] });
      toast.success("Dars tugatildi! ✓");
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  const handleBuy = () => {
    const moduleName = (lesson as any)?.modules?.title ?? "modul";
    const msg = encodeURIComponent(`Salom! Men ${moduleName} darsligini sotib olmoqchiman.`);
    window.open(`https://t.me/your_admin_username?text=${msg}`, "_blank");
  };

  const isPremium = profile?.is_premium ?? false;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="text-[10px] text-muted-foreground">
            {(lesson as any)?.modules?.emoji} {(lesson as any)?.modules?.title}
          </p>
          <h1 className="text-lg font-extrabold text-foreground">{lesson?.title}</h1>
        </div>
      </div>

      <div className="px-5">
        {/* Video or Lock */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden mb-4 shadow-card"
        >
          {isPremium ? (
            lesson?.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Video mavjud emas</p>
              </div>
            )
          ) : (
            <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3">
              <Lock size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Video faqat Premium foydalanuvchilar uchun
              </p>
              <button
                onClick={handleBuy}
                className="px-5 py-2 rounded-xl gradient-warm text-primary-foreground font-bold text-sm shadow-soft"
              >
                🔒 Sotib olish
              </button>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-card mb-4"
        >
          <h2 className="font-bold text-foreground mb-3">Dars matni</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {lesson?.content}
          </p>
        </motion.div>

        {/* Complete button */}
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-600">
            <CheckCircle size={18} />
            <span className="font-bold text-sm">Tugatilgan ✓</span>
          </div>
        ) : (
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="w-full py-3 rounded-xl gradient-warm text-primary-foreground font-bold text-sm shadow-soft disabled:opacity-50"
          >
            Tugatdim ✓
          </button>
        )}
      </div>
    </div>
  );
};

export default Lesson;
