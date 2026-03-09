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
            {[["journal", "Journal"], ["stats", "Stats"]].map(([v, l]) => (
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
                      <div className="entry-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2a2018", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                          {TYPE_EMOJI[type] || "🥂"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#f0e8d8", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{name}</span>
                            {e.style && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a" }}>{e.style}</span>}
                          </div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6a5a3a", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {brewery && <span>{brewery}</span>}
                            {where && <><span style={{ color: "#3a2e1e" }}>·</span><span>{where}</span></>}
                            <span style={{ color: "#3a2e1e" }}>·</span>
                            <span style={{ color: "#4a3a2a" }}>{who}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: rc.color + "22", border: `1px solid ${rc.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: rc.color, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                            {rc.emoji}
                          </div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4a3a2a" }}>
                            {date.split("/").slice(0, 2).join("/")}
                          </div>
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
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowForm(false)}>
          <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#1e1812", borderRadius: "12px 12px 0 0", padding: "24px 20px", border: "1px solid #3a2e1e" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#f0e8d8" }}>Log a Drink</div>
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
            {[["Drink Name", "Drink", "e.g. Gee Whiz"], ["Brewery / Winery", "Winery/Brewery", "e.g. Sonnen Hill Brewing"], ["Style", "style", "e.g. Saison"], ["Where", "Where", "e.g. Volo, LCBO, Bottle Shop"]].map(([label, field, ph]) => (
              <div key={field} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a5a3a", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "#2a2018", border: "1px solid #3a2e1e", borderRadius: 4, padding: "8px 10px", color: "#f0e8d8", fontFamily: "'DM Mono', monospace", fontSize: 12 }} />
              </div>
            ))}
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
            <button onClick={handleAdd} disabled={saving} style={{ width: "100%", background: saving ? "#6a5a3a" : "#e8785a", color: "#1a1410", border: "none", borderRadius: 4, padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
