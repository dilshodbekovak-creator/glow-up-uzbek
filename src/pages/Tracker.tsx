import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addDays, parseISO, differenceInDays } from "date-fns";

// ── Helpers ────────────────────────────────────────────────────────
const toStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseD = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addD = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const TODAY = toStr(new Date());

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const DAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

type PhaseKey = "hayz" | "predicted" | "follikulyar" | "ovulatsiya" | "lyuteal";

const PHASES: Record<PhaseKey, { label: string; color: string; bg: string; emoji: string }> = {
  hayz:        { label: "Hayz",        color: "#D4567A", bg: "#FCE4EC", emoji: "🩸" },
  predicted:   { label: "Taxminiy",    color: "#E8869E", bg: "#FDE8F0", emoji: "📅" },
  follikulyar: { label: "Follikulyar", color: "#E07840", bg: "#FFF0E8", emoji: "🌱" },
  ovulatsiya:  { label: "Ovulatsiya",  color: "#C8900A", bg: "#FFF8E1", emoji: "🌟" },
  lyuteal:     { label: "Lyuteal",     color: "#7C5CBF", bg: "#F0EAF8", emoji: "🌙" },
};

const PHASE_INFO: Record<PhaseKey, { title: string; text: string; tips: string[] }> = {
  hayz: {
    title: "🩸 Hayz fazasi",
    text: "Hayz – bachadon shilliq qavatining to'kilishi. 3–7 kun davom etadi. Dam olish va issiq ovqat yeyish tavsiya etiladi.",
    tips: ["Issiq kompres qo'ying, yaxshi bo'ladi 🌡️", "Temir boy ovqatlar yeyish foydali", "Yengil cho'zilish og'riqni kamaytiradi", "Ko'p suv iching 💧"],
  },
  predicted: {
    title: "📅 Taxminiy hayz",
    text: "Bu kunlar oldingi siklga asosan hisoblangan taxminiy sanalar. Aniq sanangiz farq qilishi mumkin — o'zingiz kiritib yangilang.",
    tips: ["Gigiyena narsalarini tayyorlang", "Issiq ovqat yeyish foydali", "Dam olishni rejalashtiring"],
  },
  follikulyar: {
    title: "🌱 Follikulyar faza",
    text: "Estrogen oshadi, energiyangiz ko'tariladi. Yangi narsalar o'rganishga eng yaxshi vaqt!",
    tips: ["Yangi narsalar o'rganishga eng zo'r vaqt!", "Uchrashuvlarni shu vaqtga rejalashtirsangiz yaxshi", "Sport va ijod uchun ideal davr 🚀", "Energiyangizdan to'liq foydalaning!"],
  },
  ovulatsiya: {
    title: "🌟 Ovulatsiya",
    text: "Tuxumhujayra chiqadi — eng unumdor kun. Tuxumhujayra 12–24 soat, sperma 5 kungacha yashaydi.",
    tips: ["Eng unumdor kunlaringiz, e'tibor bering 🥚", "Kayfiyat va energiya cho'qqida!", "Muhim qarorlarni shu kunga qo'ying"],
  },
  lyuteal: {
    title: "🌙 Lyuteal faza",
    text: "Progesteron ko'tariladi. PMS belgilari (shishish, kayfiyat o'zgarishi) bo'lishi mumkin.",
    tips: ["Shirin ishtaha oshsa — meva yeng 🍌", "Kayfiyat o'zgarsa o'zingizni ayblamang 💜", "Magniyga boy ovqatlar yeyish foydali", "Dam olishni ko'paytiring, katta qarorlarni keyinga qo'ying"],
  },
};

interface PeriodRange {
  id: string;
  start: string;
  end: string;
}

