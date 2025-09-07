import React, { useEffect, useMemo, useState } from "react";

// ==========================
// Improve Logic/Maths, Tinker with champion identities / specific roles. 
// Research using riot database on improving counters logic
// Fix darkmode
// ==========================

type Champ = { id: string; key: string; name: string; title: string; tags: string[]; image: { full: string } };
type ChampionMap = Record<string, Champ>;

type Lane = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

type Role = "Fighter" | "Mage" | "Tank" | "Marksman" | "Slayer" | "Controller" | "Specialist";

type Subclass =
  | "Enchanter" | "Catcher"
  | "Juggernaut" | "Diver" 
  | "Burst Mage" | "Battle Mage" | "Artillery" 
  | "Marksman"
  | "Assassin" | "Skirmisher" 
  | "Vanguard" | "Warden"
  | "Specialist";

// ---------- Utils ----------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// ---------- Lanes ----------
const TOP_NAMES = [
  "Aatrox","Akali","Ambessa","Aurora","Camille","Cho'Gath","Darius","Dr. Mundo","Fiora","Gangplank","Garen","Gnar","Gragas","Gwen","Heimerdinger","Illaoi","Irelia","Jax","Jayce","K'Sante","Karma","Kayle","Kennen","Kled","Malphite","Mordekaiser","Nasus","Olaf","Ornn","Pantheon","Poppy","Quinn","Renekton","Rengar","Riven","Rumble","Sett","Shen","Singed","Sion","Skarner","Smolder","Sylas","Tahm Kench","Teemo","Trundle","Tryndamere","Twisted Fate","Udyr","Urgot","Vayne","Vladimir","Volibear","Warwick","Wukong","Yasuo","Yone","Yorick","Zac"
];

const JUNGLE_NAMES = [
  "Amumu","Bel'Veth","Brand","Briar","Diana","Ekko","Elise","Evelynn","Fiddlesticks","Gragas","Graves","Gwen","Hecarim","Ivern","Jarvan IV","Jax","Karthus","Kayn","Kha'Zix","Kindred","Lee Sin","Lillia","Maokai","Master Yi","Nidalee","Nocturne","Nunu","Pantheon","Poppy","Rammus","Rek'Sai","Rengar","Sejuani","Shaco","Shyvana","Skarner","Taliyah","Talon","Teemo","Trundle","Udyr","Vi","Viego","Volibear","Warwick","Wukong","Xin Zhao","Zac","Zed"
];

const MID_NAMES = [
  "Ahri","Akali","Akshan","Anivia","Annie","Aurelion Sol","Aurora","Azir","Brand","Cassiopeia","Corki","Diana","Ekko","Fizz","Galio","Gragas","Heimerdinger","Hwei","Irelia","Jayce","Karma","Kassadin","Katarina","LeBlanc","Lissandra","Lux","Malphite","Malzahar","Mel","Naafiri","Neeko","Orianna","Pantheon","Qiyana","Rumble","Ryze","Smolder","Swain","Sylas","Syndra","Taliyah","Talon","Taric","Tristana","Twisted Fate","Veigar","Vel'Koz","Vex","Viktor","Vladimir","Xerath","Yasuo","Yone","Zed","Ziggs","Zoe"
];

const ADC_NAMES = [
  "Aphelios","Ashe","Caitlyn","Draven","Ezreal","Jhin","Jinx","Kai'Sa","Kalista","Karthus","Kog'Maw","Lucian","Miss Fortune","Nilah","Samira","Senna","Seraphine","Sivir","Smolder","Swain","Tristana","Twisted Fate","Twitch","Varus","Vayne","Xayah","Yasuo","Yunara","Zeri","Ziggs"
];

const SUPPORT_NAMES = [
  "Alistar","Amumu","Anivia","Annie","Ashe","Bard","Blitzcrank","Brand","Braum","Camille","Fiddlesticks","Galio","Heimerdinger","Hwei","Ivern","Janna","Karma","Leona","Lulu","Lux","Malphite","Maokai","Mel","Milio","Morgana","Nami","Nautilus","Neeko","Pantheon","Pyke","Rakan","Rell","Renata Glasc","Senna","Seraphine","Shaco","Shen","Sona","Soraka","Swain","Syndra","Tahm Kench","Taric","Teemo","Thresh","Twitch","Veigar","Vel'Koz","Xerath","Yuumi","Zac","Zilean","Zoe","Zyra"
];

