import React, { useState, useEffect, useMemo } from "react";

const ResultsScreen = ({ finalResult, userAnswers, aiClassifier }) => {
  const [poem, setPoem] = useState("");
  const [isLoadingPoem, setIsLoadingPoem] = useState(true);

  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [recError, setRecError] = useState("");

  const hasYT = (p) => !!(p?.yt_v1_url || p?.yt_v2_url || p?.yt_v3_url);
  const hasShopify = (p) => !!p?.shopify_url;
  const cleanText = (s) => (s || "").toString().replace(/\s+/g, " ").trim();

  useEffect(() => {
    const generatePoem = async () => {
      if (!finalResult || !aiClassifier) return;
      try {
        setIsLoadingPoem(true);
        const generatedPoem = await aiClassifier.generatePersonalizedPoem(
          userAnswers,
          finalResult.data
        );
        setPoem(generatedPoem);
      } catch {
        setPoem(
          "Your fragrance journey is unique and beautiful,\nA scent that tells your personal story."
        );
      } finally {
        setIsLoadingPoem(false);
      }
    };
    generatePoem();
  }, [finalResult, userAnswers, aiClassifier]);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!finalResult) return;
      setIsLoadingRecommendations(true);
      setRecError("");
      try {
        const baseUrl =
          process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
        const payload = {
          quiz_results: {
            finalResult,
            userAnswers,
            answersArray: Object.values(userAnswers).map((a) => ({
              question: a.question,
              answer: a.answer,
              type: a.type,
              selected_image: a.selectedImage,
            })),
            timestamp: new Date().toISOString(),
          },
        };
        const res = await fetch(`${baseUrl}/api/process-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setRecommendations(
          Array.isArray(data.recommendations) ? data.recommendations : []
        );
      } catch (e) {
        console.error(e);
        setRecError("We couldn’t load recommendations right now.");
        setRecommendations([]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };
    fetchRecs();
  }, [finalResult, userAnswers]);

  const recs = useMemo(
    () =>
      (recommendations || []).map((r) => ({
        ...r,
        brand: cleanText(r.brand),
        name: cleanText(r.name),
        gender_positioning: cleanText(r.gender_positioning),
        notes: cleanText(r.notes),
        mood_tags: cleanText(r.mood_tags),
        scent_family: cleanText(r.scent_family),
        occasion_time_of_day: cleanText(r.occasion_time_of_day),
        seasonality_climate_suitability: cleanText(
          r.seasonality_climate_suitability
        ),
        price_tier: cleanText(r.price_tier),
        dupe_info: cleanText(r.dupe_info),
        sillage_longevity: cleanText(r.sillage_longevity),
      })),
    [recommendations]
  );

  if (!finalResult) {
    return (
      <div className="results-screen">
        <div className="results-container">
          <h2>Loading your results...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="results-screen">
      <div className="results-container">
        <div className="results-header">
          <h1>Your Perfect Fragrance Profile</h1>
          <div className="profile-badge">
            <h2>{finalResult.data.profile}</h2>
            <p>{finalResult.data.character}</p>
          </div>
        </div>

        <div className="fragrance-details">
          {finalResult.data.image && (
            <div className="fragrance-image">
              <img
                src={`${process.env.PUBLIC_URL}/images/${finalResult.data.image}`}
                alt={finalResult.data.profile}
                className="result-image"
              />
            </div>
          )}

          <div className="fragrance-info">
            <h3>Your Signature Scent Story</h3>
            {finalResult.data.description && (
              <p className="description">{finalResult.data.description}</p>
            )}

            {Array.isArray(finalResult.data.notes) &&
              finalResult.data.notes.length > 0 && (
                <div className="fragrance-notes">
                  <h4>Key Notes</h4>
                  <div className="notes-grid">
                    {finalResult.data.notes.map((note, index) => (
                      <span key={index} className="note-tag">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {finalResult.data.mood && (
              <div className="fragrance-mood">
                <h4>Perfect For</h4>
                <p>{finalResult.data.mood}</p>
              </div>
            )}
          </div>
        </div>

        <div className="personalized-poem">
          <h3>Your Fragrance Poem</h3>
          {isLoadingPoem ? (
            <div className="poem-loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Crafting your personalized poem...</p>
            </div>
          ) : (
            <div className="poem-content">
              {poem.split("\n").map((line, index) => (
                <p key={index} className="poem-line">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="perfume-recommendations">
          <h3>Your Perfect Fragrance Matches</h3>

          {isLoadingRecommendations ? (
            <div className="recommendations-loading">
              <div className="loading-spinner" />
              <p>Finding your perfect fragrance matches...</p>
            </div>
          ) : recError ? (
            <p className="recommendation-error">{recError}</p>
          ) : recs.length === 0 ? (
            <p>
              We couldn’t find matches from your answers. Try refining your
              choices.
            </p>
          ) : (
            <div className="rec-list">
              {recs.map((p, i) => (
                <article
                  key={p.id || i}
                  className="rec-card"
                  onClick={() => {
                    if (hasShopify(p)) {
                      window.open(
                        p.shopify_url,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                  role={hasShopify(p) ? "button" : undefined}
                  tabIndex={hasShopify(p) ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      hasShopify(p) &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      window.open(
                        p.shopify_url,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                >
                  <div className="rec-rank">#{i + 1}</div>

                  <div className="rec-main">
                    {/* Title + chips */}
                    <div className="rec-title-block">
                      <h4 className="rec-title">
                        {p.brand} — {p.name}
                      </h4>
                      <div className="rec-chips">
                        {p.price_tier && (
                          <span className="chip">{p.price_tier}</span>
                        )}
                        {p.gender_positioning && (
                          <span className="chip">{p.gender_positioning}</span>
                        )}
                        {p.scent_family && (
                          <span className="chip">{p.scent_family}</span>
                        )}
                      </div>
                    </div>

                    {/* Inline (single-line-per-field) rows */}
                    {p.mood_tags && (
                      <div className="rec-row">
                        <span className="label">Mood :</span>
                        <span className="value">{p.mood_tags}</span>
                      </div>
                    )}

                    {p.occasion_time_of_day && (
                      <div className="rec-row">
                        <span className="label">Occasion :</span>
                        <span className="value">{p.occasion_time_of_day}</span>
                      </div>
                    )}

                    {p.seasonality_climate_suitability && (
                      <div className="rec-row">
                        <span className="label">Season :</span>
                        <span className="value">
                          {p.seasonality_climate_suitability}
                        </span>
                      </div>
                    )}

                    {p.region && (
                      <div className="rec-row">
                        <span className="label">Region :</span>
                        <span className="value">{p.region}</span>
                      </div>
                    )}

                    {p.notes && (
                      <div className="rec-row">
                        <span className="label">Notes :</span>
                        <span className="value">{p.notes}</span>
                      </div>
                    )}

                    {(p.dupe_info || p.dupe_rating) && (
                      <div className="rec-row">
                        <span className="label">Similar to :</span>
                        <span className="value">
                          {p.dupe_info}
                          {p.dupe_rating && (
                            <span className="dupe-rating">
                              {" "}
                              (Rating: {p.dupe_rating}/10)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {hasYT(p) && (
                      <div className="rec-row">
                        <span className="label">Reviews & Videos :</span>
                        <span className="value yt-links">
                          {p.yt_v1_url && (
                            <a
                              href={p.yt_v1_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT Link 1
                            </a>
                          )}
                          {p.yt_v2_url && (
                            <a
                              href={p.yt_v2_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT Link 2
                            </a>
                          )}
                          {p.yt_v3_url && (
                            <a
                              href={p.yt_v3_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT Link 3
                            </a>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="quiz-summary">
          <h3>Your Journey</h3>
          <div className="journey-steps">
            {Object.entries(userAnswers).map(([qid, ans], idx) => (
              <div key={qid} className="journey-step">
                <div className="step-number">{idx + 1}</div>
                <div className="step-content">
                  <p className="step-question">{ans.question}</p>
                  <p className="step-answer">{ans.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Styles (dark UI, single-line label:value rows) ===== */}
      <style>{`
        :root{
          --bg: #0b0c10;
          --panel: #14161a;
          --panel-2: #121419;
          --border: #21242c;
          --muted: #b8c0cc;
          --text: #f3f5f9;
          --chip: #1e2229;
          --chip-border: #2a2f39;
          --accent: #7dc0ff;
          --good: #6ee7b7;
        }

        .results-screen { background: var(--bg); color: var(--text); }
        .results-container { max-width: 980px; margin: 0 auto; padding: 20px 16px 60px; }

        .results-header h1 { margin: 0 0 8px; font-size: 28px; line-height: 1.2; }
        .profile-badge { display:inline-block; background: var(--panel); border:1px solid var(--border); border-radius:14px; padding:10px 14px; margin:6px 0 18px; }
        .profile-badge h2 { margin:0; font-size:18px; }
        .profile-badge p { margin:2px 0 0; color: var(--muted); }

        .fragrance-details { display:grid; grid-template-columns:160px 1fr; gap:16px; align-items:start; margin-bottom:28px; }
        .fragrance-image img { width:160px; height:160px; object-fit:cover; border-radius:12px; border:1px solid var(--border); background:#0f1115; }
        .fragrance-info h3 { margin:0 0 8px; }
        .description { margin:0 0 10px; color: var(--muted); }
        .fragrance-notes .notes-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .note-tag { background: var(--chip); border:1px solid var(--chip-border); border-radius:999px; padding:6px 10px; font-size:12px; }

        .personalized-poem { background: var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:22px; }
        .poem-content .poem-line { margin: 2px 0; }
        .typing-indicator { display:inline-flex; gap:4px; margin-bottom:6px; }
        .typing-indicator span { width:6px; height:6px; background: var(--muted); border-radius:999px; display:inline-block; animation:pulse 1.2s infinite ease-in-out; }
        .typing-indicator span:nth-child(2){ animation-delay:.15s } .typing-indicator span:nth-child(3){ animation-delay:.3s }
        @keyframes pulse { 0%,80%,100%{opacity:.25;transform:translateY(0)} 40%{opacity:1;transform:translateY(-2px)} }

        .perfume-recommendations h3 { margin:0 0 12px; }
        .rec-list { display:flex; flex-direction:column; gap:12px; }

        .rec-card { display:flex; gap:14px; align-items:flex-start; border:1px solid var(--border); border-radius:14px; padding:12px; background: var(--panel); }
        .rec-rank { min-width:46px; height:46px; border-radius:10px; background:#0e1015; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; }
        .rec-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:10px; }

        .rec-title-block { display:flex; flex-direction:column; gap:6px; }
        .rec-title { margin:0; font-size:18px; line-height:1.35; word-break:break-word; white-space:normal; }
        .rec-chips { display:flex; gap:6px; flex-wrap:wrap; }
        .chip { background: var(--chip); border:1px solid var(--chip-border); border-radius:999px; padding:4px 8px; font-size:12px; }

        /* Inline label:value rows */
        .rec-row { display:flex; gap:8px; flex-wrap:wrap; line-height:1.45; }
        .label { color: var(--muted); font-weight:700; font-size:13px; }
        .value { color: var(--text); font-size:14px; word-break:break-word; white-space:normal; }

        .dupe-rating { color: var(--good); font-weight:600; }

        .yt-links { display:inline-flex; gap:10px; flex-wrap:wrap; }
        .yt-links a { text-decoration: underline; font-weight:600; color: var(--accent); }

        .quiz-summary { margin-top:26px; }
        .journey-steps { display:grid; gap:10px; }
        .journey-step { display:grid; grid-template-columns:30px 1fr; gap:10px; align-items:start; }
        .step-number { width:30px; height:30px; border-radius:8px; background:#0e1015; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; }
        .step-question { margin:0 0 4px; font-weight:600; }
        .step-answer { margin:0; color: var(--muted); }

        .recommendations-loading { display:flex; gap:10px; align-items:center; color: var(--muted); }
        .loading-spinner { width:16px; height:16px; border-radius:999px; border:2px solid #2b303a; border-top-color: var(--accent); animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 720px) {
          .fragrance-details { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ResultsScreen;
