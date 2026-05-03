import { useState, useMemo, useEffect } from "react";

const SHEETDB_URL = "https://sheetdb.io/api/v1/xc3g485ekjeep";

async function fetchDrinks() {
  const res = await fetch(SHEETDB_URL);
  const data = await res.json();
  return data.reverse();
}

async function insertDrink(drink) {
  await fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [drink] }),
  });
}

const RATING_CONFIG = {
  "Love":        { emoji: "♥", color: "#e8785a", rank: 4 },
  "Like":        { emoji: "✓", color: "#a3c27a", rank: 3 },
  "Meh":         { emoji: "~", color: "#c4a84f", rank: 2 },
  "Never Again": { emoji: "✕", color: "#8a8a8a", rank: 1 },
};

const TYPE_EMOJI = { Beer: "🍺", Wine: "🍷", Cider: "🍎" };

const EMPTY_FORM = {
  Timestamp: "",
  "Jess or Pierre": "Pierre",
  "Whatru Drinking": "Beer",
  "Winery/Brewery": "",
  Drink: "",
  style: "",
  Where: "",
  "Like it or Love it?": "Love",
  taste_body: 50,
  taste_char: 50,
  taste_sweet: 50,
  taste_bitter: 50,
};

export default function App() {
  const [view, setView] = useState("journal");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [filterWho, setFilterWho] = useState("All");
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [recommendation, setRecommendation] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [exploreRec, setExploreRec] = useState("");
  const [exploring, setExploring] = useState(false);
  const [sliders, setSliders] = useState({ body: 30, char: 25, sweet: 15, bitter: 35 });

  const bodyLabels = ["Light","Light-medium","Medium","Medium-bold","Bold"];
  const charLabels = ["Crisp","Clean","Complex","Earthy","Funky"];
  const sweetLabels = ["Bone dry","Dry","Off-dry","Semi-sweet","Sweet"];
  const bitterLabels = ["Low","Subtle","Moderate","Bitter","Very hoppy"];
  const getLabel = (labels, val) => labels[Math.min(4, Math.floor(val / 21))];

  const getExploreRec = async () => {
    setExploring(true);
    setExploreRec("");
    const season = getSeason();
    const prompt = `You are a knowledgeable craft beer and natural wine advisor. Recommend ONE specific drink based on this taste profile.

Body: ${getLabel(bodyLabels, sliders.body)} (${sliders.body}/100)
Character: ${getLabel(charLabels, sliders.char)} (${sliders.char}/100)
Sweetness: ${getLabel(sweetLabels, sliders.sweet)} (${sliders.sweet}/100)
Bitterness: ${getLabel(bitterLabels, sliders.bitter)} (${sliders.bitter}/100)
Season: ${season}

Respond in exactly this format:
Line 1: Drink name, brewery/winery, and style only
Line 2: blank
Line 3+: 2-3 sentences on why it fits this profile and the season. Be confident and specific.`;

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    setExploreRec(data.content?.[0]?.text || "Couldn't get a recommendation.");
    setExploring(false);
  };

  const scanLabel = async (file) => {
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      const mediaType = file.type || "image/jpeg";
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        alert("Scan result: " + JSON.stringify(data));
        setForm(f => ({
          ...f,
          Drink: data.name || f.Drink,
          "Winery/Brewery": data.brewery || f["Winery/Brewery"],
          style: data.style || f.style,
          "Whatru Drinking": data.type || f["Whatru Drinking"],
        }));
      } catch (err) {
        alert("Scan error: " + err.message);
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const getSeason = () => {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return "spring";
    if (m >= 5 && m <= 7) return "summer";
    if (m >= 8 && m <= 10) return "autumn";
    return "winter";
  };

  const getRecommendation = async () => {
    setRecommending(true);
    setRecommendation("");
    const loves = allEntries
      .filter(e => e["Like it or Love it?"] === "Love")
      .slice(-30)
      .map(e => `${e.Drink || ""} by ${e["Winery/Brewery"] || ""} (${e.style || e["Whatru Drinking"]})`);
    const neverAgain = [...new Set(
      allEntries
        .filter(e => e["Like it or Love it?"] === "Never Again")
        .map(e => e.style || e["Whatru Drinking"])
    )];
    const season = getSeason();
    const prompt = `You are a knowledgeable craft beer and natural wine advisor. Based on this person's drink history, suggest ONE specific drink they'd enjoy.

Drinks they loved (most recent first):
${loves.join("\n")}

Current season: ${season}

Respond in exactly this format:
Line 1: The drink name, brewery/winery, and style only
Line 2: blank line
Line 3+: 2-3 sentences on why it fits their taste and the season. Do not mention anything they disliked. Be confident and specific.`;

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    setRecommendation(data.content?.[0]?.text || "Couldn't get a recommendation right now.");
    setRecommending(false);
  };

  useEffect(() => {
    fetchDrinks().then(data => {
      setAllEntries(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return allEntries
      .filter(e => filterType === "All" || e["Whatru Drinking"] === filterType)
      .filter(e => filterRating === "All" || e["Like it or Love it?"] === filterRating)
      .filter(e => filterWho === "All" || e["Jess or Pierre"] === filterWho)
      .filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (e.Drink || "").toLowerCase().includes(q) ||
               (e["Winery/Brewery"] || "").toLowerCase().includes(q) ||
               (e.style || "").toLowerCase().includes(q) ||
               (e.Where || "").toLowerCase().includes(q);
      });
  }, [allEntries, filterType, filterRating, filterWho, search]);

  const stats = useMemo(() => {
    const total = allEntries.length;
    const loves = allEntries.filter(e => e["Like it or Love it?"] === "Love").length;
    const neverAgain = allEntries.filter(e => e["Like it or Love it?"] === "Never Again").length;
    const typeCounts = {};
    const breweryCounts = {};
    const whereCounts = {};
    allEntries.forEach(e => {
      const t = e["Whatru Drinking"];
      const b = e["Winery/Brewery"];
      const w = e["Where"];
      if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
      if (b) breweryCounts[b] = (breweryCounts[b] || 0) + 1;
      if (w) whereCounts[w] = (whereCounts[w] || 0) + 1;
    });
    const topBreweries = Object.entries(breweryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topPlaces = Object.entries(whereCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, loves, neverAgain, typeCounts, topBreweries, topPlaces };
  }, [allEntries]);

  const handleAdd = async () => {
    setSaving(true);
    const today = new Date().toLocaleString("en-US", {
      month: "numeric", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", second: "2-digit",
    });
    const newDrink = { ...form, Timestamp: today };
    await insertDrink(newDrink);
    setAllEntries(prev => [newDrink, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1410", color: "#f0e8d8", fontFamily: "'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1410; }
        ::-webkit-scrollbar-thumb { background: #4a3c28; border-radius: 2px; }
        .entry-card { transition: background 0.15s; }
        .entry-card:hover { background: #2a2018 !important; }
        .nav-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .nav-btn:hover { opacity: 0.75; }
        .filter-pill { cursor: pointer; transition: all 0.15s; }
        .filter-pill:hover { opacity: 0.8; }
        .add-btn { transition: all 0.2s; }
        .add-btn:hover { transform: scale(1.05); }
        input, select { outline: none; }
        input::placeholder { color: #6a5a3a; }
      `}</style>

      <div style={{ borderBottom: "1px solid #3a2e1e", padding: "20px 20px 0", background: "#16110d" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, letterSpacing: 4, color: "#8a6a3a", textTransform: "uppercase", marginBottom: 4 }}>A Record Of</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, lineHeight: 1, color: "#f0e8d8" }}>What We Drank</h1>
            </div>
            <button onClick={() => setShowForm(true)} className="add-btn" style={{ background: "#e8785a", color: "#1a1410", border: "none", borderRadius: 4, padding: "8px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, letterSpacing: 1, cursor: "pointer" }}>
              + Log Drink
            </button>
          </div>
          <div style={{ display: "flex" }}>
            {[["journal", "Journal"], ["stats", "Stats"], ["explore", "Explore"]].map(([v, l]) => (
              <button key={v} className="nav-btn" onClick={() => setView(v)} style={{
                background: "none", color: view === v ? "#f0e8d8" : "#6a5a3a",
                padding: "8px 20px", fontSize: 13, letterSpacing: 1, fontFamily: "'DM Mono', monospace",
                borderBottom: view === v ? "2px solid #e8785a" : "2px solid transparent",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 80px" }}>
        {view === "journal" && (
          <>
            <div style={{ padding: "16px 0 12px" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, brewery, style, place..."
                style={{ width: "100%", background: "#231c12", border: "1px solid #3a2e1e", borderRadius: 4, padding: "10px 14px", color: "#f0e8d8", fontFamily: "'DM Mono', monospace", fontSize: 12, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All", "Beer", "Wine", "Cider"].map(t => (
                  <span key={t} className="filter-pill" onClick={() => setFilterType(t)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
                    background: filterType === t ? "#e8785a" : "#2a2018", color: filterType === t ? "#1a1410" : "#8a7a5a",
                    border: filterType === t ? "none" : "1px solid #3a2e1e"
                  }}>{t}</span>
                ))}
                <span style={{ width: 1, height: 20, background: "#3a2e1e", margin: "4px 4px 0" }} />
                {["All", "Love", "Like", "Meh", "Never Again"].map(r => (
                  <span key={r} className="filter-pill" onClick={() => setFilterRating(r)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
                    background: filterRating === r ? (RATING_CONFIG[r]?.color || "#e8785a") : "#2a2018",
                    color: filterRating === r ? "#1a1410" : "#8a7a5a",
                    border: filterRating === r ? "none" : "1px solid #3a2e1e"
                  }}>{r}</span>
                ))}
                <span style={{ width: 1, height: 20, background: "#3a2e1e", margin: "4px 4px 0" }} />
                {["All", "Pierre", "Jess"].map(w => (
                  <span key={w} className="filter-pill" onClick={() => setFilterWho(w)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
                    background: filterWho === w ? "#a3c27a" : "#2a2018", color: filterWho === w ? "#1a1410" : "#8a7a5a",
                    border: filterWho === w ? "none" : "1px solid #3a2e1e"
                  }}>{w}</span>
                ))}
              </div>
              <div style={{ marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a4a2a" }}>
                {loading ? "Loading..." : `${filtered.length} of ${allEntries.length} entries`}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a3a2a" }}>Loading your drinks...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filtered.map((e, i) => {
                  const rating = e["Like it or Love it?"];
                  const rc = RATING_CONFIG[rating] || RATING_CONFIG["Like"];
                  const type = e["Whatru Drinking"];
                  const name = e.Drink || e["Winery/Brewery"];
                  const brewery = e["Winery/Brewery"];
                  const where = e.Where;
                  const who = e["Jess or Pierre"];
                  const date = e.Timestamp?.split(" ")[0] || "";
                  const currYear = date.split("/")[2];
                  const prevYear = filtered[i - 1]?.Timestamp?.split(" ")[0]?.split("/")[2];
                  const showYear = currYear !== prevYear;
                  return (
                    <div key={i}>
                      {showYear && (
                        <div style={{ padding: "16px 0 6px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#5a4a2a", borderTop: i > 0 ? "1px solid #2a2018" : "none", marginTop: i > 0 ? 8 : 0 }}>
                          {currYear}
                        </div>
                      )}
                      <div className="entry-card" onClick={() => setSelectedEntry(e)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderRadius: 4, cursor: "pointer" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2a2018", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                          {TYPE_EMOJI[type] || "🥂"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#f0e8d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                          {brewery && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#6a5a3a", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brewery}</div>}
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rc.color + "22", border: `1px solid ${rc.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: rc.color, fontFamily: "'DM Mono', monospace", fontWeight: 500, flexShrink: 0 }}>
                          {rc.emoji}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "stats" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[["Total Logged", stats.total, "#f0e8d8"], ["Loved", stats.loves, "#e8785a"], ["Never Again", stats.neverAgain, "#6a6a6a"]].map(([label, val, color]) => (
                <div key={label} style={{ background: "#231c12", borderRadius: 4, padding: "16px 12px", textAlign: "center", border: "1px solid #3a2e1e" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 10 }}>By Type</div>
              {Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 60, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a5a" }}>{TYPE_EMOJI[type]} {type}</div>
                  <div style={{ flex: 1, height: 4, background: "#2a2018", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#e8785a", borderRadius: 2, width: `${(count / stats.total * 100).toFixed(0)}%` }} />
                  </div>
                  <div style={{ width: 36, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a", textAlign: "right" }}>{count}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 10 }}>By Rating</div>
              {Object.entries(RATING_CONFIG).sort((a, b) => b[1].rank - a[1].rank).map(([rating, cfg]) => {
                const count = allEntries.filter(e => e["Like it or Love it?"] === rating).length;
                return (
                  <div key={rating} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 80, fontFamily: "'DM Mono', monospace", fontSize: 11, color: cfg.color }}>{cfg.emoji} {rating}</div>
                    <div style={{ flex: 1, height: 4, background: "#2a2018", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: cfg.color, borderRadius: 2, width: `${(count / stats.total * 100).toFixed(0)}%` }} />
                    </div>
                    <div style={{ width: 36, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a", textAlign: "right" }}>{count}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 10 }}>Top Breweries</div>
                {stats.topBreweries.map(([name, count], i) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4a3a2a", width: 14 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a5a", lineHeight: 1.3 }}>{name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a" }}>{count}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 10 }}>Top Spots</div>
                {stats.topPlaces.map(([name, count], i) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4a3a2a", width: 14 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a5a" }}>{name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a" }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recommendation */}
            <div style={{ marginTop: 24, borderTop: "1px solid #2a2018", paddingTop: 24 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 12 }}>Feeling Adventurous?</div>
              <button onClick={getRecommendation} disabled={recommending} style={{
                width: "100%", background: recommending ? "#2a2018" : "#1e1812",
                color: recommending ? "#6a5a3a" : "#e8785a", border: "1px solid #e8785a44",
                borderRadius: 4, padding: "12px", fontFamily: "'DM Mono', monospace",
                fontSize: 12, letterSpacing: 1, cursor: recommending ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}>
                {recommending ? "Thinking..." : "♥ Recommend Something"}
              </button>
              {recommendation && (
                <div style={{ marginTop: 12, background: "#1e1812", border: "1px solid #3a2e1e", borderRadius: 4, padding: "16px" }}>
                  {(() => {
                    const lines = recommendation.split("\n");
                    const drinkLine = lines[0]?.replace(/\*\*/g, "");
                    const body = lines.slice(1).filter(l => l.trim()).join(" ");
                    return (
                      <>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8785a", lineHeight: 1.4, marginBottom: 10 }}>{drinkLine}</div>
                        <div style={{ fontFamily: "'Georgia', serif", fontSize: 13, color: "#c0b090", lineHeight: 1.7 }}>{body}</div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "explore" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#8a7a5a", marginBottom: 20 }}>Drag the sliders to describe what you're in the mood for, then get a recommendation.</div>

            {[
              ["Body", "body", "Light", "Bold", bodyLabels],
              ["Character", "char", "Crisp", "Funky", charLabels],
              ["Sweetness", "sweet", "Dry", "Sweet", sweetLabels],
              ["Bitterness", "bitter", "Low", "Hoppy / tannic", bitterLabels],
            ].map(([label, key, lo, hi, labels]) => (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a5a", letterSpacing: 0.5 }}>{label}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#e8785a" }}>{getLabel(labels, sliders[key])}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a3a2a", width: 36 }}>{lo}</span>
                  <input type="range" min="0" max="100" value={sliders[key]}
                    onChange={e => setSliders(s => ({ ...s, [key]: parseInt(e.target.value) }))}
                    style={{ flex: 1, accentColor: "#e8785a" }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a3a2a", width: 36, textAlign: "right" }}>{hi}</span>
                </div>
              </div>
            ))}

            <button onClick={getExploreRec} disabled={exploring} style={{ width: "100%", background: exploring ? "#2a2018" : "#1e1812", color: exploring ? "#6a5a3a" : "#e8785a", border: "1px solid #e8785a44", borderRadius: 4, padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1, cursor: exploring ? "not-allowed" : "pointer", marginBottom: 16 }}>
              {exploring ? "Thinking..." : "♥ Find something that matches"}
            </button>

            {exploreRec && (
              <div style={{ background: "#1e1812", border: "1px solid #3a2e1e", borderRadius: 4, padding: "16px" }}>
                {(() => {
                  const lines = exploreRec.split("\n");
                  const drinkLine = lines[0]?.replace(/\*\*/g, "");
                  const body = lines.slice(1).filter(l => l.trim()).join(" ");
                  return (
                    <>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#e8785a", lineHeight: 1.4, marginBottom: 10 }}>{drinkLine}</div>
                      <div style={{ fontFamily: "'Georgia', serif", fontSize: 13, color: "#c0b090", lineHeight: 1.7 }}>{body}</div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEntry && (() => {
        const e = selectedEntry;
        const rc = RATING_CONFIG[e["Like it or Love it?"]] || RATING_CONFIG["Like"];
        const date = e.Timestamp?.split(" ")[0] || "";
        return (
          <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setSelectedEntry(null)}>
            <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#1e1812", borderRadius: "12px 12px 0 0", padding: "24px 20px", border: "1px solid #3a2e1e" }} onClick={ev => ev.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f0e8d8", lineHeight: 1.2 }}>{e.Drink || e["Winery/Brewery"]}</div>
                  {e.style && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a", marginTop: 4 }}>{e.style}</div>}
                </div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: rc.color + "22", border: `1px solid ${rc.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: rc.color, flexShrink: 0 }}>{rc.emoji}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Rating", e["Like it or Love it?"]],
                  ["Type", e["Whatru Drinking"]],
                  ["Brewery / Winery", e["Winery/Brewery"]],
                  ["Style", e.style],
                  ["Where", e.Where],
                  ["Who", e["Jess or Pierre"]],
                  ["Date", date],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} style={{ background: "#2a2018", borderRadius: 4, padding: "10px 12px" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a4a2a", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: "'Georgia', serif", fontSize: 13, color: "#c0b090" }}>{val}</div>
                  </div>
                ))}
              </div>
              {(e.taste_body || e.taste_char || e.taste_sweet || e.taste_bitter) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a4a2a", letterSpacing: 0.5, marginBottom: 10 }}>Taste Profile</div>
                  {[
                    ["Body", "taste_body", bodyLabels],
                    ["Character", "taste_char", charLabels],
                    ["Sweetness", "taste_sweet", sweetLabels],
                    ["Bitterness", "taste_bitter", bitterLabels],
                  ].filter(([, key]) => e[key]).map(([label, key, labels]) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a4a2a" }}>{label}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#e8785a" }}>{getLabel(labels, parseInt(e[key]))}</span>
                      </div>
                      <div style={{ height: 4, background: "#2a2018", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${e[key]}%`, background: "#e8785a44", borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setSelectedEntry(null)} style={{ width: "100%", background: "transparent", color: "#6a5a3a", border: "1px solid #3a2e1e", borderRadius: 4, padding: "10px", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        );
      })()}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowForm(false)}>
          <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#1e1812", borderRadius: "12px 12px 0 0", padding: "24px 20px", border: "1px solid #3a2e1e" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#f0e8d8" }}>Log a Drink</div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, background: "#2a2018", border: "1px solid #4a3a2a", borderRadius: 4, padding: "7px 12px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, color: scanning ? "#6a5a3a" : "#c0b090", letterSpacing: 0.5 }}>
                {scanning ? "Scanning..." : "📷 Scan Label"}
                <input type="file" accept="image/*" capture="environment" onChange={e => e.target.files[0] && scanLabel(e.target.files[0])} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["Who", "Jess or Pierre", ["Pierre", "Jess"]], ["Type", "Whatru Drinking", ["Beer", "Wine", "Cider"]]].map(([label, field, opts]) => (
                <div key={field}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                  <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width: "100%", background: "#2a2018", border: "1px solid #3a2e1e", borderRadius: 4, padding: "8px 10px", color: "#f0e8d8", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {[
              ["Drink Name", "Drink", "e.g. Gee Whiz", [...new Set(allEntries.map(e => e.Drink).filter(Boolean))].sort()],
              ["Brewery / Winery", "Winery/Brewery", "e.g. Sonnen Hill Brewing", [...new Set(allEntries.map(e => e["Winery/Brewery"]).filter(Boolean))].sort()],
              ["Style", "style", "e.g. Saison", [...new Set(allEntries.map(e => e.style).filter(Boolean))].sort()],
              ["Where", "Where", "e.g. Volo, LCBO, Bottle Shop", [...new Set(allEntries.map(e => e.Where).filter(Boolean))].sort()],
            ].map(([label, field, ph, suggestions]) => {
              const val = form[field] || "";
              const matches = val.length > 0
                ? suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()) && s.toLowerCase() !== val.toLowerCase()).slice(0, 5)
                : [];
              return (
                <div key={field} style={{ marginBottom: 10, position: "relative" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                  <input
                    value={val}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    autoComplete="off"
                    style={{ width: "100%", background: "#2a2018", border: "1px solid #3a2e1e", borderRadius: 4, padding: "8px 10px", color: "#f0e8d8", fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                  />
                  {matches.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#2a2018", border: "1px solid #4a3a2a", borderTop: "none", borderRadius: "0 0 4px 4px", zIndex: 200, maxHeight: 180, overflowY: "auto" }}>
                      {matches.map(s => (
                        <div key={s} onMouseDown={() => setForm(f => ({ ...f, [field]: s }))} style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#c0b090", cursor: "pointer", borderBottom: "1px solid #3a2e1e" }}
                          onMouseEnter={e => e.target.style.background = "#3a2e1e"}
                          onMouseLeave={e => e.target.style.background = "transparent"}
                        >{s}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginBottom: 8 }}>Rating</div>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.entries(RATING_CONFIG).map(([r, cfg]) => (
                  <button key={r} onClick={() => setForm(f => ({ ...f, "Like it or Love it?": r }))} style={{
                    flex: 1, padding: "8px 4px", borderRadius: 4,
                    border: `1px solid ${form["Like it or Love it?"] === r ? cfg.color : "#3a2e1e"}`,
                    background: form["Like it or Love it?"] === r ? cfg.color + "22" : "#2a2018",
                    color: form["Like it or Love it?"] === r ? cfg.color : "#6a5a3a",
                    fontSize: 10, fontFamily: "'DM Mono', monospace", cursor: "pointer", letterSpacing: 0.3
                  }}>{cfg.emoji}<br />{r}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginBottom: 12 }}>Taste Profile <span style={{ color: "#3a2e1e" }}>— optional</span></div>
              {[
                ["Body", "taste_body", "Light", "Bold", bodyLabels],
                ["Character", "taste_char", "Crisp", "Funky", charLabels],
                ["Sweetness", "taste_sweet", "Dry", "Sweet", sweetLabels],
                ["Bitterness", "taste_bitter", "Low", "Hoppy", bitterLabels],
              ].map(([label, key, lo, hi, labels]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a" }}>{label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#e8785a" }}>{getLabel(labels, form[key])}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3a2e1e", width: 28 }}>{lo}</span>
                    <input type="range" min="0" max="100" value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) }))}
                      style={{ flex: 1, accentColor: "#e8785a" }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3a2e1e", width: 28, textAlign: "right" }}>{hi}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleAdd} disabled={saving} style={{ width: "100%", background: saving ? "#6a5a3a" : "#e8785a", color: "#1a1410", border: "none", borderRadius: 4, padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
