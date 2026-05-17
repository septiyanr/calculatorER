"use client";

import { useState } from "react";

type VideoData = {
  views: string;
  likes: string;
  comments: string;
};

type Category = "Sangat Bagus" | "Bagus" | "Normal" | "Rendah";

type CategoryConfig = {
  color: string;
  bg: string;
  bar: number;
};

type Result = {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  er: number;
  category: Category;
  filledCount: number;
};

const categoryConfig: Record<Category, CategoryConfig> = {
  "Sangat Bagus": { color: "#22c55e", bg: "#f0fdf4", bar: 100 },
  Bagus: { color: "#3b82f6", bg: "#eff6ff", bar: 70 },
  Normal: { color: "#f59e0b", bg: "#fffbeb", bar: 40 },
  Rendah: { color: "#ef4444", bg: "#fef2f2", bar: 15 },
};

const categoryEmoji: Record<Category, string> = {
  "Sangat Bagus": "🔥",
  Bagus: "✅",
  Normal: "📈",
  Rendah: "⚠️",
};

export default function TikTokERCalculator() {
  const [videos, setVideos] = useState<VideoData[]>(
    Array.from({ length: 5 }, () => ({ views: "", likes: "", comments: "" }))
  );
  const [result, setResult] = useState<Result | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (
    index: number,
    field: keyof VideoData,
    value: string
  ): void => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const calculateER = (): void => {
    const filled = videos.filter(
      (v) => v.views !== "" || v.likes !== "" || v.comments !== ""
    );

    if (filled.length === 0) {
      setErrors(["Isi minimal 1 video sebelum menghitung."]);
      return;
    }

    const missingViews = filled.some(
      (v) => v.views === "" || Number(v.views) === 0
    );
    if (missingViews) {
      setErrors(["Setiap video yang diisi harus memiliki Views > 0."]);
      return;
    }

    setErrors([]);

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    filled.forEach((video) => {
      totalViews += Number(video.views) || 0;
      totalLikes += Number(video.likes) || 0;
      totalComments += Number(video.comments) || 0;
    });

    const count = filled.length;
    const avgViews = totalViews / count;
    const avgLikes = totalLikes / count;
    const avgComments = totalComments / count;
    const engagement = totalLikes + totalComments;
    const er = (engagement / totalViews) * 100;

    let category: Category = "Rendah";
    if (er >= 10) category = "Sangat Bagus";
    else if (er >= 5) category = "Bagus";
    else if (er >= 2) category = "Normal";

    setResult({ avgViews, avgLikes, avgComments, er, category, filledCount: count });
    setShowModal(true);
  };

  const fmt = (n: number): string => Math.round(n).toLocaleString("id-ID");

  const infoItems: [string, Category, string][] = [
    ["≥10%", "Sangat Bagus", "#22c55e"],
    ["≥5%", "Bagus", "#3b82f6"],
    ["≥2%", "Normal", "#f59e0b"],
    ["<2%", "Rendah", "#ef4444"],
  ];

  const avgRows: [string, string][] = result
    ? [
        ["👁️ Views", fmt(result.avgViews)],
        ["❤️ Likes", fmt(result.avgLikes)],
        ["💬 Comments", fmt(result.avgComments)],
      ]
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "2rem 1rem",
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }

        .card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; transition: border-color 0.2s; }
        .card:hover { border-color: rgba(255,255,255,0.2); }

        .inp {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #fff;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .inp::placeholder { color: rgba(255,255,255,0.35); }
        .inp:focus { border-color: #7c3aed; background: rgba(124,58,237,0.1); }

        .btn-main {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-main:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-main:active { transform: translateY(0); }

        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal {
          background: #111827;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.25s ease;
        }

        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .stat-row:last-child { border-bottom: none; }

        .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; }

        .progress-track { background: rgba(255,255,255,0.1); border-radius: 999px; height: 8px; overflow: hidden; margin: 0.5rem 0 1.5rem; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(.4,0,.2,1); }

        .video-recap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; }
        .video-recap-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 0.4rem; }
        .mini-stat { text-align: center; }
        .mini-stat-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; }
        .mini-stat-value { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 0.75rem 1rem; color: #fca5a5; font-size: 0.875rem; margin-bottom: 1rem; }
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>📊</div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            TikTok ER Calculator
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.875rem",
              marginTop: "0.4rem",
            }}
          >
            Masukkan data hingga 5 video untuk menghitung Engagement Rate
          </p>
        </div>

        {/* Error */}
        {errors.length > 0 && (
          <div className="error-box">
            {errors.map((e, i) => (
              <p key={i}>⚠️ {e}</p>
            ))}
          </div>
        )}

        {/* Video Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {videos.map((video, index) => (
            <div key={index} className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.85rem",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Video {index + 1}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  opsional
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.6rem",
                }}
              >
                {(["views", "likes", "comments"] as (keyof VideoData)[]).map(
                  (field) => (
                    <input
                      key={field}
                      type="number"
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={video[field]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, field, e.target.value)
                      }
                      className="inp"
                      min="0"
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={calculateER}
          className="btn-main"
          style={{ marginTop: "1.5rem" }}
        >
          HITUNG ENGAGEMENT RATE
        </button>

        {/* Info */}
        <div
          style={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.4rem",
            textAlign: "center",
          }}
        >
          {infoItems.map(([pct, label, color]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "0.5rem 0.25rem",
              }}
            >
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color }}>
                {pct}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && result && (
        <div
          className="overlay"
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            e.target === e.currentTarget && setShowModal(false)
          }
        >
          <div className="modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                  }}
                >
                  Hasil Analisis
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.8rem",
                    marginTop: 2,
                  }}
                >
                  Berdasarkan {result.filledCount} video
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* ER Result */}
            <div
              style={{
                background: `linear-gradient(135deg, ${categoryConfig[result.category].color}22, transparent)`,
                border: `1px solid ${categoryConfig[result.category].color}44`,
                borderRadius: 14,
                padding: "1.25rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}
              >
                Engagement Rate
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  color: categoryConfig[result.category].color,
                  lineHeight: 1,
                }}
              >
                {result.er.toFixed(2)}%
              </div>
              <div
                className="badge"
                style={{
                  marginTop: "0.75rem",
                  background: `${categoryConfig[result.category].color}22`,
                  color: categoryConfig[result.category].color,
                  border: `1px solid ${categoryConfig[result.category].color}44`,
                  display: "inline-flex",
                }}
              >
                {categoryEmoji[result.category]} {result.category}
              </div>

              <div className="progress-track" style={{ marginTop: "1rem" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${categoryConfig[result.category].bar}%`,
                    background: `linear-gradient(90deg, ${categoryConfig[result.category].color}88, ${categoryConfig[result.category].color})`,
                  }}
                />
              </div>
            </div>

            {/* Averages */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.6rem",
                }}
              >
                Rata-rata
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "0 1rem",
                }}
              >
                {avgRows.map(([label, val]) => (
                  <div key={label} className="stat-row">
                    <span
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-video recap */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.6rem",
                }}
              >
                Rekap Per Video
              </p>
              {videos.map((video, index) => {
                const hasData = video.views || video.likes || video.comments;
                if (!hasData) return null;

                const recapFields: [string, string][] = [
                  ["Views", video.views],
                  ["Likes", video.likes],
                  ["Comments", video.comments],
                ];

                return (
                  <div key={index} className="video-recap">
                    <p
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      VIDEO {index + 1}
                    </p>
                    <div className="video-recap-grid">
                      {recapFields.map(([label, val]) => (
                        <div key={label} className="mini-stat">
                          <div className="mini-stat-label">{label}</div>
                          <div className="mini-stat-value">
                            {Number(val || 0).toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="btn-main"
              style={{ marginTop: "1.5rem" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}