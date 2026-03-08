import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Module 1 and 2 (sort_order 1, 2) have free first lessons
const FREE_MODULE_SORT_ORDERS = [1, 2];

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
        .select("*, modules(title, emoji, sort_order)")
        .eq("id", lessonId!)
        .single();
      return data;
    },
    enabled: !!lessonId,
  });

  const { data: isCompleted } = useQuery({
    queryKey: ["lesson-completed", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("completed_lessons").select("id").eq("lesson_id", lessonId!).maybeSingle();
      return !!data;
    },
    enabled: !!lessonId,
  });

  // Get next lesson
  const { data: nextLesson } = useQuery({
    queryKey: ["next-lesson", lessonId],
    queryFn: async () => {
      if (!lesson) return null;
      const { data } = await supabase
        .from("lessons")
        .select("id, title")
        .eq("module_id", lesson.module_id)
        .gt("sort_order", lesson.sort_order)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!lesson,
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
      queryClient.invalidateQueries({ queryKey: ["continue-lesson"] });
      toast.success("Dars tugatildi! ✓");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const handleBuy = () => {
    const moduleTitle = (lesson as any)?.modules?.title ?? "modul";
    const msg = encodeURIComponent(`Salom! Men "${moduleTitle}" kursiga yozilmoqchiman.`);
    window.open(`https://t.me/porlapayment_bot?text=${msg}`, "_blank");
  };

  const isPremium = profile?.is_premium ?? false;
  const moduleSortOrder = (lesson as any)?.modules?.sort_order ?? 0;
  const isFirstLesson = lesson?.sort_order === 1;
  const isFreeLesson = isFirstLesson && FREE_MODULE_SORT_ORDERS.includes(moduleSortOrder);
  const canAccess = isPremium || isFreeLesson;

  const moduleTitle = (lesson as any)?.modules?.title ?? "";

  // Convert YouTube URL to embed
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="text-[10px] text-muted-foreground">{(lesson as any)?.modules?.emoji} {moduleTitle}</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight">{lesson?.title}</h1>
        </div>
      </div>

      <div className="px-5">
        {/* Video */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden mb-4 shadow-card">
          {canAccess ? (
            lesson?.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(lesson.video_url) ?? ""}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Video tez orada qo'shiladi</p>
              </div>
            )
          ) : (
            <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3">
              <Lock size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">Premium dars</p>
              <button onClick={handleBuy} className="h-10 px-5 rounded-[14px] gradient-warm text-primary-foreground font-semibold text-sm shadow-soft press-scale inline-flex items-center gap-1.5">
                Kursga yozilish
              </button>
            </div>
          )}
        </motion.div>

        {/* Content */}
        {canAccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 shadow-card mb-4">
            <h2 className="font-semibold text-foreground mb-3">Dars matni</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{lesson?.content}</p>
          </motion.div>
        )}

        {/* Action buttons */}
        {canAccess && (
          <div className="space-y-3">
            {isCompleted ? (
              <div className="flex items-center justify-center gap-2 h-[52px] rounded-[14px] bg-success/15 text-success">
                <CheckCircle size={18} />
                <span className="font-semibold text-sm">Bajarilgan ✓</span>
              </div>
            ) : (
              <button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="w-full h-[52px] rounded-[14px] gradient-warm text-primary-foreground font-semibold text-[15px] shadow-soft disabled:opacity-50 press-scale"
              >
                Tugatdim ✓
              </button>
            )}

            {nextLesson && (
              <button
                onClick={() => navigate(`/lesson/${nextLesson.id}`)}
                className="w-full h-[48px] rounded-[14px] border border-border text-foreground font-semibold text-sm press-scale flex items-center justify-center gap-2"
              >
                Keyingi dars <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Lesson;
