import { useState, useMemo } from "react";

const RAW_DATA = [
  ["7/25/2020","Pierre","Beer","Tooth and Nail","Lucidity Summer Pale Ale","Pale Ale","","Love"],
  ["7/25/2020","Pierre","Beer","Sonnen Hill Brewing","Cool and Slow","Pilsner","Fourth and Seven","Love"],
  ["8/2/2020","Pierre","Beer","Bernard Fouquet","Cuvée de silex","Chenin Blanc","Bottle Shop","Love"],
  ["8/5/2020","Pierre","Beer","Sonnen Hill Brewing","Extra Hell","Pale Ale","Volo","Love"],
  ["8/7/2020","Pierre","Beer","Godspeed","Yuzu","Saison","Bottle Shop","Like"],
  ["8/8/2020","Pierre","Beer","Sonnen Hill Brewing","There and Back","Saison","Bottle Shop","Love"],
  ["8/16/2020","Pierre","Beer","Sonnen Hill Brewing","Nothing New","Saison","Bottle Shop","Love"],
  ["8/24/2020","Pierre","Beer","Town Brewery","Witzig","Hefeweizen","Fourth and Seven","Like"],
  ["8/29/2020","Pierre","Beer","Little Beasts Brewing Co.","La Saison du printemps","Saison","Fourth and Seven","Like"],
  ["8/31/2020","Pierre","Beer","Great Lakes Brewery","Burst","Pale Ale","LCBO","Love"],
  ["9/2/2020","Pierre","Beer","Oxbow","Loretta","Grisette","Volo","Love"],
  ["9/2/2020","Pierre","Beer","Burdock","Bloor Light","Lager","Grocery Store","Like"],
  ["9/3/2020","Pierre","Wine","Good Vines","Good Vines","Spritzer","LCBO","Like"],
  ["9/6/2020","Pierre","Beer","Woodhouse Brewing Co.","Wheat Pale Ale","Pale Ale","Brewery","Like"],
  ["9/7/2020","Jess","Wine","Good Vines","Good Vines","Spritzer","LCBO","Like"],
  ["9/7/2020","Jess","Wine","Therianthropy","Bonnie Vivant Chardonnay 2019","Chardonnay","Online","Love"],
  ["9/11/2020","Pierre","Beer","Sonnen Hill Brewing","Gee Whiz","Classic Beer","Bottle Shop","Love"],
  ["9/13/2020","Pierre","Beer","Matron","Wallflower","Saison","Fourth and Seven","Like"],
  ["9/13/2020","Jess","Wine","Therianthropy","Bonnie Vivant Chardonnay 2019","Chardonnay","Online","Love"],
  ["9/15/2020","Pierre","Beer","Folly Brewing","Moon Sugar","Saison","Brewery","Like"],
  ["9/15/2020","Pierre","Wine","Hidden Bench","2016 Roman's Block","Riesling","Winery","Love"],
  ["9/21/2020","Pierre","Beer","Burdock Brewery","Zesté","Sour","Brewery","Like"],
  ["9/24/2020","Pierre","Beer","Great Lakes Brewery","Karma Citra","IPA","Bottle Shop","Like"],
  ["9/24/2020","Pierre","Beer","Coors","Banquet","Lager","Bottle Shop","Like"],
  ["9/27/2020","Pierre","Beer","Gillingham Brewing Company","Brut IPA","IPA","Brewery","Love"],
  ["9/27/2020","Pierre","Wine","Domaine Darius","Cuvee 2018","Cuvee","Winery","Love"],
  ["9/28/2020","Pierre","Beer","Matron","Leisure Landbier","Lager","Brewery","Love"],
  ["10/4/2020","Pierre","Wine","Norman Hardie","Gewurztraminer","Gewurztraminer","Winery","Love"],
  ["10/8/2020","Pierre","Beer","True History Brewing","Ah...to be young","Lager","Volo","Love"],
  ["10/9/2020","Pierre","Beer","True History Brewing","Mild Lockout","Saison","Volo","Love"],
  ["10/12/2020","Jess","Wine","Calvert","Pinot Blanc","Pinot Blanc","LCBO","Love"],
  ["10/12/2020","Pierre","Beer","Indie Alehouse Brewing Co.","Golden Boy","Golden Ale","Volo","Like"],
  ["10/12/2020","Pierre","Beer","Beau's","Juiced Up","Pale Ale","LCBO","Love"],
  ["10/14/2020","Pierre","Cider","Kupela","BIZIA","Semi-dry craft cider","LCBO","Love"],
  ["10/16/2020","Jess","Wine","Calvert","Pinot Blanc","Pinot Blanc","LCBO","Love"],
  ["10/22/2020","Pierre","Beer","Slake Brewing","Super Sunset","Pale Ale","Volo","Love"],
  ["10/22/2020","Pierre","Wine","Dominio de Punctum","Lagasca","Viognier","Brewery","Like"],
  ["10/23/2020","Pierre","Beer","Burdock","Pilsner","Pilsner","Brewery","Never Again"],
  ["10/23/2020","Pierre","Beer","Slake Brewing","Tasty","Farmhouse Ale","Volo","Meh"],
  ["10/24/2020","Pierre","Beer","Matron","Handsome Zoiglbier","Lager","Volo","Love"],
  ["10/27/2020","Pierre","Beer","Asking Brewery","Kinsman Bohemian Lager","Lager","Bottle Shop","Meh"],
  ["10/27/2020","Pierre","Beer","Avling Brewery","Fallow Year Ontario Lager","Lager","Bottle Shop","Meh"],
  ["10/28/2020","Pierre","Beer","Folly Brewing","Side Quest","Grisette","Bottle Shop","Love"],
  ["10/31/2020","Jess","Cider","Growers","Honeycrisp Apple","Cider","Grocery Store","Like"],
  ["11/1/2020","Pierre","Beer","Shacklands Brewing Co.","Saison Davenport","Saison","LCBO","Like"],
  ["11/1/2020","Pierre","Beer","Indie Alehouse Brewing Co.","Good Clean Fun","Lager","Bottle Shop","Like"],
  ["11/1/2020","Pierre","Beer","Indie Alehouse Brewing Co.","Happy Little Trees","IPA","Bottle Shop","Meh"],
  ["11/6/2020","Pierre","Beer","Woodhouse Brewing Co.","Lager","Lager","LCBO","Meh"],
  ["11/6/2020","Pierre","Wine","Waterkloof","Circle of Life","Chenin Blanc","LCBO","Meh"],
  ["11/6/2020","Pierre","Wine","Bons Ventos","Vinho Regional Lisboa","Red","LCBO","Like"],
  ["11/7/2020","Jess","Wine","Koerner","Watervale 19","Riesling","Bottle Shop","Love"],
  ["11/8/2020","Pierre","Beer","Tooth and Nail","VIJFDE 2020 Anniversary Ale","Pale Ale","Volo","Like"],
  ["11/8/2020","Pierre","Wine","Koerner","2020 WATERVALE RIESLING","Riesling","Bottle Shop","Love"],
  ["11/12/2020","Jess","Wine","Exultet","Pinot Gris Skin Fermented White","Pinot Gris Orange","Winery","Love"],
  ["11/22/2020","Pierre","Beer","Burdock","Pale Classic","Pale Ale","Bottle Shop","Meh"],
  ["11/22/2020","Pierre","Beer","GoodLot Brewing Co.","High Fives","Pale Ale","Bottle Shop","Like"],
  ["11/22/2020","Pierre","Beer","True History Brewing","Canary Rose","Grisette","Fourth and Seven","Like"],
  ["11/22/2020","Pierre","Wine","Koerner","Rolle 2018","","Bottle Shop","Love"],
  ["11/22/2020","Pierre","Wine","Malivoire","Gamay","Gamay","LCBO","Like"],
  ["11/24/2020","Pierre","Beer","Slake Brewing","Hatch","Pale Ale","Fourth and Seven","Love"],
  ["11/30/2020","Jess","Cider","Shiny","Apple Cider","Cider","Grocery Store","Like"],
  ["11/30/2020","Pierre","Beer","Folly Brewing","Plurality","Saison","Bottle Shop","Like"],
  ["11/30/2020","Pierre","Beer","Burdock Brewery","Beer Mosto Black Bread Stout","Stout","Bottle Shop","Like"],
  ["12/3/2020","Pierre","Beer","Sonnen Hill Brewing","Zigler","Pilsner","Bottle Shop","Like"],
  ["12/3/2020","Pierre","Beer","Slake Brewing","Mosey","Pilsner","Bottle Shop","Love"],
  ["12/5/2020","Pierre","Beer","Indie Alehouse Brewing Co.","Lil' lush","IPA","Brewery","Like"],
  ["12/12/2020","Pierre","Beer","Sons of Kent Brewing Company","Juice Box","IPA","LCBO","Like"],
  ["12/13/2020","Pierre","Beer","Stillwell Brewing Co.","DRY","Saison","Volo","Love"],
  ["12/14/2020","Pierre","Beer","Stillwell Brewing Co.","Stilly Spils","Lager","Volo","Love"],
  ["12/15/2020","Pierre","Beer","Short Finger Brewing Co.","Wash","Farmhouse Ale","Volo","Love"],
  ["12/19/2020","Pierre","Beer","Sonnen Hill Brewing","Nothing New","Piquette","Volo","Never Again"],
  ["12/19/2020","Pierre","Beer","William Bros. Brewing Co.","Heather Ale","Heather Ale","LCBO","Like"],
  ["12/20/2020","Pierre","Beer","Burdock Brewery","Hoppy Lager","Lager","Bottle Shop","Like"],
  ["12/20/2020","Pierre","Beer","Stillwell Brewing Co.","Kompakt Kolsch","Lager","Volo","Like"],
  ["12/23/2020","Pierre","Beer","Commongood Beer Company","Citra","Pale Ale","Bottle Shop","Like"],
  ["12/23/2020","Pierre","Beer","Muddy York Brewing Co.","Jail Fire Rauchbier","Lager","Bottle Shop","Like"],
  ["12/23/2020","Pierre","Wine","Cono Sur","Bicicleta Reserva","Pinot Noir","LCBO","Meh"],
  ["12/23/2020","Pierre","Wine","Yalumba","The Y Series","Viognier","LCBO","Meh"],
  ["12/23/2020","Pierre","Beer","Matron Brewing Inc.","Forthright - Fresh Hop Farmbier","","Fourth and Seven","Meh"],
  ["1/3/2021","Jess","Cider","Steel Town","Peach and apricot barrique","Cider","Fourth and Seven","Love"],
  ["1/3/2021","Jess","Cider","Ace Hill","Raspberry","Spritzer","LCBO","Like"],
  ["1/10/2021","Pierre","Beer","Sonnen Hill Brewing","It Goes Down Easy","Lager","Bottle Shop","Love"],
  ["1/23/2021","Pierre","Beer","Burdock Brewery","Fizz","Lager","Bottle Shop","Like"],
  ["2/6/2021","Pierre","Beer","Sonnen Hill Brewing","Gee Whiz","Classic Beer","Bottle Shop","Love"],
  ["2/14/2021","Pierre","Beer","Collective Arts","Stranger Than Fiction","Porter","LCBO","Like"],
  ["3/7/2021","Pierre","Beer","Matron","Leisure Landbier","Lager","Bottle Shop","Love"],
  ["3/20/2021","Pierre","Wine","Malivoire","Pinot Gris","Pinot Gris","LCBO","Like"],
  ["4/3/2021","Pierre","Beer","Burdock Brewery","Cool Lager","Lager","Bottle Shop","Like"],
  ["4/17/2021","Pierre","Beer","Slake Brewing","Super Sunset","Pale Ale","Bottle Shop","Love"],
  ["5/1/2021","Pierre","Beer","True History Brewing","Mild Lockout","Saison","Volo","Love"],
  ["5/15/2021","Pierre","Beer","Folly Brewing","Moon Sugar","Saison","Bottle Shop","Like"],
  ["6/12/2021","Pierre","Beer","Sonnen Hill Brewing","Cuvee","Saison","Bottle Shop","Love"],
  ["7/4/2021","Pierre","Beer","Godspeed","Yuzu","Saison","Bottle Shop","Like"],
  ["8/8/2021","Pierre","Beer","Bellwoods Brewery","Jane Doe","Wild Ale","Brewery","Love"],
  ["9/5/2021","Pierre","Beer","Left Field Brewery","Wrigleyville","Grisette","Volo","Love"],
  ["10/9/2021","Pierre","Beer","Burdock Brewery","Zesté","Sour","Brewery","Like"],
  ["11/6/2021","Pierre","Wine","Norman Hardie","Chardonnay","Chardonnay","Winery","Love"],
  ["12/4/2021","Pierre","Beer","Slake Brewing","Easy Lager","Lager","Paradise Grapevine","Love"],
  ["1/8/2022","Pierre","Beer","Avling Brewery","Vibrant Harvest","Saison","Brewery","Like"],
  ["2/12/2022","Pierre","Beer","Fairweather Brewing Co.","Like a Virgin","Pilsner","Paradise Grapevine","Like"],
  ["3/19/2022","Pierre","Beer","Slake Brewing","Neat","Pale Ale","Paradise Grapevine","Like"],
  ["4/23/2022","Pierre","Beer","Slake Brewing / Sonnen Hill","Chums","Pale Ale","Paradise Grapevine","Love"],
  ["4/23/2022","Pierre","Beer","Collective Arts","IPA No. 20 - Citra Four Ways","IPA","LCBO","Like"],
  ["4/28/2022","Pierre","Beer","Matron Brewing Inc.","Allora","Pale Ale","Volo","Love"],
  ["4/29/2022","Pierre","Beer","Sonnen Hill Brewing","Cuvee Spiff Spiff","Saison","Volo","Love"],
  ["4/30/2022","Pierre","Beer","Volo","Pippa","Pale Ale","Volo","Love"],
  ["5/7/2022","Pierre","Beer","Beyond the Pale Brewing Company","Tropical Paradise","Saison","Trinity Commons","Like"],
  ["5/22/2022","Pierre","Wine","Andi Weigand","White cuvee","Cuvee","Volo","Like"],
  ["5/27/2022","Pierre","Beer","Muskoka Brewery","Hibernating Grizzly","Farmhouse Ale","LCBO","Like"],
  ["5/28/2022","Pierre","Beer","Indie Alehouse Brewing Co.","Marco Polo","Pilsner","Indie Ale House","Like"],
  ["5/28/2022","Pierre","Beer","Indie Alehouse Brewing Co.","Pepin The Short","Table Beer","Indie Ale House","Love"],
  ["5/29/2022","Pierre","Beer","Left Field Brewery","Wrigleyville","Grisette","Volo","Love"],
  ["6/4/2022","Pierre","Beer","Les Grands Bois","Super Pause","IPA","Perles & Paddock","Love"],
  ["6/9/2022","Pierre","Beer","Bellwoods Brewery","Come What May","Saison","Paradise Grapevine","Love"],
  ["6/13/2022","Pierre","Wine","Le Sot De L'Ange","Chenin","Chenin Blanc","Paradise Grapevine","Love"],
  ["6/19/2022","Pierre","Beer","Collective Arts","Life in the Clouds","IPA","Grocery Store","Meh"],
  ["6/19/2022","Pierre","Beer","Spearhead Brewing Company","Hawaiian Style Pale Ale","Pale Ale","Grocery Store","Never Again"],
  ["6/21/2022","Pierre","Wine","Il Farneto","Frisant Rosso","Lambrusco","Volo","Like"],
  ["7/3/2022","Pierre","Beer","Other Half Brewing Co.","Poetry Snaps","Lager","Brewery","Like"],
  ["7/5/2022","Pierre","Beer","Three's Brewing","Eternal Return Nectarine","Saison","Bottle Shop","Like"],
  ["7/5/2022","Pierre","Beer","Schilling Brewing Co.","Nordertor","Pilsner","Bottle Shop","Like"],
  ["7/6/2022","Pierre","Beer","Back Home Beer","Persian Blue","Lager","Bottle Shop","Love"],
  ["7/15/2022","Pierre","Beer","Grain & Grit LTD.","Invisible Friend","Pale Ale","Brewery","Like"],
  ["8/7/2022","Pierre","Beer","Godspeed Brewery","Hagoromo","Lager","Volo","Love"],
  ["8/7/2022","Pierre","Beer","Short Finger Brewing Co.","True Believer","Pale Ale","Volo","Love"],
  ["9/9/2022","Pierre","Beer","Sonnen Hill Brewing","kellerhell","Lager","Paradise Grapevine","Love"],
  ["9/17/2022","Pierre","Beer","Grain & Grit LTD.","Better Together","Pale Ale","Volo","Like"],
  ["9/17/2022","Pierre","Beer","Left Field Brewery Inc.","#hugwatch","Pale Ale","Volo","Meh"],
  ["10/22/2022","Pierre","Beer","Bellwoods Brewery","Hot Wings","Pale Ale","Paradise Grapevine","Like"],
  ["11/7/2022","Pierre","Beer","Avling Brewery","Vibrant Harvest","Saison","Brewery","Like"],
  ["11/8/2022","Pierre","Beer","Avling Brewery","Meerkat","Grisette","Brewery","Love"],
  ["11/24/2022","Pierre","Beer","Slake Brewing","Yellow Flowers","Table Beer","Paradise Grapevine","Meh"],
  ["11/30/2022","Pierre","Beer","Slake Brewing","Easy Lager","Lager","Paradise Grapevine","Love"],
  ["12/1/2022","Pierre","Beer","Sonnen Hill Brewing","Primo","Pilsner","Paradise Grapevine","Love"],
  ["12/8/2022","Pierre","Wine","Claus Presinger","Dope","Rosé","Paradise Grapevine","Love"],
  ["12/30/2022","Jess","Wine","Cantiene Giardino","Vino rosato","Rosé","Volo","Love"],
  ["1/14/2023","Pierre","Beer","Fairweather Brewing Co.","Like a Virgin","Pilsner","Paradise Grapevine","Like"],
  ["1/14/2023","Pierre","Beer","Fairweather Brewing Co.","Menagerie","Pale Ale","Paradise Grapevine","Meh"],
  ["1/28/2023","Pierre","Beer","Bellwoods Brewery / Sonnen Hill","Sonny B","Lager","Bottle Shop","Love"],
  ["2/17/2023","Pierre","Beer","Sonnen Hill Brewing","Not Another Spiffy","Saison","Brewery","Love"],
  ["3/17/2023","Jess","Wine","Tessari","Grisela","Soave","Nicholas Pearce","Love"],
  ["3/22/2023","Pierre","Beer","Slake Brewing","Neat","Pale Ale","Paradise Grapevine","Like"],
  ["4/16/2023","Pierre","Beer","Burdock Brewery","Château","Lager","Brewery","Like"],
  ["4/29/2023","Pierre","Beer","Oxbow","Catalyst","Farmhouse Ale","Volo","Never Again"],
  ["4/29/2023","Pierre","Beer","Willibald Farm Brewery","Farmhaus","Saison","Volo","Love"],
  ["4/30/2023","Pierre","Beer","Fairweather / Badlands Brewing","No Country","Lager","Volo","Love"],
  ["5/14/2023","Pierre","Wine","Ori Marani","Nita","Beaujolais","Paradise Grapevine","Love"],
  ["6/4/2023","Pierre","Beer","Slake Brewing","Wendy","Saison","Paradise Grapevine","Like"],
  ["6/4/2023","Pierre","Beer","Burdock Brewery","Bloor Lime","Lager","Brewery","Like"],
  ["6/28/2023","Pierre","Beer","Fairweather Brewing Co.","Infinite Growth","Lager","Paradise Grapevine","Love"],
  ["7/2/2023","Pierre","Beer","Tooth and Nail Brewing Inc.","Gusto","Lager","Volo","Love"],
  ["7/19/2023","Pierre","Beer","Sonnen Hill Brewing","Summer Ale","","Paradise Grapevine","Like"],
  ["8/2/2023","Pierre","Beer","Sonnen Hill Brewing","Gold","Lager","Bottle Shop","Like"],
  ["9/9/2023","Pierre","Wine","Lugana","Oasis Mantellina","Cuvee (white)","LCBO","Love"],
  ["11/11/2023","Pierre","Beer","Far Yeast Brewing","Tokyo Blonde","Lager","","Love"],
  ["3/16/2024","Pierre","Beer","Willibald Farm Brewery","Clink","Lager","Volo","Like"],
  ["4/23/2024","Pierre","Beer","Indie Alehouse Brewing Co.","Lupo","IPA","Bottle Shop","Love"],
  ["5/2/2024","Pierre","Wine","Barbacan","Rosso","","Bottle Shop","Love"],
  ["6/20/2024","Jess","Wine","Tantaka","Juanjo Tellaetxe","Txakolina","Paradise Grapevine","Love"],
  ["7/1/2024","Pierre","Wine","Therianthropy","Ruby Pet Nar","Pet Nat","LCBO","Love"],
  ["8/15/2024","Pierre","Wine","Coronica","Malvatiza","","Paradise Grapevine","Love"],
  ["8/28/2024","Pierre","Wine","Cota","Pero J'dero","Red","Paradise Grapevine","Like"],
  ["10/9/2024","Pierre","Beer","Third Moon Brewing Co","Kills","Pilsner","Volo","Like"],
  ["10/9/2024","Pierre","Beer","Willibald Farm Brewery","Bully","IPA","Volo","Meh"],
  ["10/9/2024","Pierre","Beer","Slake / Burdock","Lake Burd","Lager","Volo","Like"],
  ["10/9/2024","Pierre","Beer","Willibald Farm Brewery","Hell","Lager","Volo","Like"],
  ["12/7/2024","Pierre","Wine","Anselmo Mendes","Muris Antigos Escolha","Vinho Verde","Cafe Belem","Like"],
  ["12/6/2024","Pierre","Beer","Tooth and Nail Brewing Inc.","Exile","Pale Ale","Volo","Like"],
  ["1/5/2025","Jess","Wine","Deutscher Qualitätswein","2022 Riesling Dr Bürklin Wolf","Riesling","The Living Vine","Love"],
  ["1/12/2025","Pierre","Wine","Chateau Laubarit","","Bordeaux","","Like"],
  ["1/12/2025","Pierre","Beer","Bench Brewing Co.","Short Hills","IPA","Brewery","Like"],
  ["1/12/2025","Pierre","Wine","","Alicante Nero 2021","Red","","Love"],
  ["2/11/2025","Pierre","Beer","True History Brewing","1154 Alsatian Pilsner","Pilsner","Volo","Like"],
  ["3/10/2025","Pierre","Beer","Godspeed Brewery","kolaborativini lezak franz","Lager","Volo","Love"],
  ["3/12/2025","Pierre","Beer","Sonnen Hill Brewing","RGLR BEER","Lager","Volo","Love"],
  ["3/13/2025","Pierre","Beer","Burdock Brewery","Sauna Lager","Pilsner","Bottle Shop","Meh"],
  ["4/9/2025","Pierre","Beer","Willibald Farm Brewery","Yonder","Farmhouse Ale","Volo","Love"],
  ["4/13/2025","Pierre","Beer","GoodLot Brewing Co.","Nitwit","Witbier","Bottle Shop","Like"],
  ["4/23/2025","Pierre","Wine","Weight Mann","2022 Muller-Thurgau","White wine","Volo","Love"],
];

