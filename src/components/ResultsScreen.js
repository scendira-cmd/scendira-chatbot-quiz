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

  /* ---------------- POEM ---------------- */
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

  /* ---------------- RECOMMENDATIONS ---------------- */
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
        console.error("Recommendation fetch failed:", e);
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
        {/* ---------- HEADER ---------- */}
        <div className="results-header">
          <h1>Your Perfect Fragrance Profile</h1>
          <div className="profile-badge">
            <h2>{finalResult.data.profile}</h2>
            <p>{finalResult.data.character}</p>
          </div>
        </div>

        {/* ---------- FRAGRANCE DETAILS ---------- */}
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

        {/* ---------- POEM ---------- */}
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

        {/* ---------- RECOMMENDATIONS ---------- */}
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
            <p>No matches found.</p>
          ) : (
            <div className="rec-list">
              {recs.map((p, i) => (
                <article
                  key={p.id || i}
                  className={`rec-card ${
                    hasShopify(p) ? "clickable" : ""
                  }`}
                  onClick={() => {
                    if (p.shopify_url) {
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
                    <h4 className="rec-title">
                      {p.brand} — {p.name}
                    </h4>

                    {p.mood_tags && (
                      <div className="rec-row">
                        <span className="label">Mood :</span>
                        <span className="value">{p.mood_tags}</span>
                      </div>
                    )}

                    {p.notes && (
                      <div className="rec-row">
                        <span className="label">Notes :</span>
                        <span className="value">{p.notes}</span>
                      </div>
                    )}

                    {hasYT(p) && (
                      <div className="rec-row">
                        <span className="label">Reviews :</span>
                        <span className="value yt-links">
                          {p.yt_v1_url && (
                            <a
                              href={p.yt_v1_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT 1
                            </a>
                          )}
                          {p.yt_v2_url && (
                            <a
                              href={p.yt_v2_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT 2
                            </a>
                          )}
                          {p.yt_v3_url && (
                            <a
                              href={p.yt_v3_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              YT 3
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

        {/* ---------- JOURNEY ---------- */}
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

      {/* ---------- ADDITIVE STYLES ---------- */}
      <style>{`
        .rec-card.clickable {
          cursor: pointer;
        }
        .rec-card.clickable:hover {
          border-color: var(--accent);
          background: #161922;
        }
      `}</style>
    </div>
  );
};

export default ResultsScreen;