// ---------- Subclasses ----------
const SUBCLASS_PAIRS: Array<[string, Subclass]> = [
  // === Enchanters ===
  ["janna","Enchanter"],["karma","Enchanter"],["lulu","Enchanter"],["milio","Enchanter"],["nami","Enchanter"],
  ["renataglasc","Enchanter"],["senna","Enchanter"],["seraphine","Enchanter"],["sona","Enchanter"],["soraka","Enchanter"],
  ["taric","Enchanter"],["yuumi","Enchanter"],

  // === Catchers ===
  ["bard","Catcher"],["blitzcrank","Catcher"],["ivern","Catcher"],["jhin","Catcher"],["morgana","Catcher"],
  ["neeko","Catcher"],["pyke","Catcher"],["rakan","Catcher"],["thresh","Catcher"],["zyra","Catcher"],

  // === Juggernauts ===
  ["aatrox","Juggernaut"],["darius","Juggernaut"],["drmundo","Juggernaut"],["garen","Juggernaut"],["illaoi","Juggernaut"],
  ["mordekaiser","Juggernaut"],["nasus","Juggernaut"],["sett","Juggernaut"],["shyvana","Juggernaut"],["skarner","Juggernaut"],
  ["trundle","Juggernaut"],["udyr","Juggernaut"],["urgot","Juggernaut"],["volibear","Juggernaut"],["yorick","Juggernaut"],

  // === Divers ===
  ["ambessa","Diver"],["briar","Diver"],["camille","Diver"],["diana","Diver"],["elise","Diver"],["hecarim","Diver"],
  ["irelia","Diver"],["jarvaniv","Diver"],["leesin","Diver"],["olaf","Diver"],["pantheon","Diver"],["reksai","Diver"],
  ["renekton","Diver"],["rengar","Diver"],["vi","Diver"],["warwick","Diver"],["wukong","Diver"],["xinzhao","Diver"],

  // === Burst Mage ===
  ["ahri","Burst Mage"],["annie","Burst Mage"],["aurora","Burst Mage"],["brand","Burst Mage"],["karma","Burst Mage"],
  ["leblanc","Burst Mage"],["lissandra","Burst Mage"],["lux","Burst Mage"],["neeko","Burst Mage"],["orianna","Burst Mage"],
  ["seraphine","Burst Mage"],["sylas","Burst Mage"],["syndra","Burst Mage"],["twistedfate","Burst Mage"],["veigar","Burst Mage"],
  ["vex","Burst Mage"],["zoe","Burst Mage"],

  // === Battle Mage ===
  ["anivia","Battle Mage"],["aurelionsol","Battle Mage"],["cassiopeia","Battle Mage"],["karthus","Battle Mage"],
  ["malzahar","Battle Mage"],["rumble","Battle Mage"],["ryze","Battle Mage"],["swain","Battle Mage"],["taliyah","Battle Mage"],
  ["viktor","Battle Mage"],["vladimir","Battle Mage"],

  // === Artillery  ===
  ["hwei","Artillery"],["jayce","Artillery"],["lux","Artillery"],["mel","Artillery"],["varus","Artillery"],
  ["velkoz","Artillery"],["xerath","Artillery"],["ziggs","Artillery"],

  // === Assassins ===
  ["akali","Assassin"],["akshan","Assassin"],["aurora","Assassin"],["diana","Assassin"],["ekko","Assassin"],
  ["evelynn","Assassin"],["fizz","Assassin"],["kassadin","Assassin"],["katarina","Assassin"],["khazix","Assassin"],
  ["leblanc","Assassin"],["naafiri","Assassin"],["nocturne","Assassin"],["pyke","Assassin"],["qiyana","Assassin"],
  ["rengar","Assassin"],["shaco","Assassin"],["talon","Assassin"],["yone","Assassin"],["zed","Assassin"],

  // === Skirmishers ===
  ["ambessa","Skirmisher"],["belveth","Skirmisher"],["fiora","Skirmisher"],["gwen","Skirmisher"],["jax","Skirmisher"],
  ["ksante","Skirmisher"],["kayn","Skirmisher"],["kled","Skirmisher"],["lillia","Skirmisher"],["masteryi","Skirmisher"],
  ["nilah","Skirmisher"],["riven","Skirmisher"],["sylas","Skirmisher"],["tryndamere","Skirmisher"],["viego","Skirmisher"],
  ["yasuo","Skirmisher"],["yone","Skirmisher"],

  // === Vanguard ===
  ["alistar","Vanguard"],["amumu","Vanguard"],["gragas","Vanguard"],["leona","Vanguard"],["malphite","Vanguard"],
  ["maokai","Vanguard"],["nautilus","Vanguard"],["nunu","Vanguard"],["ornn","Vanguard"],["rammus","Vanguard"],
  ["rell","Vanguard"],["sejuani","Vanguard"],["sion","Vanguard"],["skarner","Vanguard"],["zac","Vanguard"],

  // === Wardens ===
  ["braum","Warden"],["galio","Warden"],["ksante","Warden"],["poppy","Warden"],["shen","Warden"],
  ["tahmkench","Warden"],["taric","Warden"],

  // === Specialists ===
  ["azir","Specialist"],["chogath","Specialist"],["fiddlesticks","Specialist"],["gangplank","Specialist"],["gnar","Specialist"],
  ["graves","Specialist"],["heimerdinger","Specialist"],["kayle","Specialist"],["kennen","Specialist"],["nidalee","Specialist"],
  ["quinn","Specialist"],["singed","Specialist"],["teemo","Specialist"],["zilean","Specialist"],
];