// ── Cycle map builder ──────────────────────────────────────────────
function buildCycleMap(periodRanges: PeriodRange[], cycleLen: number): Record<string, PhaseKey> {
  const map: Record<string, PhaseKey> = {};
  if (!periodRanges.length) return map;

  const sorted = [...periodRanges].sort((a, b) => parseD(a.start).getTime() - parseD(b.start).getTime());

  // 1. Haqiqiy hayz kunlari
  sorted.forEach(({ start, end }) => {
    const s = parseD(start);
    const periodLen = Math.round((parseD(end).getTime() - s.getTime()) / 86400000) + 1;
    for (let i = 0; i < periodLen; i++) {
      map[toStr(addD(s, i))] = "hayz";
    }
  });

  // 2. Fazalar
  sorted.forEach(({ start, end }, idx) => {
    const s = parseD(start);
    const periodLen = Math.round((parseD(end).getTime() - s.getTime()) / 86400000) + 1;
    const nextPeriodStart = sorted[idx + 1] ? parseD(sorted[idx + 1].start) : null;
    const cycleWindowEnd = nextPeriodStart
      ? toStr(addD(nextPeriodStart, -1))
      : toStr(addD(s, cycleLen - 1));

    const ovDay = cycleLen - 14;
    for (let day = periodLen + 1; day <= cycleLen; day++) {
      const ds = toStr(addD(s, day - 1));
      if (ds > cycleWindowEnd) break;
      if (map[ds] === "hayz") break;

      if (day < ovDay - 1) map[ds] = "follikulyar";
      else if (day >= ovDay - 1 && day <= ovDay + 1) map[ds] = "ovulatsiya";
      else map[ds] = "lyuteal";
    }
  });

  // 3. Taxminiy hayz
  const latest = sorted[sorted.length - 1];
  const latestLen = Math.round((parseD(latest.end).getTime() - parseD(latest.start).getTime()) / 86400000) + 1;
  const latestStart = parseD(latest.start);

  for (let c = 1; c <= 6; c++) {
    const nextS = addD(latestStart, cycleLen * c);
    const alreadyLogged = sorted.some((r) => {
      const diff = Math.abs(Math.round((parseD(r.start).getTime() - nextS.getTime()) / 86400000));
      return diff < cycleLen / 2;
    });
    if (alreadyLogged) continue;

    for (let i = 0; i < latestLen; i++) {
      const ds = toStr(addD(nextS, i));
      if (!map[ds] && ds >= TODAY) map[ds] = "predicted";
    }
  }

  return map;
}

