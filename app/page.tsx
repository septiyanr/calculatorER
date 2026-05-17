"use client";

import { useState } from "react";

type VideoData = {
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
};

type Category = "Gacor" | "Bagus" | "Normal" | "Rendah";

type CategoryConfig = {
  color: string;
  bar: number;
};

type Result = {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgSaves: number;
  er: number;
  category: Category;
  filledCount: number;
};

const categoryConfig: Record<Category, CategoryConfig> = {
  Gacor:  { color: "#22c55e", bar: 100 },
  Bagus:  { color: "#3b82f6", bar: 65  },
  Normal: { color: "#f59e0b", bar: 35  },
  Rendah: { color: "#ef4444", bar: 12  },
};

const categoryEmoji: Record<Category, string> = {
  Gacor:  "🔥",
  Bagus:  "✅",
  Normal: "📈",
  Rendah: "⚠️",
};

// Tier definitions untuk indikator skala
type Tier = { label: Category; desc: string; color: string };
const tiers: Tier[] = [
  { label: "Rendah", desc: "<2%", color: "#ef4444" },
  { label: "Normal", desc: "≥2%", color: "#f59e0b" },
  { label: "Bagus",  desc: "≥5%", color: "#3b82f6" },
  { label: "Gacor",  desc: "≥8%", color: "#22c55e" },
];

const emptyVideo = (): VideoData => ({
  views: "",
  likes: "",
  comments: "",
  shares: "",
  saves: "",
});

type Step = "setup" | "input";

const videoFields: { field: keyof VideoData; label: string; short: string }[] = [
  { field: "views",    label: "Views",    short: "Views"  },
  { field: "likes",    label: "Likes",    short: "Likes"  },
  { field: "comments", label: "Comments", short: "Cmnt"   },
  { field: "shares",   label: "Shares",   short: "Share"  },
  { field: "saves",    label: "Saves",    short: "Saves"  },
];

const infoItems: [string, Category, string][] = [
  ["<2%",  "Rendah", "#ef4444"],
  ["≥2%",  "Normal", "#f59e0b"],
  ["≥5%",  "Bagus",  "#3b82f6"],
  ["≥8%",  "Gacor",  "#22c55e"],
];