// Build a record of champ -> array of subclasses (unique)
function buildSubclassMulti(){
  const m = new Map<string, Set<Subclass>>();
  for (const [name, sub] of SUBCLASS_PAIRS){
    const n = norm(name);
    if (!m.has(n)) m.set(n, new Set());
    m.get(n)!.add(sub);
  }
  const out: Record<string, Subclass[]> = {};
  for (const [k, set] of m.entries()) out[k] = Array.from(set);
  return out;
}
const SUBCLASS_MULTI = buildSubclassMulti();

// Preferred subclass per lane when a champ has multiple
const LANE_SUBCLASS_PRIORITY: Record<Lane, Subclass[]> = {
  Top: ["Juggernaut","Diver","Skirmisher","Vanguard","Warden","Battle Mage","Specialist"],
  Jungle: ["Diver","Assassin","Skirmisher","Vanguard","Warden","Battle Mage","Specialist"],
  Mid: ["Burst Mage","Artillery","Battle Mage","Assassin","Skirmisher","Specialist"],
  ADC: ["Artillery","Skirmisher","Assassin","Specialist"],
  Support: ["Enchanter","Warden","Vanguard","Catcher","Artillery","Specialist"],
};

function pickSubclassForLane(subs: Subclass[], lane: Lane): Subclass {
  const prefs = LANE_SUBCLASS_PRIORITY[lane];
  for (const p of prefs) if (subs.includes(p)) return p;
  return subs[0];
}

// Damage flavor (rough)
function damageFlavor(c: Champ): "AD" | "AP" | "Mixed" {
  const apAss = new Set(["Kassadin","Katarina","Evelynn","Ekko","Ahri","Fizz","Akali","Malzahar","VelKoz","Ziggs","Xerath","Lux","Brand","Karthus","Anivia","AurelionSol"]);
  if (c.tags.includes("Mage") || apAss.has(c.id)) return "AP";
  if (c.tags.includes("Tank") && c.tags.includes("Mage")) return "Mixed";
  return "AD";
}

const SCOUNTER: Record<Subclass, Partial<Record<Subclass, number>>> = {
  // Fighters & close-range duelists
  Diver: { Artillery: 1.2, Enchanter: 0.8, Warden: -0.6, Vanguard: -0.4 },
  Juggernaut: { "Battle Mage": 0.4, Artillery: -0.8, Enchanter: -0.4, Warden: -0.2 },

  // Mages
  "Burst Mage": { Assassin: 0.6, Juggernaut: 0.4, Vanguard: -0.2 },
  "Battle Mage": { Juggernaut: 0.3, Vanguard: -0.2, Artillery: -0.2 },
  Artillery: { Juggernaut: 0.8, Warden: 0.3, Diver: -1.0, Assassin: -1.0, Skirmisher: -0.6 },

  // Tanks / peelers
  Vanguard: { Artillery: 0.6, Skirmisher: 0.3, Assassin: 0.3, Enchanter: -0.2 },
  Warden: { Assassin: 1.0, Diver: 0.8, Skirmisher: 0.4, Artillery: -0.1 },
  // Controllers
  Enchanter: { Assassin: 0.8, Diver: 0.6, Skirmisher: 0.3, Artillery: -0.3 },
  Catcher: { Artillery: 0.8, Skirmisher: 0.4, Juggernaut: 0.2, Diver: -0.2 },
  // Marksman
  Marksman: { Juggernaut: 0.7, Diver: -1.0, Skirmisher: -0.6, Assassin: -1.2, Vanguard: -0.8, Warden: -0.5, Enchanter: 0.5, Catcher: -0.6, "Burst Mage": -0.4, "Battle Mage": -0.2, Artillery: 0.3, Specialist: 0.0,},
  // Slayers
  Skirmisher: { Juggernaut: 0.5, Artillery: 0.4, Warden: -0.3, Vanguard: -0.3 },
  Assassin: { Artillery: 1.2, Enchanter: 0.8, Warden: -1.0, Vanguard: -0.5, Juggernaut: -0.2 },

  // Wildcards
  Specialist: { Artillery: 0.2, Warden: 0.1, Assassin: -0.1 },
};