// ── Main Component ─────────────────────────────────────────────────
const Tracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cycleLen = 28;
  const [selectFirst, setSelectFirst] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [phasePopup, setPhasePopup] = useState<PhaseKey | null>(null);

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addStart, setAddStart] = useState(TODAY);
  const [addDuration, setAddDuration] = useState(5);

  // ── Supabase data ──────────────────────────────────────────────
  const { data: rawPeriods = [] } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("period_tracking")
        .select("*")
        .order("start_date", { ascending: false });
      return data ?? [];
    },
  });

  // Convert Supabase rows to PeriodRange
  const periodRanges: PeriodRange[] = useMemo(
    () =>
      rawPeriods.map((p) => ({
        id: p.id,
        start: p.start_date,
        end: p.end_date || toStr(addD(parseD(p.start_date), (p.period_length || 5) - 1)),
      })),
    [rawPeriods]
  );

  const cycleMap = useMemo(() => buildCycleMap(periodRanges, cycleLen), [periodRanges, cycleLen]);

  // Stats
  const sorted = useMemo(
    () => [...periodRanges].sort((a, b) => parseD(b.start).getTime() - parseD(a.start).getTime()),
    [periodRanges]
  );
  const last = sorted[0];
  let currentCycleDay: number | null = null;
  let daysUntilNext: number | null = null;
  if (last) {
    const diffDays = Math.round((parseD(TODAY).getTime() - parseD(last.start).getTime()) / 86400000);
    currentCycleDay = (diffDays % cycleLen) + 1;
    const cyclesPassed = Math.floor(diffDays / cycleLen);
    const nextStart = toStr(addD(parseD(last.start), (cyclesPassed + 1) * cycleLen));
    daysUntilNext = Math.round((parseD(nextStart).getTime() - parseD(TODAY).getTime()) / 86400000);
  }

  // ── Mutations ──────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async ({ start, end, days }: { start: string; end: string; days: number }) => {
      const predictedNext = toStr(addD(parseD(start), cycleLen));
      const { error } = await supabase.from("period_tracking").insert({
        user_id: user!.id,
        start_date: start,
        end_date: end,
        predicted_next_date: predictedNext,
        cycle_length: cycleLen,
        period_length: days,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("✅ Hayz saqlandi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("period_tracking").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("🗑️ O'chirildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  // ── Calendar day tap ───────────────────────────────────────────
  function handleDayTap(ds: string) {
    const phase = cycleMap[ds];
    if (phase && phase !== "predicted" && !selectFirst) {
      setPhasePopup(phase);
      return;
    }
    if (!selectFirst) {
      setSelectFirst(ds);
    } else {
      const a = parseD(selectFirst);
      const b = parseD(ds);
      const start = toStr(a <= b ? a : b);
      const end = toStr(a <= b ? b : a);
      const days = Math.round((parseD(end).getTime() - parseD(start).getTime()) / 86400000) + 1;
      if (days > 15) {
        toast.error("⚠️ 15 kundan ko'p bo'lishi mumkin emas");
        setSelectFirst(null);
        return;
      }
      saveMutation.mutate({ start, end, days });
      setSelectFirst(null);
    }
  }

  // ── Add modal save ────────────────────────────────────────────
  function handleAddModal() {
    const end = toStr(addD(parseD(addStart), addDuration - 1));
    saveMutation.mutate({ start: addStart, end, days: addDuration });
    setAddModal(false);
  }

  // ── Preview range ─────────────────────────────────────────────
  function inPreviewRange(ds: string) {
    if (!selectFirst || !hoverDate) return false;
    const a = parseD(selectFirst), b = parseD(hoverDate), cur = parseD(ds);
    const lo = a <= b ? a : b, hi = a <= b ? b : a;
    return cur >= lo && cur <= hi;
  }

  // ── Calendar render ───────────────────────────────────────────
  function renderCalendar() {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const cells: JSX.Element[] = [];

    for (let i = 0; i < offset; i++)
      cells.push(<div key={`e-${i}`} style={{ width: 40, height: 40 }} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isDayToday = ds === TODAY;
      const isFirst = ds === selectFirst;
      const inPrev = inPreviewRange(ds);
      const phase = cycleMap[ds] as PhaseKey | undefined;
      const ph = phase ? PHASES[phase] : null;

      let bg = "transparent", fg = "#555", fw = "500", shadow = "none", border = "none";

      if (isDayToday && !phase && !isFirst && !inPrev) {
        fg = "#D4567A"; fw = "900";
        border = "2.5px solid #D4567A";
        shadow = "0 0 0 3px #FCE4EC";
      } else if (isFirst || inPrev) {
        bg = isFirst ? "#D4567A" : "#F4A0BB"; fg = "#fff"; fw = "900";
        shadow = isFirst ? "0 0 0 3px #FAB8CC" : "none";
      } else if (isDayToday && phase) {
        bg = "#D4567A"; fg = "#fff"; fw = "900";
        shadow = "0 0 0 3px #FAB8CC";
      } else if (ph) {
        bg = ph.bg; fg = ph.color; fw = "700";
        if (phase === "predicted") border = `1.5px dashed ${ph.color}`;
      }

      cells.push(
        <button
          key={ds}
          onMouseEnter={() => selectFirst && setHoverDate(ds)}
          onMouseLeave={() => setHoverDate(null)}
          onClick={() => handleDayTap(ds)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            border, cursor: "pointer",
            background: bg, color: fg, fontWeight: fw as any,
            fontSize: 14, outline: "none",
            boxShadow: shadow,
            transition: "all 0.1s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {d}
        </button>
      );
    }
    return cells;
  }

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#FFF5F7,#FFF0F3,#FFEEF5)", paddingBottom: 100 }}>
      {/* TOP BAR */}
      <div style={{
        background: "linear-gradient(135deg,#D4567A 0%,#E8855A 100%)",
        padding: "48px 20px 24px",
        borderRadius: "0 0 28px 28px",
        boxShadow: "0 8px 32px rgba(212,86,122,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={20} color="#fff" />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            🌸
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Porla</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.95)", fontWeight: 800, fontSize: 20 }}>Porla Kalendari</p>
      </div>

      <div style={{ padding: "16px 16px 0", maxWidth: 480, margin: "0 auto" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "18px 16px", textAlign: "center", boxShadow: "0 2px 12px rgba(212,86,122,0.08)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#D4567A", letterSpacing: 1, marginBottom: 4 }}>KEYINGI HAYZGACHA</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#D4567A", lineHeight: 1 }}>
              {daysUntilNext === null ? "—" : daysUntilNext <= 0 ? "🩸" : daysUntilNext}
            </p>
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
              {daysUntilNext === null ? "Sanani kiriting" : daysUntilNext <= 0 ? "Bugun yoki kechikkan" : "kun qoldi"}
            </p>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, padding: "18px 16px", textAlign: "center", boxShadow: "0 2px 12px rgba(212,86,122,0.08)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#7C5CBF", letterSpacing: 1, marginBottom: 4 }}>SIKL KUNI</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#7C5CBF", lineHeight: 1 }}>
              {currentCycleDay !== null ? currentCycleDay : "—"}
            </p>
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{cycleLen} kunlik sikl</p>
          </div>
        </div>

        {/* INSTRUCTION + ADD BUTTON */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: selectFirst ? "linear-gradient(135deg,#D4567A,#E06090)" : "linear-gradient(135deg,#FDE8F0,#FCE4EC)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center" }}>
            {selectFirst ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Boshlandi: {selectFirst}</p>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Endi oxirgi kunni bosing 👇</p>
                </div>
                <button
                  onClick={() => setSelectFirst(null)}
                  style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 10, padding: "6px 10px", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <p style={{ color: "#D4567A", fontWeight: 700, fontSize: 12 }}>
                🩸 Kalendarda 1-kun → oxirgi kun bosing
              </p>
            )}
          </div>

          <button
            onClick={() => { setAddStart(TODAY); setAddDuration(5); setAddModal(true); }}
            style={{
              width: 52, minHeight: 52, borderRadius: 16,
              background: "linear-gradient(135deg,#D4567A,#E8855A)",
              border: "none", color: "#fff", fontSize: 24, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(212,86,122,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* CALENDAR */}
        <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 4px 24px rgba(212,86,122,0.08)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else setCalMonth((m) => m - 1); }}
              style={{ width: 38, height: 38, borderRadius: 12, background: "#FCE4EC", border: "none", fontSize: 20, color: "#D4567A", cursor: "pointer", fontWeight: 700 }}
            >
              ‹
            </button>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#333" }}>
              {MONTHS_UZ[calMonth]}, {calYear}
            </span>
            <button
              onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else setCalMonth((m) => m + 1); }}
              style={{ width: 38, height: 38, borderRadius: 12, background: "#FCE4EC", border: "none", fontSize: 20, color: "#D4567A", cursor: "pointer", fontWeight: 700 }}
            >
              ›
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 8 }}>
            {DAYS_UZ.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "#C4A0B0", padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, justifyItems: "center" }}
            onMouseLeave={() => setHoverDate(null)}
          >
            {renderCalendar()}
          </div>

          {/* Mini legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #f5e8ee" }}>
            {([
              { color: "#D4567A", label: "Hayz" },
              { color: "#E8869E", label: "Taxminiy", dashed: true },
              { color: "#E07840", label: "Follikulyar" },
              { color: "#C8900A", label: "Ovulatsiya" },
              { color: "#7C5CBF", label: "Lyuteal" },
            ] as const).map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#888" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "dashed" in item && item.dashed ? "transparent" : item.color,
                  border: "dashed" in item && item.dashed ? `2px dashed ${item.color}` : "none",
                }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* KIRITILGAN HAYZLAR RO'YXATI */}
        {periodRanges.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 4px 24px rgba(212,86,122,0.08)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#D4567A", letterSpacing: 1, marginBottom: 12 }}>
              KIRITILGAN HAYZ KUNLARI
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map((r) => {
                const days = Math.round((parseD(r.end).getTime() - parseD(r.start).getTime()) / 86400000) + 1;
                const nextStart = toStr(addD(parseD(r.start), cycleLen));
                return (
                  <div
                    key={r.id}
                    style={{ background: "#FFF8FA", borderRadius: 16, padding: 14, border: "1px solid #FCE4EC" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: "#FCE4EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          🩸
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 14, color: "#333" }}>
                            {r.start} → {r.end}
                          </p>
                          <p style={{ fontSize: 11, color: "#999" }}>{days} kun</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(r.id)}
                        style={{ background: "#FCE4EC", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", color: "#D4567A", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid #FCE4EC" }}>
                      <span>📅</span>
                      <div>
                        <p style={{ fontSize: 10, color: "#D4567A", fontWeight: 700 }}>Taxminiy keyingi hayz</p>
                        <p style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>{nextStart}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {addModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 480, padding: "28px 24px 48px" }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 4, background: "#eee", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 800, fontSize: 18, color: "#333", marginBottom: 4 }}>🩸 Hayz kunlarini qo'shish</p>
              <p style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>Boshlangan sana va necha kun davom etganini kiriting</p>

              <p style={{ fontSize: 12, fontWeight: 700, color: "#D4567A", marginBottom: 6 }}>Boshlanish sanasi</p>
              <input
                type="date"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "2px solid #FCE4EC", fontSize: 16, color: "#333", background: "#FFF8FA", marginBottom: 22 }}
              />

              <p style={{ fontSize: 12, fontWeight: 700, color: "#D4567A", marginBottom: 10 }}>Necha kun davom etdi?</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAddDuration(n)}
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      border: `2px solid ${addDuration === n ? "#D4567A" : "#FCE4EC"}`,
                      background: addDuration === n ? "#D4567A" : "#FFF8FA",
                      color: addDuration === n ? "#fff" : "#D4567A",
                      fontSize: 18, fontWeight: 800, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: 13, color: "#999", marginBottom: 18 }}>
                📅 {addStart} → {toStr(addD(parseD(addStart || TODAY), addDuration - 1))} ({addDuration} kun)
              </p>

              <button
                onClick={handleAddModal}
                style={{
                  width: "100%", background: "linear-gradient(135deg,#D4567A,#E8855A)",
                  color: "#fff", border: "none", borderRadius: 16, padding: 16,
                  fontSize: 16, fontWeight: 800, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(212,86,122,0.35)",
                }}
              >
                ✓ Saqlash
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE POPUP */}
      <AnimatePresence>
        {phasePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhasePopup(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 28, padding: "28px 24px", maxWidth: 400, width: "100%", boxShadow: "0 24px 70px rgba(0,0,0,0.22)" }}
            >
              {(() => {
                const ph = PHASES[phasePopup];
                const info = PHASE_INFO[phasePopup];
                return (
                  <>
                    <p style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>{ph.emoji}</p>
                    <p style={{ fontWeight: 900, fontSize: 20, textAlign: "center", color: ph.color, marginBottom: 10 }}>{info.title}</p>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, textAlign: "center", marginBottom: 20 }}>{info.text}</p>
                    <div style={{ background: ph.bg, borderRadius: 16, padding: 16, marginBottom: 4 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: ph.color, letterSpacing: 1, marginBottom: 10 }}>MASLAHATLAR</p>
                      {info.tips.map((tip, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: ph.color, marginTop: 5, flexShrink: 0 }} />
                          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setPhasePopup(null)}
                      style={{
                        width: "100%", background: ph.color, color: "#fff",
                        border: "none", borderRadius: 16, padding: 15,
                        fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 20,
                        boxShadow: `0 4px 16px ${ph.color}55`,
                      }}
                    >
                      Tushunarli ✓
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tracker;
