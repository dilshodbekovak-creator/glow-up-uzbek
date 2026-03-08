import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Video, Search, Check, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [contentText, setContentText] = useState("");

  // Check admin role
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
        _role: "admin",
      });
      return data === true;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles", searchTerm],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      const { data } = await query.limit(50);
      return data ?? [];
    },
    enabled: isAdmin === true,
  });

  const { data: lessons } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*, modules(title, emoji)").order("sort_order");
      return data ?? [];
    },
    enabled: isAdmin === true,
  });

  const togglePremium = useMutation({
    mutationFn: async ({ userId, isPremium }: { userId: string; isPremium: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_premium: !isPremium })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("Yangilandi!");
    },
    onError: () => toast.error("Xatolik"),
  });

  const updateVideoUrl = useMutation({
    mutationFn: async ({ lessonId, url }: { lessonId: string; url: string }) => {
      const { error } = await supabase
        .from("lessons")
        .update({ video_url: url || null })
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      setEditingLesson(null);
      toast.success("Video URL yangilandi!");
    },
    onError: () => toast.error("Xatolik"),
  });

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Tekshirilmoqda...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground mb-2">Ruxsat yo'q</p>
          <p className="text-sm text-muted-foreground mb-4">Admin paneliga faqat administratorlar kira oladi.</p>
          <button onClick={() => navigate("/")} className="h-10 px-5 rounded-full gradient-warm text-primary-foreground text-sm font-semibold press-scale">
            Bosh sahifaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-foreground" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Users section */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Crown size={16} className="text-primary" /> Foydalanuvchilar
          </h2>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ism bo'yicha qidirish..."
              className="w-full pl-9 pr-4 py-3 rounded-[14px] bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            {profiles?.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3" style={{ minHeight: 56 }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.name || "Nomsiz"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.user_id}</p>
                </div>
                <button
                  onClick={() => togglePremium.mutate({ userId: p.user_id, isPremium: p.is_premium })}
                  className={`h-9 px-4 rounded-full text-xs font-semibold press-scale ${
                    p.is_premium
                      ? "bg-success/15 text-success"
                      : "gradient-warm text-primary-foreground"
                  }`}
                >
                  {p.is_premium ? "Pro ✓" : "Pro qilish"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons video URLs */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Video size={16} className="text-primary" /> Dars videolari
          </h2>

          <div className="space-y-2">
            {lessons?.map((l) => (
              <div key={l.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-sm">{(l as any)?.modules?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{(l as any)?.modules?.title}</p>
                    <p className="text-sm font-medium text-foreground">{l.title}</p>
                  </div>
                </div>

                {editingLesson === l.id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="YouTube URL..."
                      className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                      onClick={() => updateVideoUrl.mutate({ lessonId: l.id, url: videoUrl })}
                      className="w-9 h-9 rounded-lg gradient-warm flex items-center justify-center press-scale"
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingLesson(l.id);
                      setVideoUrl(l.video_url || "");
                    }}
                    className="mt-2 text-xs text-primary font-semibold"
                  >
                    {l.video_url ? "URL ni o'zgartirish" : "Video URL qo'shish"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Admin;