export default function TikTokERCalculator() {
  const [step, setStep]               = useState<Step>("setup");
  const [videoCount, setVideoCount]   = useState<string>("5");
  const [countError, setCountError]   = useState<string>("");
  const [videos, setVideos]           = useState<VideoData[]>([]);
  const [result, setResult]           = useState<Result | null>(null);
  const [showModal, setShowModal]     = useState<boolean>(false);
  const [errors, setErrors]           = useState<string[]>([]);

  /* ── Step 1 ── */
  const handleSetupSubmit = (): void => {
    const n = Number(videoCount);
    if (!videoCount || isNaN(n) || n < 1 || n > 100 || !Number.isInteger(n)) {
      setCountError("Masukkan bilangan bulat antara 1 sampai 100.");
      return;
    }
    setCountError("");
    setVideos(Array.from({ length: n }, emptyVideo));
    setStep("input");
  };

  const handleBack = (): void => {
    setStep("setup");
    setResult(null);
    setErrors([]);
  };

  /* ── Step 2 ── */
  const handleChange = (index: number, field: keyof VideoData, value: string): void => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const calculateER = (): void => {
    const filled = videos.filter(
      (v) => v.views !== "" || v.likes !== "" || v.comments !== "" || v.shares !== "" || v.saves !== ""
    );

    if (filled.length === 0) {
      setErrors(["Isi minimal 1 video sebelum menghitung."]);
      return;
    }
    if (filled.some((v) => v.views === "" || Number(v.views) === 0)) {
      setErrors(["Setiap video yang diisi harus memiliki Views > 0."]);
      return;
    }

    setErrors([]);

    let totalViews = 0, totalLikes = 0, totalComments = 0, totalShares = 0, totalSaves = 0;

    filled.forEach((v) => {
      totalViews    += Number(v.views)    || 0;
      totalLikes    += Number(v.likes)    || 0;
      totalComments += Number(v.comments) || 0;
      totalShares   += Number(v.shares)   || 0;
      totalSaves    += Number(v.saves)    || 0;
    });

    const count   = filled.length;
    const er      = ((totalLikes + totalComments + totalShares + totalSaves) / totalViews) * 100;

    let category: Category = "Rendah";
    if (er >= 8)      category = "Gacor";
    else if (er >= 5) category = "Bagus";
    else if (er >= 2) category = "Normal";

    setResult({
      avgViews:    totalViews    / count,
      avgLikes:    totalLikes    / count,
      avgComments: totalComments / count,
      avgShares:   totalShares   / count,
      avgSaves:    totalSaves    / count,
      er,
      category,
      filledCount: count,
    });
    setShowModal(true);
  };

  const fmt = (n: number): string => Math.round(n).toLocaleString("id-ID");

  const avgRows: [string, string][] = result ? [
    ["👁️ Views",    fmt(result.avgViews)],
    ["❤️ Likes",    fmt(result.avgLikes)],
    ["💬 Comments", fmt(result.avgComments)],
    ["🔁 Shares",   fmt(result.avgShares)],
    ["🔖 Saves",    fmt(result.avgSaves)],
  ] : [];

  /* ── Render ── */
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "2rem 1rem",
      color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }

        .card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; }

        .inp {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #fff;
          padding: 0.6rem 0.5rem;
          font-size: 0.82rem;
          font-family: inherit;
          outline: none;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .inp::placeholder { color: rgba(255,255,255,0.25); }
        .inp:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); }

        .inp-lg {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: #fff;
          padding: 1rem 1.25rem;
          font-size: 1.75rem;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .inp-lg::placeholder { color: rgba(255,255,255,0.2); font-size: 1rem; font-weight: 400; }
        .inp-lg:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); }

        .btn-main {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; letter-spacing: 0.05em;
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-main:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-main:active { transform: translateY(0); }

        .btn-ghost {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-family: inherit; font-size: 0.875rem;
          padding: 0.55rem 1.1rem; border-radius: 10px;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.12); }

        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem; z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn  { from { opacity: 0; }               to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal {
          background: #111827;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 2rem;
          width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
          animation: slideUp 0.25s ease;
        }

        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .stat-row:last-child { border-bottom: none; }

        .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; }

        .progress-track { background: rgba(255,255,255,0.1); border-radius: 999px; height: 8px; overflow: hidden; margin: 0.5rem 0 0.25rem; }
        .progress-fill  { height: 100%; border-radius: 999px; }

        .video-recap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.7rem 1rem; margin-bottom: 0.45rem; }
        .recap-grid  { display: grid; grid-template-columns: repeat(5,1fr); gap: 0.35rem; margin-top: 0.4rem; }
        .mini-stat   { text-align: center; }
        .mini-label  { font-size: 0.58rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.06em; }
        .mini-value  { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; margin-top: 1px; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 0.75rem 1rem; color: #fca5a5; font-size: 0.875rem; margin-bottom: 1rem; }

        .formula-pill {
          display: inline-block;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 8px; padding: 0.45rem 0.85rem;
          font-size: 0.75rem; color: rgba(255,255,255,0.55);
          font-family: monospace;
        }

        .col-header { font-size: 0.62rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.07em; text-align: center; }
        .row-grid { display: grid; grid-template-columns: 28px 1fr 1fr 1fr 1fr 1fr; gap: 0.45rem; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; padding: 0.55rem 0.7rem; }
        .row-num { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#4f46e5); display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:700; flex-shrink:0; }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.2rem" }}>📊</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            TikTok ER Calculator
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Hitung Engagement Rate berdasarkan data video TikTok kamu
          </p>
          <div style={{ marginTop: "0.7rem" }}>
            <span className="formula-pill">
              ER = (Likes + Comments + Shares + Saves) / Views × 100%
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════
            STEP 1 — Jumlah video
        ══════════════════════════════════ */}
        {step === "setup" && (
          <div className="card" style={{ padding: "2rem" }}>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", marginBottom: "0.4rem" }}>
              Langkah 1 dari 2
            </p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.35rem" }}>
              Berapa video yang ingin dihitung?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.8rem", textAlign: "center", marginBottom: "1.4rem" }}>
              Masukkan jumlah video (1 – 100)
            </p>

            <input
              type="number"
              className="inp-lg"
              placeholder="contoh: 10"
              value={videoCount}
              min={1} max={100}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setVideoCount(e.target.value);
                setCountError("");
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSetupSubmit();
              }}
            />

            {countError && (
              <div className="error-box" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                ⚠️ {countError}
              </div>
            )}

            <button type="button" className="btn-main" style={{ marginTop: "1.2rem" }} onClick={handleSetupSubmit}>
              LANJUT →
            </button>

            {/* Kategori info */}
            <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.4rem" }}>
              {infoItems.map(([pct, label, color]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "0.5rem 0.25rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color }}>{pct}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 2 — Input data video
        ══════════════════════════════════ */}
        {step === "input" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <button className="btn-ghost" onClick={handleBack}>← Ubah Jumlah</button>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.8rem" }}>
                {videos.length} video · semua kolom opsional
              </span>
            </div>

            {errors.length > 0 && (
              <div className="error-box">
                {errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
              </div>
            )}

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 1fr 1fr", gap: "0.45rem", padding: "0 0.7rem", marginBottom: "0.35rem" }}>
              <div />
              {videoFields.map(({ label }) => (
                <div key={label} className="col-header">{label}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {videos.map((video, index) => (
                <div key={index} className="row-grid">
                  <div className="row-num">{index + 1}</div>
                  {videoFields.map(({ field }) => (
                    <input
                      key={field}
                      type="number"
                      placeholder="—"
                      value={video[field]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, field, e.target.value)
                      }
                      className="inp"
                      min="0"
                    />
                  ))}
                </div>
              ))}
            </div>

            <button type="button" onClick={calculateER} className="btn-main" style={{ marginTop: "1.2rem" }}>
              HITUNG ENGAGEMENT RATE
            </button>
          </>
        )}
      </div>

      {/* ══════════════════════════════════
          MODAL Hasil
      ══════════════════════════════════ */}
      {showModal && result && (
        <div
          className="overlay"
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            e.target === e.currentTarget && setShowModal(false)
          }
        >
          <div className="modal">
            {/* Header modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 800 }}>Hasil Analisis</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: 2 }}>
                  Berdasarkan {result.filledCount} video
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>

            {/* ER besar */}
            <div style={{
              background: `linear-gradient(135deg, ${categoryConfig[result.category].color}22, transparent)`,
              border: `1px solid ${categoryConfig[result.category].color}44`,
              borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
                Engagement Rate
              </div>
              <div style={{ fontSize: "3rem", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: categoryConfig[result.category].color, lineHeight: 1 }}>
                {result.er.toFixed(2)}%
              </div>
              <div className="badge" style={{
                marginTop: "0.7rem",
                background: `${categoryConfig[result.category].color}22`,
                color: categoryConfig[result.category].color,
                border: `1px solid ${categoryConfig[result.category].color}44`,
                display: "inline-flex",
              }}>
                {categoryEmoji[result.category]} {result.category}
              </div>
              <div className="progress-track" style={{ marginTop: "1rem" }}>
                <div className="progress-fill" style={{
                  width: `${categoryConfig[result.category].bar}%`,
                  background: `linear-gradient(90deg, ${categoryConfig[result.category].color}88, ${categoryConfig[result.category].color})`,
                }} />
              </div>
            </div>

            {/* ── Indikator skala kategori ── */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                Skala Engagement Rate
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.4rem" }}>
                {tiers.map((tier) => {
                  const isActive = result.category === tier.label;
                  return (
                    <div
                      key={tier.label}
                      style={{
                        borderRadius: 10,
                        padding: "0.65rem 0.4rem",
                        textAlign: "center",
                        background: isActive ? `${tier.color}22` : "rgba(255,255,255,0.04)",
                        border: isActive ? `2px solid ${tier.color}` : "1px solid rgba(255,255,255,0.08)",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: "absolute",
                          top: -8,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: tier.color,
                          color: "#000",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                          padding: "1px 6px",
                          borderRadius: 999,
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}>
                          KAMU DI SINI
                        </div>
                      )}
                      <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>
                        {categoryEmoji[tier.label]}
                      </div>
                      <div style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: isActive ? tier.color : "rgba(255,255,255,0.5)",
                      }}>
                        {tier.label}
                      </div>
                      <div style={{
                        fontSize: "0.65rem",
                        color: isActive ? tier.color : "rgba(255,255,255,0.3)",
                        marginTop: "0.15rem",
                        fontWeight: isActive ? 600 : 400,
                      }}>
                        {tier.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                Rata-rata per Video
              </p>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0 1rem" }}>
                {avgRows.map(([label, val]) => (
                  <div key={label} className="stat-row">
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>{label}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rekap per video */}
            <div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                Rekap Per Video
              </p>
              {videos.map((video, index) => {
                const hasData = video.views || video.likes || video.comments || video.shares || video.saves;
                if (!hasData) return null;

                const recapFields: [string, string][] = [
                  ["Views",  video.views],
                  ["Likes",  video.likes],
                  ["Cmnt",   video.comments],
                  ["Share",  video.shares],
                  ["Saves",  video.saves],
                ];

                return (
                  <div key={index} className="video-recap">
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>
                      VIDEO {index + 1}
                    </p>
                    <div className="recap-grid">
                      {recapFields.map(([label, val]) => (
                        <div key={label} className="mini-stat">
                          <div className="mini-label">{label}</div>
                          <div className="mini-value">{Number(val || 0).toLocaleString("id-ID")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowModal(false)} className="btn-main" style={{ marginTop: "1.5rem" }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}