const entries = RAW_DATA.map((r, i) => ({
  id: i,
  date: r[0],
  who: r[1],
  type: r[2],
  brewery: r[3],
  name: r[4],
  style: r[5],
  where: r[6],
  rating: r[7],
}));

const RATING_CONFIG = {
  "Love":       { emoji: "♥", color: "#e8785a", rank: 4 },
  "Like":       { emoji: "✓", color: "#a3c27a", rank: 3 },
  "Meh":        { emoji: "~", color: "#c4a84f", rank: 2 },
  "Never Again":{ emoji: "✕", color: "#8a8a8a", rank: 1 },
};

const TYPE_EMOJI = { Beer: "🍺", Wine: "🍷", Cider: "🍎" };

export default function App() {
  const [view, setView] = useState("journal"); // journal | stats | add
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [filterWho, setFilterWho] = useState("All");
  const [allEntries, setAllEntries] = useState(entries);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ who: "Pierre", type: "Beer", brewery: "", name: "", style: "", where: "", rating: "Love" });

  const filtered = useMemo(() => {
    return allEntries
      .filter(e => filterType === "All" || e.type === filterType)
      .filter(e => filterRating === "All" || e.rating === filterRating)
      .filter(e => filterWho === "All" || e.who === filterWho)
      .filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.brewery.toLowerCase().includes(q) || e.style.toLowerCase().includes(q) || e.where.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allEntries, filterType, filterRating, filterWho, search]);

  const stats = useMemo(() => {
    const total = allEntries.length;
    const loves = allEntries.filter(e => e.rating === "Love").length;
    const neverAgain = allEntries.filter(e => e.rating === "Never Again").length;
    const typeCounts = {};
    const breweryCounts = {};
    const whereCounts = {};
    allEntries.forEach(e => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
      if (e.brewery) breweryCounts[e.brewery] = (breweryCounts[e.brewery] || 0) + 1;
      if (e.where) whereCounts[e.where] = (whereCounts[e.where] || 0) + 1;
    });
    const topBreweries = Object.entries(breweryCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topPlaces = Object.entries(whereCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return { total, loves, neverAgain, typeCounts, topBreweries, topPlaces };
  }, [allEntries]);

  const handleAdd = () => {
    const today = new Date().toLocaleDateString("en-US", {month:"numeric",day:"numeric",year:"numeric"});
    setAllEntries(prev => [{ id: Date.now(), date: today, ...form }, ...prev]);
    setForm({ who: "Pierre", type: "Beer", brewery: "", name: "", style: "", where: "", rating: "Love" });
    setShowForm(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#1a1410", color:"#f0e8d8", fontFamily:"'Georgia', serif" }}>
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

      {/* Header */}
      <div style={{ borderBottom:"1px solid #3a2e1e", padding:"20px 20px 0", background:"#16110d" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:11, letterSpacing:4, color:"#8a6a3a", textTransform:"uppercase", marginBottom:4 }}>A Record Of</div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:32, fontWeight:700, lineHeight:1, color:"#f0e8d8" }}>What We Drank</h1>
            </div>
            <button onClick={() => setShowForm(true)} className="add-btn" style={{ background:"#e8785a", color:"#1a1410", border:"none", borderRadius:4, padding:"8px 16px", fontFamily:"'DM Mono', monospace", fontSize:12, fontWeight:500, letterSpacing:1, cursor:"pointer" }}>
              + Log Drink
            </button>
          </div>
          <div style={{ display:"flex", gap:0 }}>
            {[["journal","Journal"],["stats","Stats"]].map(([v,l]) => (
              <button key={v} className="nav-btn" onClick={() => setView(v)} style={{
                background:"none", color: view===v ? "#f0e8d8" : "#6a5a3a",
                padding:"8px 20px", fontSize:13, letterSpacing:1, fontFamily:"'DM Mono', monospace",
                borderBottom: view===v ? "2px solid #e8785a" : "2px solid transparent",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"0 20px 80px" }}>

        {view === "journal" && (
          <>
            {/* Search + Filters */}
            <div style={{ padding:"16px 0 12px" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, brewery, style, place..."
                style={{ width:"100%", background:"#231c12", border:"1px solid #3a2e1e", borderRadius:4, padding:"10px 14px", color:"#f0e8d8", fontFamily:"'DM Mono', monospace", fontSize:12, marginBottom:10 }}
              />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {["All","Beer","Wine","Cider"].map(t => (
                  <span key={t} className="filter-pill" onClick={() => setFilterType(t)} style={{
                    padding:"4px 12px", borderRadius:20, fontSize:11, fontFamily:"'DM Mono', monospace", letterSpacing:0.5,
                    background: filterType===t ? "#e8785a" : "#2a2018", color: filterType===t ? "#1a1410" : "#8a7a5a",
                    border: filterType===t ? "none" : "1px solid #3a2e1e"
                  }}>{t}</span>
                ))}
                <span style={{ width:1, height:20, background:"#3a2e1e", margin:"4px 4px 0" }}/>
                {["All","Love","Like","Meh","Never Again"].map(r => (
                  <span key={r} className="filter-pill" onClick={() => setFilterRating(r)} style={{
                    padding:"4px 12px", borderRadius:20, fontSize:11, fontFamily:"'DM Mono', monospace", letterSpacing:0.5,
                    background: filterRating===r ? (RATING_CONFIG[r]?.color || "#e8785a") : "#2a2018",
                    color: filterRating===r ? "#1a1410" : "#8a7a5a",
                    border: filterRating===r ? "none" : "1px solid #3a2e1e"
                  }}>{r}</span>
                ))}
                <span style={{ width:1, height:20, background:"#3a2e1e", margin:"4px 4px 0" }}/>
                {["All","Pierre","Jess"].map(w => (
                  <span key={w} className="filter-pill" onClick={() => setFilterWho(w)} style={{
                    padding:"4px 12px", borderRadius:20, fontSize:11, fontFamily:"'DM Mono', monospace", letterSpacing:0.5,
                    background: filterWho===w ? "#a3c27a" : "#2a2018", color: filterWho===w ? "#1a1410" : "#8a7a5a",
                    border: filterWho===w ? "none" : "1px solid #3a2e1e"
                  }}>{w}</span>
                ))}
              </div>
              <div style={{ marginTop:10, fontFamily:"'DM Mono', monospace", fontSize:11, color:"#5a4a2a", letterSpacing:0.5 }}>
                {filtered.length} of {allEntries.length} entries
              </div>
            </div>

            {/* Entries */}
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {filtered.map((e, i) => {
                const rc = RATING_CONFIG[e.rating] || RATING_CONFIG["Like"];
                const prevDate = filtered[i-1]?.date;
                const currYear = e.date.split("/")[2];
                const prevYear = prevDate?.split("/")[2];
                const showYear = currYear !== prevYear;
                return (
                  <div key={e.id}>
                    {showYear && (
                      <div style={{ padding:"16px 0 6px", fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:13, color:"#5a4a2a", borderTop: i>0 ? "1px solid #2a2018" : "none", marginTop: i>0 ? 8 : 0 }}>
                        {currYear}
                      </div>
                    )}
                    <div className="entry-card" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 8px", borderRadius:4, background:"transparent" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"#2a2018", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                        {TYPE_EMOJI[e.type] || "🥂"}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, color:"#f0e8d8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:240 }}>{e.name || e.brewery}</span>
                          {e.style && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#6a5a3a", letterSpacing:0.5, whiteSpace:"nowrap" }}>{e.style}</span>}
                        </div>
                        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#6a5a3a", marginTop:2, display:"flex", gap:8, flexWrap:"wrap" }}>
                          {e.brewery && <span>{e.brewery}</span>}
                          {e.where && <><span style={{ color:"#3a2e1e" }}>·</span><span>{e.where}</span></>}
                          <span style={{ color:"#3a2e1e" }}>·</span>
                          <span style={{ color:"#4a3a2a" }}>{e.who}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2, flexShrink:0 }}>
                        <div style={{ width:24, height:24, borderRadius:"50%", background:rc.color+"22", border:`1px solid ${rc.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:rc.color, fontFamily:"'DM Mono', monospace", fontWeight:500 }}>
                          {rc.emoji}
                        </div>
                        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, color:"#4a3a2a", letterSpacing:0.3 }}>
                          {e.date.split("/").slice(0,2).join("/")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === "stats" && (
          <div style={{ paddingTop:24 }}>
            {/* Summary numbers */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:24 }}>
              {[
                ["Total Logged", stats.total, "#f0e8d8"],
                ["Loved", stats.loves, "#e8785a"],
                ["Never Again", stats.neverAgain, "#6a6a6a"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ background:"#231c12", borderRadius:4, padding:"16px 12px", textAlign:"center", border:"1px solid #3a2e1e" }}>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:700, color, lineHeight:1 }}>{val}</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#6a5a3a", letterSpacing:0.5, marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* By type */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:13, color:"#8a7a5a", marginBottom:10 }}>By Type</div>
              {Object.entries(stats.typeCounts).sort((a,b)=>b[1]-a[1]).map(([type, count]) => (
                <div key={type} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:60, fontFamily:"'DM Mono', monospace", fontSize:11, color:"#8a7a5a" }}>{TYPE_EMOJI[type]} {type}</div>
                  <div style={{ flex:1, height:4, background:"#2a2018", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:"#e8785a", borderRadius:2, width:`${(count/stats.total*100).toFixed(0)}%`, transition:"width 0.5s" }}/>
                  </div>
                  <div style={{ width:36, fontFamily:"'DM Mono', monospace", fontSize:11, color:"#6a5a3a", textAlign:"right" }}>{count}</div>
                </div>
              ))}
            </div>

            {/* By rating */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:13, color:"#8a7a5a", marginBottom:10 }}>By Rating</div>
              {Object.entries(RATING_CONFIG).sort((a,b)=>b[1].rank-a[1].rank).map(([rating, cfg]) => {
                const count = allEntries.filter(e => e.rating === rating).length;
                return (
                  <div key={rating} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div style={{ width:80, fontFamily:"'DM Mono', monospace", fontSize:11, color:cfg.color }}>{cfg.emoji} {rating}</div>
                    <div style={{ flex:1, height:4, background:"#2a2018", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:cfg.color, borderRadius:2, width:`${(count/stats.total*100).toFixed(0)}%` }}/>
                    </div>
                    <div style={{ width:36, fontFamily:"'DM Mono', monospace", fontSize:11, color:"#6a5a3a", textAlign:"right" }}>{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Top spots */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:13, color:"#8a7a5a", marginBottom:10 }}>Top Breweries</div>
                {stats.topBreweries.map(([name, count], i) => (
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#4a3a2a", width:14 }}>{i+1}</div>
                    <div style={{ flex:1, fontFamily:"'DM Mono', monospace", fontSize:10, color:"#8a7a5a", lineHeight:1.3 }}>{name}</div>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#6a5a3a" }}>{count}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:13, color:"#8a7a5a", marginBottom:10 }}>Top Spots</div>
                {stats.topPlaces.map(([name, count], i) => (
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#4a3a2a", width:14 }}>{i+1}</div>
                    <div style={{ flex:1, fontFamily:"'DM Mono', monospace", fontSize:10, color:"#8a7a5a" }}>{name}</div>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"#6a5a3a" }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#000000cc", display:"flex", alignItems:"flex-end", zIndex:100 }} onClick={() => setShowForm(false)}>
          <div style={{ width:"100%", maxWidth:640, margin:"0 auto", background:"#1e1812", borderRadius:"12px 12px 0 0", padding:"24px 20px", border:"1px solid #3a2e1e" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:700, marginBottom:20, color:"#f0e8d8" }}>Log a Drink</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[
                ["Who", "who", ["Pierre","Jess"], "select"],
                ["Type", "type", ["Beer","Wine","Cider"], "select"],
              ].map(([label, field, opts]) => (
                <div key={field}>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#6a5a3a", letterSpacing:0.5, marginBottom:4 }}>{label}</div>
                  <select value={form[field]} onChange={e => setForm(f => ({...f, [field]:e.target.value}))} style={{ width:"100%", background:"#2a2018", border:"1px solid #3a2e1e", borderRadius:4, padding:"8px 10px", color:"#f0e8d8", fontFamily:"'DM Mono', monospace", fontSize:12 }}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {[
              ["Drink Name", "name", "e.g. Gee Whiz"],
              ["Brewery / Winery", "brewery", "e.g. Sonnen Hill Brewing"],
              ["Style", "style", "e.g. Saison"],
              ["Where", "where", "e.g. Volo, LCBO, Bottle Shop"],
            ].map(([label, field, ph]) => (
              <div key={field} style={{ marginBottom:10 }}>
                <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#6a5a3a", letterSpacing:0.5, marginBottom:4 }}>{label}</div>
                <input value={form[field]} onChange={e => setForm(f => ({...f, [field]:e.target.value}))} placeholder={ph} style={{ width:"100%", background:"#2a2018", border:"1px solid #3a2e1e", borderRadius:4, padding:"8px 10px", color:"#f0e8d8", fontFamily:"'DM Mono', monospace", fontSize:12 }}/>
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"#6a5a3a", letterSpacing:0.5, marginBottom:8 }}>Rating</div>
              <div style={{ display:"flex", gap:8 }}>
                {Object.entries(RATING_CONFIG).map(([r, cfg]) => (
                  <button key={r} onClick={() => setForm(f => ({...f, rating:r}))} style={{
                    flex:1, padding:"8px 4px", borderRadius:4, border:`1px solid ${form.rating===r ? cfg.color : "#3a2e1e"}`,
                    background: form.rating===r ? cfg.color+"22" : "#2a2018",
                    color: form.rating===r ? cfg.color : "#6a5a3a", fontSize:10, fontFamily:"'DM Mono', monospace", cursor:"pointer", letterSpacing:0.3
                  }}>{cfg.emoji}<br/>{r}</button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} style={{ width:"100%", background:"#e8785a", color:"#1a1410", border:"none", borderRadius:4, padding:"12px", fontFamily:"'DM Mono', monospace", fontSize:13, fontWeight:500, letterSpacing:1, cursor:"pointer" }}>
              Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