// ---------- Build lane overrides at runtime (supports multi-lane) ----------
function buildLaneOverrides(champs: ChampionMap){
  const byNorm = new Map<string, string>();
  Object.values(champs).forEach(c => byNorm.set(norm(c.name), c.id));
  const map = new Map<string, Set<Lane>>();
  const add = (arr: string[], lane: Lane) => {
    arr.forEach(name => { const id = byNorm.get(norm(name)); if (id){ if(!map.has(id)) map.set(id, new Set()); map.get(id)!.add(lane);} });
  };
  add(TOP_NAMES, "Top"); add(JUNGLE_NAMES, "Jungle"); add(MID_NAMES, "Mid"); add(ADC_NAMES, "ADC"); add(SUPPORT_NAMES, "Support");
  const out: Record<string, Lane[]> = {}; for (const [id,set] of map.entries()) out[id] = Array.from(set);
  return out;
}

// ---------- Inference helpers ----------
function inferSubclasses(c: Champ): Subclass[] {
  const list = SUBCLASS_MULTI[norm(c.name)];
  if (list && list.length) return list;
  // fallback from tags if not in curated list
  if (c.tags.includes("Slayer")) return ["Assassin", "Skirmisher"];
  if (c.tags.includes("Marksman")) return ["Marksman"];
  if (c.tags.includes("Tank")) return ["Vanguard","Warden"];
  if (c.tags.includes("Mage")) return ["Burst Mage","Artillery","Battle Mage"];
  if (c.tags.includes("Fighter")) return ["Diver","Juggernaut"];
  if (c.tags.includes("Support")) return ["Enchanter","Catcher","Warden"];
  return ["Specialist"];
}

function inferSubclassForContext(c: Champ, lane: Lane): Subclass {
  const subs = inferSubclasses(c);
  return pickSubclassForLane(subs, lane);
}

// ---------- Team needs ----------
function analyzeTeamNeeds(team: Champ[], myLane: Lane){
  const subs = team.map(c => inferSubclassForContext(c, myLane));
  const hasFrontline = subs.some(s => s === "Vanguard" || s === "Warden" || s === "Juggernaut");
  const hasEngage = subs.some(s => s === "Vanguard" || s === "Catcher" || s === "Diver");
  const hasPeel = subs.some(s => s === "Warden" || s === "Enchanter");
  const hasPoke = subs.some(s => s === "Artillery");

    // AP/AD balance using damageFlavor
  const apCount = team.filter(c => damageFlavor(c) === "AP").length;
  const adCount = team.filter(c => damageFlavor(c) === "AD").length;
  const n = Math.max(1, team.length);

  return {
    needFrontline: !hasFrontline,
    needEngage:   !hasEngage,
    needPeel:     !hasPeel,
    needPoke:     !hasPoke,
    needAP:       adCount / n > 0.66, // too much AD → we need AP
    needAD:       apCount / n > 0.66, // too much AP → we need AD
    apCount, adCount, n,
  };
}


// ---------- Scoring ----------
function scoreCandidate(champ: Champ, myLane: Lane, opponent: Champ | null, team: Champ[], weights: { counter: number; synergy: number; laneFit: number; archetype: number }){
  let score = 0;
  const lanes = ((window as any).__LANE_OVERRIDES?.[champ.id]) as Lane[] | undefined;
  const laneFit = lanes ? lanes.includes(myLane) : false;
  score += (laneFit ? 2 : -2) * weights.laneFit;

  const mySub = inferSubclassForContext(champ, myLane);
  if (opponent){
    const oppSub = inferSubclassForContext(opponent, myLane);
    score += (SCOUNTER[mySub]?.[oppSub] ?? 0) * weights.archetype;
  }

  const needs = analyzeTeamNeeds(team, myLane);
  if (needs.needFrontline && (mySub === "Vanguard" || mySub === "Warden" || mySub === "Juggernaut")) score += 1.1 * weights.synergy;
  if (needs.needEngage && (mySub === "Vanguard" || mySub === "Catcher" || mySub === "Diver")) score += 1.0 * weights.synergy;
  if (needs.needPeel && (mySub === "Warden" || mySub === "Enchanter")) score += 1.0 * weights.synergy;
  if (needs.needPoke && (mySub === "Artillery")) score += 0.8 * weights.synergy;

  return score;
}

