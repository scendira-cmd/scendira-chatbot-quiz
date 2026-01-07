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
      className={`perfume-card ${p.shopify_url ? "clickable" : ""}`}
      onClick={() => {
        if (p.shopify_url) {
          window.open(p.shopify_url, "_blank", "noopener,noreferrer");
        }
      }}
      role={p.shopify_url ? "button" : undefined}
      tabIndex={p.shopify_url ? 0 : undefined}
      onKeyDown={(e) => {
        if (
          p.shopify_url &&
          (e.key === "Enter" || e.key === " ")
        ) {
          window.open(p.shopify_url, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <div className="card-rank">#{i + 1}</div>

      <div className="card-body">
        {/* Title */}
        <h4 className="card-title">
          {p.brand} — {p.name}
        </h4>

        {/* Chips */}
        <div className="card-chips">
          {p.price_tier && <span className="chip">{p.price_tier}</span>}
          {p.gender_positioning && (
            <span className="chip">{p.gender_positioning}</span>
          )}
          {p.scent_family && (
            <span className="chip">{p.scent_family}</span>
          )}
        </div>

        {/* Rows */}
        {p.mood_tags && (
          <div className="card-row">
            <span className="label">Mood:</span>
            <span className="value">{p.mood_tags}</span>
          </div>
        )}

        {p.occasion_time_of_day && (
          <div className="card-row">
            <span className="label">Occasion:</span>
            <span className="value">{p.occasion_time_of_day}</span>
          </div>
        )}

        {p.seasonality_climate_suitability && (
          <div className="card-row">
            <span className="label">Season:</span>
            <span className="value">
              {p.seasonality_climate_suitability}
            </span>
          </div>
        )}

        {p.notes && (
          <div className="card-row">
            <span className="label">Notes:</span>
            <span className="value">{p.notes}</span>
          </div>
        )}

        {(p.dupe_info || p.dupe_rating) && (
          <div className="card-row">
            <span className="label">Similar to:</span>
            <span className="value">
              {p.dupe_info}
              {p.dupe_rating && ` (${p.dupe_rating}/10)`}
            </span>
          </div>
        )}

        {/* YouTube links — STOP PROPAGATION */}
        {(p.yt_v1_url || p.yt_v2_url || p.yt_v3_url) && (
          <div className="card-row">
            <span className="label">Reviews:</span>
            <span className="yt-links">
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

      <style>{`
        .rec-card.clickable {
          cursor: pointer;
        }
        .rec-card.clickable:hover {
          border-color: var(--accent);
          background: #161922;
        }

        .perfume-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--panel);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.perfume-card.clickable {
  cursor: pointer;
}

.perfume-card.clickable:hover {
  border-color: var(--accent);
  background: #161922;
}

.card-rank {
  min-width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #0e1015;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
}

.card-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-row {
  display: flex;
  gap: 6px;
  line-height: 1.5;
}

.label {
  font-weight: 700;
  color: var(--muted);
}

.yt-links a {
  margin-right: 10px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: underline;
}

        
      `}</style>
    </div>
  );
};

export default ResultsScreen;