const smallText: React.CSSProperties = { fontSize: 12, color: "#6b7280" };
const badge: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 999, padding: "2px 8px", fontSize: 12 };
const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" };

export default function ChampionRecommender(){
  const [version, setVersion] = useState<string|null>(null);
  const [champs, setChamps] = useState<ChampionMap>({});
  const [lane, setLane] = useState<Lane>("Mid");
  const [query, setQuery] = useState("");
  const [opponent, setOpponent] = useState<string>("");
  const [team, setTeam] = useState<string[]>([]);
  const [numResults, setNumResults] = useState(12);
  const [weights, setWeights] = useState({ counter: 0.8, synergy: 1.0, laneFit: 1.0, archetype: 1.2 });

  useEffect(()=>{(async()=>{
    const v: string[] = await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json();
    const ver = v[0]; setVersion(ver);
    const cjson = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/champion.json`)).json();
    setChamps(cjson.data);
    (window as any).__LANE_OVERRIDES = buildLaneOverrides(cjson.data); // multi-lane
  })();},[]);

  const list: Champ[] = useMemo(()=> Object.values(champs).sort((a,b)=>a.name.localeCompare(b.name)), [champs]);
  const byId = (id: string) => champs[id];
  const oppChamp = opponent? byId(opponent) ?? null : null;
  const teamChamps = useMemo(()=> team.map(id=>champs[id]).filter(Boolean) as Champ[], [team, champs]);
  const results = useMemo(()=> list.map(ch=>({ ch, s: scoreCandidate(ch,lane,oppChamp,teamChamps,weights) })).sort((a,b)=>b.s-a.s), [list,lane,oppChamp,teamChamps,weights]);

  const searchMatches = useMemo(()=> list.filter(c=> c.name.toLowerCase().includes(query.toLowerCase())), [list, query]);

  return (
    <div style={{ minHeight:"100dvh", width:"100%", background:"#f8fafc", color:"#0f172a" }}>
      <div style={{ width:"100%", margin:0, padding:"24px clamp(16px,3vw,48px)" }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>LoL Champion Recommender</h1>
          <p style={{ ...smallText, marginTop: 4 }}>Helps you find the right champ to pick depending on match up and team comp.</p>
        </header>

        {/* Controls */}
        <section style={{ ...card, padding: 12, marginBottom: 12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12, alignItems:"end" }}>
            <div>
              <label style={smallText}>Your lane</label>
              <select value={lane} onChange={e=>setLane(e.target.value as Lane)} style={{ width:"100%", padding:10, borderRadius:10, border:"1px solid #e5e7eb" }}>
                {(["Top","Jungle","Mid","ADC","Support"] as Lane[]).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={smallText}>Lane opponent</label>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search (e.g. Yasuo)" style={{ width:"100%", padding:10, borderRadius:10, border:"1px solid #e5e7eb" }} />
              {query && (
                <div style={{ ...card, marginTop: 8, maxHeight: 240, overflow: "auto" }}>
                  {searchMatches.slice(0,20).map(c=> (
                    <button key={c.id} onClick={()=>{ setOpponent(c.id); setQuery(""); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:8, background:"transparent", border:0, textAlign:"left" }}>
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} style={{ width:22, height:22, borderRadius:4 }} />
                      <span style={{ fontSize:14 }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={smallText}>Team picks</label>
              <select onChange={(e)=> e.target.value && setTeam(t=> t.includes(e.target.value)? t : [...t, e.target.value])} value="" style={{ width:"100%", padding:10, borderRadius:10, border:"1px solid #e5e7eb" }}>
                <option value="" disabled>Add teammate…</option>
                {list.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {team.length>0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                  {team.map(id => {
                    const c = champs[id]; if(!c) return null; const subs = inferSubclasses(c);
                    return (
                      <span key={id} style={{ ...badge }}>
                        {c.name} · {subs.join(" / ")} <button onClick={()=>setTeam(t=>t.filter(x=>x!==id))} style={{ border:0, background:"transparent", marginLeft:6 }}>✕</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label style={smallText}>Results ({numResults})</label>
              <input type="range" min={4} max={30} value={numResults} onChange={e=>setNumResults(parseInt(e.target.value))} style={{ width:"100%" }} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:8, marginTop:8 }}>
                {(["laneFit","archetype","counter","synergy"] as const).map(k => (
                  <div key={k}>
                    <label style={smallText}>{k}</label>
                    <input type="range" min={0} max={2} step={0.1} value={weights[k]} onChange={e=>setWeights(w=>({...w, [k]: parseFloat(e.target.value)}))} style={{ width:"100%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team overview */}
        <section style={{ ...card, padding: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"4px 0 8px" }}>Team overview</h2>

          <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
            {oppChamp ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:8, border:"1px solid #e5e7eb", borderRadius:10, background:"#fff" }}>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${oppChamp.image.full}`}
                  style={{ width:28, height:28, borderRadius:6 }}
                />
                <span style={{ fontSize:14 }}>
                  Opponent: <strong>{oppChamp.name}</strong>
                </span>
              </div>
            ) : (
              <span style={smallText}>No lane opponent selected.</span>
            )}
            <span style={smallText}>Team size: {teamChamps.length}</span>
          </div>

          {(() => {
            const needs = analyzeTeamNeeds(teamChamps, lane);
            const needChips: Array<[string, boolean]> = [
              ["Frontline", needs.needFrontline],
              ["Engage",    needs.needEngage],
              ["Peel",      needs.needPeel],
              ["Poke",      needs.needPoke],
              ["AP Damage", needs.needAP],
              ["AD Damage", needs.needAD],
            ];
            return (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
                {needChips.map(([label, missing]) => (
                  <span
                    key={label}
                    style={{
                      ...badge,
                      background: missing ? "#fff7ed" : "#ecfeff",
                      borderColor: missing ? "#fed7aa" : "#bae6fd",
                    }}
                  >
                    {missing ? `Lacking: ${label}` : `OK: ${label}`}
                  </span>
                ))}
                <span style={{ ...smallText, marginLeft: "auto" }}>
                  Mix: {needs.apCount} AP / {needs.adCount} AD
                </span>
              </div>
            );
          })()}
        </section>

        {/* Recommendations */}
        <section>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"8px 0" }}>Recommended champions</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:12 }}>
            {results.slice(0, numResults).map(({ch,s}) => {
              const subs = inferSubclasses(ch);
              const chosen = inferSubclassForContext(ch, lane);
              const role: Role =
                chosen === "Diver" || chosen === "Juggernaut" ? "Fighter" :
                chosen === "Skirmisher" || chosen === "Assassin" ? "Slayer" :
                chosen === "Burst Mage" || chosen === "Battle Mage" || chosen === "Artillery" ? "Mage" :
                chosen === "Vanguard" || chosen === "Warden" ? "Tank" :
                chosen === "Enchanter" || chosen === "Catcher" ? "Controller" :
                "Specialist";

              return (
                <div key={ch.id} style={{ ...card, padding: 10 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${ch.image.full}`} style={{ width:64, height:64, borderRadius:8, objectFit:"cover" }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700 }}>{ch.name}</div>
                      <div style={smallText}>{role} · {chosen} ({subs.join(" / ")})</div>
                      <div style={smallText}>Score {s.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Browse all by lane */}
        <section style={{ marginTop: 16 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"8px 0" }}>Browse all champions</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10 }}>
            {(["Top","Jungle","Mid","ADC","Support"] as Lane[]).map(L => (
              <div key={L} style={{ ...card, padding: 10 }}>
                <div style={{ fontWeight:700, marginBottom:8 }}>{L}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))", gap:8 }}>
                  {list.filter(c=> ((window as any).__LANE_OVERRIDES?.[c.id] ?? []).includes(L)).map(c => (
                    <button key={c.id} onClick={()=>setOpponent(c.id)} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:0, textAlign:"left" }}>
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} style={{ width:20, height:20, borderRadius:4 }} />
                      <span style={{ fontSize:13, textDecoration:"underline" }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: 24, ...smallText }}>
          Multi-lane + multi-subclass implemented. To adjust, edit SUBCLASS_PAIRS or the lane arrays.
        </footer>
      </div>
    </div>
  );
}
