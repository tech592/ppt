import { useState, useEffect, useCallback, useRef } from "react";
 
/* ═══════════════════════════════════════════════════════════
   JUNGLE FRENCH — a pop-up sticker book
   Aesthetic: die-cut paper stickers on pastel skies.
   Everything breathes, wobbles, and drifts.
   ═══════════════════════════════════════════════════════════ */
 
const speak = (text, rate = 0.7) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = rate;
  u.pitch = 1.15;
  const fr = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("fr"));
  if (fr) u.voice = fr;
  window.speechSynthesis.speak(u);
};
 
/* ── The sticker outline: thick white die-cut edge ── */
const stickerText = (col, w = 5) => ({
  color: col,
  textShadow: `
    ${w}px 0 0 #fff, -${w}px 0 0 #fff, 0 ${w}px 0 #fff, 0 -${w}px 0 #fff,
    ${w}px ${w}px 0 #fff, -${w}px -${w}px 0 #fff, ${w}px -${w}px 0 #fff, -${w}px ${w}px 0 #fff,
    0 ${w + 6}px ${w + 8}px rgba(120,90,140,0.28)`,
});
 
const INK = "#4A3B5C";
 
/* ═══════════════ GLOBAL ANIMATION SHEET ═══════════════ */
function Keyframes() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Fredoka:wght@500;600;700&display=swap');
 
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
 
      /* ambient */
      @keyframes drift {
        0%   { transform: translate(0,0) rotate(0deg); }
        50%  { transform: translate(24px,-18px) rotate(180deg); }
        100% { transform: translate(0,0) rotate(360deg); }
      }
      @keyframes floatAcross {
        0%   { transform: translateX(-12vw) translateY(0) rotate(0deg); opacity:0; }
        10%  { opacity: .85; }
        90%  { opacity: .85; }
        100% { transform: translateX(112vw) translateY(-40px) rotate(360deg); opacity:0; }
      }
      @keyframes cloudGlide {
        0%   { transform: translateX(-30vw); }
        100% { transform: translateX(130vw); }
      }
      @keyframes breathe {
        0%,100% { transform: scale(1) rotate(var(--tilt,0deg)); }
        50%     { transform: scale(1.035) rotate(calc(var(--tilt,0deg) + 1.5deg)); }
      }
      @keyframes bobble {
        0%,100% { transform: translateY(0) rotate(-4deg); }
        50%     { transform: translateY(-9px) rotate(4deg); }
      }
      @keyframes sway {
        0%,100% { transform: rotate(-2.5deg); }
        50%     { transform: rotate(2.5deg); }
      }
 
      /* entrance */
      @keyframes popIn {
        0%   { transform: scale(.3) translateY(30px) rotate(-14deg); opacity:0; }
        60%  { transform: scale(1.12) translateY(-6px) rotate(3deg); opacity:1; }
        100% { transform: scale(1) translateY(0) rotate(var(--tilt,0deg)); opacity:1; }
      }
      @keyframes slideUpIn {
        0%   { transform: translateY(40px); opacity:0; }
        100% { transform: translateY(0); opacity:1; }
      }
      @keyframes bannerDrop {
        0%   { transform: translateY(-120px) rotate(-8deg); opacity:0; }
        70%  { transform: translateY(10px) rotate(2deg); opacity:1; }
        100% { transform: translateY(0) rotate(-1.5deg); opacity:1; }
      }
 
      /* interaction */
      @keyframes squish {
        0%   { transform: scale(1) rotate(var(--tilt,0deg)); }
        30%  { transform: scale(1.22,.82) rotate(calc(var(--tilt,0deg) - 5deg)); }
        60%  { transform: scale(.9,1.14) rotate(calc(var(--tilt,0deg) + 5deg)); }
        100% { transform: scale(1) rotate(var(--tilt,0deg)); }
      }
      @keyframes ripple {
        0%   { transform: scale(.4); opacity:.7; }
        100% { transform: scale(2.4); opacity:0; }
      }
      @keyframes soundRing {
        0%   { transform: scale(1); opacity:.9; }
        100% { transform: scale(1.9); opacity:0; }
      }
      @keyframes shimmer {
        0%,100% { filter: brightness(1); }
        50%     { filter: brightness(1.22); }
      }
 
      /* celebration */
      @keyframes fall {
        0%   { transform: translateY(-10vh) rotate(0deg); opacity:1; }
        100% { transform: translateY(105vh) rotate(760deg); opacity:0; }
      }
      @keyframes twinkle {
        0%,100% { opacity:.25; transform: scale(.7); }
        50%     { opacity:1;   transform: scale(1.3); }
      }
      @keyframes wiggleDance {
        0%,100% { transform: translateY(0) rotate(-9deg); }
        25%     { transform: translateY(-13px) rotate(9deg); }
        50%     { transform: translateY(0) rotate(-9deg); }
        75%     { transform: translateY(-8px) rotate(6deg); }
      }
      @keyframes glowPulse {
        0%,100% { box-shadow: 0 10px 0 rgba(0,0,0,.08), 0 0 0 0 rgba(255,214,0,.55); }
        50%     { box-shadow: 0 10px 0 rgba(0,0,0,.08), 0 0 0 18px rgba(255,214,0,0); }
      }
 
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
      }
      ::-webkit-scrollbar { width: 0; height: 0; }
    `}</style>
  );
}
 
/* ═══════════════ AMBIENT BACKGROUND ═══════════════ */
function Sky({ palette, slide }) {
  const drifters = ["🍃","🦋","🌸","🍃","🐝","🌺","🍃","🦋"];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {/* soft light blooms */}
      <div style={{ position:"absolute", top:"-18%", left:"-12%", width:"55vw", height:"55vw",
        borderRadius:"50%", background:`radial-gradient(circle, ${palette.bloomA} 0%, transparent 68%)`,
        animation:"drift 22s ease-in-out infinite" }} />
      <div style={{ position:"absolute", bottom:"-22%", right:"-14%", width:"60vw", height:"60vw",
        borderRadius:"50%", background:`radial-gradient(circle, ${palette.bloomB} 0%, transparent 68%)`,
        animation:"drift 28s ease-in-out infinite reverse" }} />
 
      {/* puffy clouds */}
      {[{t:"9%",s:1,d:52,delay:0},{t:"22%",s:.65,d:70,delay:-24},{t:"6%",s:.8,d:62,delay:-42}].map((c,i)=>(
        <div key={i} style={{ position:"absolute", top:c.t, left:0, opacity:.55,
          animation:`cloudGlide ${c.d}s linear ${c.delay}s infinite`, transform:`scale(${c.s})` }}>
          <div style={{ position:"relative", width:120, height:44 }}>
            {[[0,10,58,38],[34,0,54,50],[70,14,50,34]].map((p,j)=>(
              <div key={j} style={{ position:"absolute", left:p[0], top:p[1], width:p[2], height:p[3],
                background:"#fff", borderRadius:"50%" }} />
            ))}
          </div>
        </div>
      ))}
 
      {/* drifting nature confetti */}
      {drifters.map((e,i)=>(
        <span key={i} style={{ position:"absolute", top:`${12 + (i*11)%72}%`, fontSize:`${16+(i%4)*7}px`,
          animation:`floatAcross ${26+i*4}s linear ${-i*5}s infinite` }}>{e}</span>
      ))}
 
      {/* rolling canopy hills — soft paper layers */}
      <svg viewBox="0 0 1200 240" preserveAspectRatio="none"
        style={{ position:"absolute", bottom:0, left:0, width:"100%", height:"26vh", minHeight:130 }}>
        <path d="M0,150 Q150,80 300,140 T600,130 T900,145 T1200,110 L1200,240 L0,240 Z" fill={palette.hillA} opacity=".55"/>
        <path d="M0,185 Q180,125 360,180 T720,172 T1080,190 T1200,160 L1200,240 L0,240 Z" fill={palette.hillB} opacity=".7"/>
        <path d="M0,215 Q200,175 420,212 T840,205 T1200,215 L1200,240 L0,240 Z" fill={palette.hillC} opacity=".9"/>
      </svg>
 
      {/* swaying foreground fronds */}
      <span style={{ position:"absolute", bottom:"-8px", left:"-14px", fontSize:"clamp(60px,13vw,120px)",
        transformOrigin:"bottom center", animation:"sway 6s ease-in-out infinite", opacity:.8 }}>🌿</span>
      <span style={{ position:"absolute", bottom:"-14px", right:"-16px", fontSize:"clamp(64px,14vw,130px)",
        transformOrigin:"bottom center", animation:"sway 7.5s ease-in-out .8s infinite reverse", opacity:.8 }}>🌴</span>
    </div>
  );
}
 
/* ═══════════════ THE STICKER ═══════════════ */
function Sticker({ children, onClick, tilt = 0, delay = 0, bg = "#fff", shadow = "rgba(120,90,140,.3)",
                   pad = 14, radius = 26, style = {}, idle = true, ring = false }) {
  const [tap, setTap] = useState(0);
  const [ripples, setRipples] = useState([]);
  const [entered, setEntered] = useState(false);
 
  useEffect(() => { const t = setTimeout(()=>setEntered(true), delay*1000 + 700); return ()=>clearTimeout(t); }, [delay]);
 
  const handle = (e) => {
    setTap(t => t + 1);
    const id = Date.now();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 650);
    onClick?.(e);
  };
 
  return (
    <div
      onClick={handle}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), handle(e))}
      style={{
        "--tilt": `${tilt}deg`,
        position: "relative",
        background: bg,
        border: "5px solid #fff",
        borderRadius: radius,
        padding: pad,
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        boxShadow: `0 9px 0 ${shadow}, 0 16px 26px rgba(110,80,130,.22)`,
        animation: !entered
          ? `popIn .72s cubic-bezier(.34,1.56,.64,1) ${delay}s both`
          : tap
            ? `squish .48s cubic-bezier(.34,1.56,.64,1)`
            : idle
              ? `breathe ${3.4 + (tilt % 3) * .45}s ease-in-out ${delay}s infinite`
              : "none",
        transform: `rotate(${tilt}deg)`,
        ...style,
      }}
      key={tap}
    >
      {ripples.map(id => (
        <span key={id} style={{ position:"absolute", inset:"-30%", borderRadius:"50%",
          background:"rgba(255,255,255,.55)", animation:"ripple .65s ease-out forwards", pointerEvents:"none" }} />
      ))}
      {ring && (
        <span style={{ position:"absolute", inset:-6, borderRadius:radius+6, border:"4px solid #FFD84D",
          animation:"soundRing .8s ease-out forwards", pointerEvents:"none" }} />
      )}
      <div style={{ position:"relative", zIndex:1 }}>{children}</div>
    </div>
  );
}
 
/* ═══════════════ CONFETTI ═══════════════ */
function Confetti({ on }) {
  if (!on) return null;
  const bits = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    l: Math.random() * 100,
    d: Math.random() * .8,
    dur: 2 + Math.random() * 2,
    c: ["#FF9FB2","#FFD84D","#8FE3B8","#9FD8FF","#C9B0FF","#FFB88C","#FFF"][i % 7],
    s: 7 + Math.random() * 11,
    round: i % 3 === 0,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}>
      {bits.map(b => (
        <div key={b.id} style={{ position:"absolute", left:`${b.l}%`, top:0, width:b.s, height:b.round?b.s:b.s*.5,
          background:b.c, borderRadius:b.round?"50%":3, animation:`fall ${b.dur}s ease-in ${b.d}s forwards` }} />
      ))}
    </div>
  );
}
 
/* ═══════════════ TITLE HELPER ═══════════════ */
function BigTitle({ children, color = "#FF6B9D", size = "clamp(26px,6vw,50px)", delay = 0 }) {
  return (
    <h2 style={{
      fontFamily:"'Baloo 2', cursive", fontWeight:800, fontSize:size, margin:0, lineHeight:1.12,
      letterSpacing:".5px", textAlign:"center", ...stickerText(color),
      animation:`bannerDrop .9s cubic-bezier(.34,1.56,.64,1) ${delay}s both`,
    }}>{children}</h2>
  );
}
function Whisper({ children, delay = .3 }) {
  return (
    <p style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:600, color:INK, opacity:.75,
      fontSize:"clamp(11px,2.3vw,16px)", margin:"8px 0 0", textAlign:"center",
      animation:`slideUpIn .7s ease ${delay}s both` }}>{children}</p>
  );
}
 
/* ═══════════════ DATA ═══════════════ */
const COLORS = [
  { fr:"Rouge",  en:"Red",    hex:"#FF7B7B", emoji:"🐸", desc:"une grenouille rouge" },
  { fr:"Rose",   en:"Pink",   hex:"#FFA8CE", emoji:"🦩", desc:"un flamant rose" },
  { fr:"Jaune",  en:"Yellow", hex:"#FFDE6B", emoji:"🍌", desc:"une banane jaune" },
  { fr:"Bleu",   en:"Blue",   hex:"#8FCBFF", emoji:"🦋", desc:"un papillon bleu" },
  { fr:"Blanc",  en:"White",  hex:"#FBF7FF", emoji:"🐯", desc:"un tigre blanc" },
  { fr:"Noir",   en:"Black",  hex:"#8B85A8", emoji:"🐆", desc:"une panthère noire" },
  { fr:"Marron", en:"Brown",  hex:"#C9A27E", emoji:"🐒", desc:"un singe marron" },
  { fr:"Orange", en:"Orange", hex:"#FFB067", emoji:"🐯", desc:"un tigre orange" },
  { fr:"Vert",   en:"Green",  hex:"#9BE3AE", emoji:"🌿", desc:"la jungle verte" },
];
 
const ALPHABET = [
  ["A","Alligator","🐊","Ah"],   ["B","Banane","🍌","Bay"],     ["C","Crocodile","🐊","Say"],
  ["D","Dromadaire","🐪","Day"], ["E","Éléphant","🐘","Euh"],   ["F","Flamant","🦩","Eff"],
  ["G","Girafe","🦒","Gé"],      ["H","Hibou","🦉","Ash"],      ["I","Iguane","🦎","Ee"],
  ["J","Jaguar","🐆","Ji"],      ["K","Koala","🐨","Ka"],       ["L","Lion","🦁","Ell"],
  ["M","Macaque","🐒","Emm"],    ["N","Nénuphar","🪷","Enn"],   ["O","Oiseau","🐦","Oh"],
  ["P","Perroquet","🦜","Pay"],  ["Q","Quetzal","🐦","Ku"],     ["R","Rhinocéros","🦏","Air"],
  ["S","Serpent","🐍","Ess"],    ["T","Tigre","🐯","Tay"],      ["U","Un","☝️","U"],
  ["V","Vautour","🦅","Vay"],    ["W","Wombat","🐻","Double vé"],["X","Xylophone","🎵","Iks"],
  ["Y","Yack","🐃","I grec"],    ["Z","Zèbre","🦓","Zed"],
].map(([letter, word, emoji, pron]) => ({ letter, word, emoji, pron }));
 
const CANDY = ["#FFB3C7","#FFD98E","#A8E6CF","#A5D8FF","#D4BBFF","#FFC2A1","#B5EAD7","#FFDAC1","#C7CEEA","#F8C8DC","#BFEFCF","#FFE0AC","#CDE7FF"];
 
const PALETTES = [
  { g:"linear-gradient(170deg,#FFE9C7 0%,#FFD4E4 45%,#D6E9FF 100%)", bloomA:"rgba(255,214,120,.55)", bloomB:"rgba(190,215,255,.6)",  hillA:"#C3E7C9", hillB:"#A5DDB4", hillC:"#8ED3A5" },
  { g:"linear-gradient(170deg,#D9F5E4 0%,#FFF6CE 55%,#FFE2D1 100%)", bloomA:"rgba(160,235,190,.5)",  bloomB:"rgba(255,220,160,.55)", hillA:"#BFE6D8", hillB:"#9FDCC4", hillC:"#8ED3B4" },
  { g:"linear-gradient(170deg,#FFDCEC 0%,#F1E0FF 50%,#D8F0FF 100%)", bloomA:"rgba(255,180,215,.5)",  bloomB:"rgba(190,225,255,.55)", hillA:"#CFE8D2", hillB:"#B0DDBC", hillC:"#96D2A8" },
  { g:"linear-gradient(170deg,#E6DEFF 0%,#DCF3FF 50%,#DCF7E7 100%)", bloomA:"rgba(200,180,255,.5)",  bloomB:"rgba(170,235,205,.55)", hillA:"#C6E5DA", hillB:"#A6DBC6", hillC:"#8FD2B6" },
  { g:"linear-gradient(170deg,#FFF3C9 0%,#FFDFC7 50%,#FFD6E6 100%)", bloomA:"rgba(255,225,140,.55)", bloomB:"rgba(255,190,200,.5)",  hillA:"#CBE9CF", hillB:"#ACDEB9", hillC:"#93D3A4" },
  { g:"linear-gradient(170deg,#D5EEFF 0%,#E4E1FF 50%,#FBDDF0 100%)", bloomA:"rgba(170,215,255,.55)", bloomB:"rgba(215,190,255,.5)",  hillA:"#C8E6D5", hillB:"#A9DCC0", hillC:"#90D2AE" },
  { g:"linear-gradient(170deg,#D8F6EA 0%,#D5EAFF 50%,#EDE0FF 100%)", bloomA:"rgba(160,230,205,.5)",  bloomB:"rgba(200,190,255,.5)",  hillA:"#C4E7D6", hillB:"#A3DCC2", hillC:"#8CD2B1" },
  { g:"linear-gradient(170deg,#FFD9E8 0%,#D9CCFF 48%,#B8C8F5 100%)", bloomA:"rgba(255,200,225,.5)",  bloomB:"rgba(180,175,255,.55)", hillA:"#B9C9EF", hillB:"#A5B7E6", hillC:"#92A7DC" },
];
 
/* ═══════════════ SLIDE 1 · TITLE ═══════════════ */
function SlideTitle() {
  const [ring, setRing] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", padding:"18px 16px" }}>
      <div style={{ fontSize:"clamp(52px,12vw,96px)", animation:"bobble 3s ease-in-out infinite", marginBottom:-4 }}>🦜</div>
      <BigTitle color="#FF6B9D" size="clamp(30px,8vw,62px)">Bienvenue<br/>dans la Jungle !</BigTitle>
      <Whisper delay={.45}>🌸 A French sticker-book safari for little explorers 🌸</Whisper>
 
      <div style={{ display:"flex", gap:"clamp(6px,2vw,16px)", margin:"18px 0 4px" }}>
        {["🐒","🦋","🐯","🌺","🐘"].map((e,i)=>(
          <span key={i} style={{ fontSize:"clamp(24px,5.5vw,42px)",
            animation:`bobble ${2.4+i*.3}s ease-in-out ${i*.18}s infinite` }}>{e}</span>
        ))}
      </div>
 
      <Sticker tilt={-2} delay={.7} bg="#FFB3C7" shadow="rgba(214,110,150,.5)" radius={40} pad={0}
        ring={ring}
        onClick={() => { speak("Bonjour les amis ! Bienvenue dans la jungle !"); setRing(true); setTimeout(()=>setRing(false),820); }}
        style={{ marginTop:14, animation:"glowPulse 2.4s ease-in-out infinite" }}>
        <div style={{ padding:"14px 30px", fontFamily:"'Baloo 2',cursive", fontWeight:800,
          fontSize:"clamp(14px,3.4vw,22px)", color:"#fff", textShadow:"0 2px 4px rgba(200,80,120,.5)" }}>
          🔊 Tap Coco to say Bonjour !
        </div>
      </Sticker>
 
      <Sticker tilt={1.5} delay={.95} bg="#FFF" shadow="rgba(150,130,190,.35)" radius={22} idle={false} style={{ marginTop:16 }}>
        <span style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:600, color:INK, fontSize:"clamp(10px,2.2vw,14px)", padding:"0 8px" }}>
          🎨 Colors &nbsp;•&nbsp; 🔤 Alphabet &nbsp;•&nbsp; Grades 1 &amp; 2
        </span>
      </Sticker>
    </div>
  );
}
 
/* ═══════════════ SLIDE 2 · GUIDES ═══════════════ */
function SlideGuides() {
  const [live, setLive] = useState(null);
  const guides = [
    { emoji:"🐒", name:"Le Singe",     en:"Monkey", sfx:"Ooh ooh, aah aah !", bg:"#FFD9A8", sh:"rgba(214,160,90,.5)",  tilt:-3 },
    { emoji:"🦜", name:"Le Perroquet", en:"Parrot", sfx:"Bonjour !",          bg:"#A8E6CF", sh:"rgba(110,190,160,.5)", tilt:2  },
    { emoji:"🐯", name:"Le Tigre",     en:"Tiger",  sfx:"Roar !",             bg:"#FFB3C7", sh:"rgba(214,110,150,.5)", tilt:-2 },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", height:"100%", padding:"20px 14px" }}>
      <BigTitle color="#7C5CD6" size="clamp(24px,5.6vw,44px)">Meet Your Guides!</BigTitle>
      <Whisper>Tap a friend to hear their French name 🔊</Whisper>
      <div style={{ display:"flex", gap:"clamp(10px,3vw,26px)", flexWrap:"wrap", justifyContent:"center",
        flex:1, alignItems:"center", paddingBottom:"6vh" }}>
        {guides.map((g,i)=>(
          <Sticker key={g.name} tilt={g.tilt} delay={.15*i} bg={g.bg} shadow={g.sh} radius={30}
            ring={live===i}
            onClick={()=>{ speak(g.name); setLive(i); setTimeout(()=>setLive(null),820); }}
            style={{ width:"clamp(130px,25vw,205px)", textAlign:"center" }}>
            <div style={{ width:"clamp(58px,11vw,92px)", height:"clamp(58px,11vw,92px)", margin:"0 auto 8px",
              background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"clamp(30px,6vw,50px)", boxShadow:"inset 0 -4px 10px rgba(0,0,0,.06)",
              animation:`bobble ${2.6+i*.4}s ease-in-out ${i*.2}s infinite` }}>{g.emoji}</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"clamp(15px,3.2vw,24px)",
              color:"#fff", textShadow:`0 2px 0 ${g.sh}` }}>{g.name}</div>
            <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:"clamp(10px,2vw,13px)", color:INK, opacity:.7 }}>({g.en})</div>
            <div style={{ marginTop:6, background:"#fff", borderRadius:14, padding:"3px 10px", display:"inline-block",
              fontFamily:"'Fredoka',sans-serif", fontWeight:600, fontSize:"clamp(9px,1.9vw,12px)", color:INK }}>{g.sfx}</div>
          </Sticker>
        ))}
      </div>
    </div>
  );
}
 
/* ═══════════════ SLIDES 3–4 · COLORS ═══════════════ */
function SlideColors({ set }) {
  const [live, setLive] = useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", height:"100%", padding:"20px 14px" }}>
      <BigTitle color="#FF8FB1" size="clamp(22px,5.2vw,40px)">Les Couleurs 🎨</BigTitle>
      <Whisper>Tap a sticker to hear the colour in French</Whisper>
      <div style={{ display:"flex", gap:"clamp(10px,3vw,24px)", flexWrap:"wrap", justifyContent:"center",
        flex:1, alignItems:"center", paddingBottom:"6vh" }}>
        {set.map((c,i)=>(
          <Sticker key={c.fr} tilt={i%2?2.5:-2.5} delay={.13*i} bg={c.hex} shadow="rgba(140,110,170,.35)" radius={28}
            ring={live===i}
            onClick={()=>{ speak(c.fr); setLive(i); setTimeout(()=>setLive(null),820); }}
            style={{ width:"clamp(118px,24vw,190px)", textAlign:"center" }}>
            <div style={{ fontSize:"clamp(34px,7vw,58px)", animation:`bobble ${2.8+i*.35}s ease-in-out ${i*.25}s infinite` }}>{c.emoji}</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"clamp(19px,4.4vw,34px)",
              margin:"2px 0", ...stickerText(c.hex === "#FBF7FF" ? "#B9AECB" : c.hex, 3) }}>{c.fr}</div>
            <div style={{ fontFamily:"'Fredoka',sans-serif", fontStyle:"italic", fontSize:"clamp(9px,1.85vw,12px)",
              color:INK, opacity:.72 }}>{c.desc}</div>
            <div style={{ marginTop:7, background:"#fff", borderRadius:14, padding:"3px 14px", display:"inline-block",
              fontFamily:"'Fredoka',sans-serif", fontWeight:700, fontSize:"clamp(10px,2vw,13px)", color:INK }}>{c.en}</div>
          </Sticker>
        ))}
      </div>
    </div>
  );
}
 
/* ═══════════════ SLIDE 5 · MATCH GAME ═══════════════ */
function SlideGame() {
  const pool = COLORS.slice(0, 6);
  const [names, setNames] = useState([]);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState([]);
  const [party, setParty] = useState(false);
  const [shake, setShake] = useState(null);
 
  const reset = () => { setNames([...pool].sort(()=>Math.random()-.5)); setDone([]); setPick(null); };
  useEffect(reset, []);
 
  const tapSwatch = (i) => { if (done.includes(pool[i].fr)) return; setPick(i); speak(pool[i].fr); };
  const tapName = (c) => {
    if (done.includes(c.fr)) return;
    if (pick !== null && pool[pick].fr === c.fr) {
      const nd = [...done, c.fr];
      setDone(nd); setPick(null);
      if (nd.length === pool.length) { setParty(true); speak("Bravo ! Félicitations !"); setTimeout(()=>setParty(false), 3600); }
    } else { setShake(c.fr); setTimeout(()=>setShake(null), 420); setPick(null); }
  };
 
  const won = done.length === pool.length;
 
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", height:"100%", padding:"18px 14px" }}>
      <Confetti on={party} />
      <BigTitle color="#F5A623" size="clamp(21px,5vw,38px)">🎮 Colour Match!</BigTitle>
      <Whisper>Tap a sticker, then tap its French name</Whisper>
 
      <div style={{ display:"flex", gap:"clamp(7px,2vw,14px)", flexWrap:"wrap", justifyContent:"center", margin:"16px 0 14px" }}>
        {pool.map((c,i)=>{
          const got = done.includes(c.fr);
          return (
            <Sticker key={c.fr} tilt={i%2?3:-3} delay={.07*i} bg={got ? "#E8E4F0" : c.hex}
              shadow={pick===i ? "rgba(245,166,35,.7)" : "rgba(140,110,170,.35)"} radius={20} pad={0}
              onClick={()=>tapSwatch(i)}
              style={{ width:"clamp(52px,11vw,80px)", height:"clamp(52px,11vw,80px)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"clamp(24px,5vw,40px)", opacity: got ? .45 : 1,
                borderColor: pick===i ? "#FFD84D" : "#fff", borderWidth: pick===i ? 6 : 5 }}>
              {got ? "✅" : c.emoji}
            </Sticker>
          );
        })}
      </div>
 
      <div style={{ display:"flex", gap:"clamp(6px,1.8vw,12px)", flexWrap:"wrap", justifyContent:"center", maxWidth:620 }}>
        {names.map((c,i)=>{
          const got = done.includes(c.fr);
          return (
            <Sticker key={c.fr} tilt={i%2?-2:2} delay={.5+.06*i} bg={got ? "#A8E6CF" : "#fff"}
              shadow={got ? "rgba(110,190,160,.5)" : "rgba(150,130,190,.32)"} radius={18} pad={0}
              onClick={()=>tapName(c)} idle={!got}
              style={{ padding:"9px 17px", opacity: got ? .8 : 1,
                animation: shake===c.fr ? "squish .42s ease" : undefined }}>
              <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:700, color:INK,
                fontSize:"clamp(13px,2.9vw,21px)" }}>{got ? "✅ " : ""}{c.fr}</span>
            </Sticker>
          );
        })}
      </div>
 
      <div style={{ marginTop:16, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:700, fontSize:"clamp(13px,2.8vw,20px)",
          ...stickerText(won ? "#3FBF7F" : "#7C5CD6", 3) }}>
          {won ? "🎉 Bravo ! All matched !" : `${done.length} / ${pool.length} matched`}
        </div>
        {won && (
          <Sticker tilt={-1.5} delay={0} bg="#FFD98E" shadow="rgba(214,170,60,.55)" radius={22} pad={0} onClick={reset}>
            <span style={{ display:"block", padding:"9px 24px", fontFamily:"'Baloo 2',cursive", fontWeight:800,
              color:INK, fontSize:"clamp(12px,2.6vw,18px)" }}>🔄 Play again!</span>
          </Sticker>
        )}
      </div>
    </div>
  );
}
 
/* ═══════════════ SLIDES 6–7 · ALPHABET ═══════════════ */
function SlideAlphabet({ set, label, offset }) {
  const [live, setLive] = useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", height:"100%", padding:"16px 10px" }}>
      <BigTitle color="#5BB8E8" size="clamp(21px,4.9vw,38px)">L'Alphabet 🔤</BigTitle>
      <Whisper>{label}</Whisper>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"clamp(6px,1.5vw,12px)", justifyContent:"center",
        flex:1, alignContent:"center", paddingBottom:"7vh", maxWidth:900 }}>
        {set.map((l,i)=>(
          <Sticker key={l.letter} tilt={i%3===0?-3:i%3===1?2:-1} delay={.045*i}
            bg={CANDY[(i+offset)%CANDY.length]} shadow="rgba(140,110,170,.32)" radius={20} pad={9}
            ring={live===i}
            onClick={()=>{ speak(l.pron, .62); setLive(i); setTimeout(()=>setLive(null),820); }}
            style={{ width:"clamp(78px,16.5vw,120px)", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"clamp(21px,4.4vw,34px)",
                ...stickerText(INK, 2.5) }}>{l.letter}</span>
              <span style={{ fontSize:"clamp(17px,3.4vw,27px)",
                animation:`bobble ${2.6+(i%5)*.3}s ease-in-out ${(i%7)*.15}s infinite` }}>{l.emoji}</span>
            </div>
            <div style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:700, color:INK,
              fontSize:"clamp(9px,1.9vw,12.5px)", marginTop:1 }}>{l.word}</div>
            <div style={{ background:"#fff", borderRadius:10, marginTop:4, padding:"1px 6px",
              fontFamily:"'Fredoka',sans-serif", fontStyle:"italic", color:INK, opacity:.8,
              fontSize:"clamp(8px,1.6vw,11px)" }}>“{l.pron}”</div>
          </Sticker>
        ))}
      </div>
    </div>
  );
}
 
/* ═══════════════ SLIDE 8 · FINALE ═══════════════ */
function SlideFinale() {
  const [party, setParty] = useState(false);
  const [singing, setSinging] = useState(false);
  const [beat, setBeat] = useState(-1);
  const timer = useRef(null);
 
  useEffect(() => () => clearInterval(timer.current), []);
 
  const sing = () => {
    if (singing) return;
    setSinging(true);
    let i = 0;
    timer.current = setInterval(() => {
      if (i < ALPHABET.length) { speak(ALPHABET[i].pron, 1.25); setBeat(i); i++; }
      else {
        clearInterval(timer.current); setBeat(-1);
        setTimeout(() => { speak("Félicitations ! Tu es un explorateur de la jungle !"); setParty(true);
          setTimeout(()=>{ setParty(false); setSinging(false); }, 4200); }, 500);
      }
    }, 460);
  };
 
  const cast = ["🐒","🦜","🐯","🦩","🐘","🦁","🐍","🦋","🦓"];
 
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      height:"100%", padding:"18px 14px", position:"relative" }}>
      <Confetti on={party} />
      {Array.from({length:26},(_,i)=>(
        <span key={i} style={{ position:"absolute", top:`${4+Math.random()*38}%`, left:`${Math.random()*100}%`,
          width:3+Math.random()*5, height:3+Math.random()*5, borderRadius:"50%", background:"#FFF6C3",
          animation:`twinkle ${1.1+Math.random()*2}s ease-in-out ${Math.random()*2}s infinite` }} />
      ))}
 
      <BigTitle color="#B07CFF" size="clamp(22px,5.4vw,42px)">🎶 La Chanson de la Jungle</BigTitle>
 
      <div style={{ display:"flex", gap:"clamp(3px,1.2vw,10px)", flexWrap:"wrap", justifyContent:"center", margin:"18px 0" }}>
        {cast.map((e,i)=>(
          <span key={i} style={{ fontSize:"clamp(26px,6.2vw,48px)",
            animation:`wiggleDance ${1.1+i*.09}s ease-in-out ${i*.1}s infinite` }}>{e}</span>
        ))}
      </div>
 
      <Sticker tilt={-1.5} delay={.4} bg="#D4BBFF" shadow="rgba(150,110,220,.55)" radius={26} pad={0}
        onClick={sing} style={{ animation: singing ? undefined : "glowPulse 2.4s ease-in-out infinite" }}>
        <div style={{ padding:"13px 28px", fontFamily:"'Baloo 2',cursive", fontWeight:800, color:"#fff",
          fontSize:"clamp(13px,3.1vw,21px)", textShadow:"0 2px 4px rgba(110,70,180,.5)" }}>
          {singing ? `🎤 ${beat >= 0 ? ALPHABET[beat].letter : "…"}` : "🎤 Sing the French A-B-C!"}
        </div>
      </Sticker>
 
      <Sticker tilt={1.5} delay={.6} bg="#FFB3C7" shadow="rgba(214,110,150,.55)" radius={32} pad={0}
        onClick={()=>{ speak("Félicitations ! Tu es un explorateur de la jungle !"); setParty(true); setTimeout(()=>setParty(false),3400); }}
        style={{ marginTop:18 }}>
        <div style={{ padding:"clamp(14px,2.6vw,22px) clamp(24px,5vw,46px)", textAlign:"center" }}>
          <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"clamp(21px,5vw,38px)",
            color:"#fff", textShadow:"0 3px 0 rgba(214,110,150,.6)" }}>🎉 Félicitations ! 🎉</div>
          <div style={{ fontFamily:"'Fredoka',sans-serif", fontWeight:600, color:"#fff",
            fontSize:"clamp(12px,2.7vw,19px)", marginTop:3, textShadow:"0 2px 0 rgba(214,110,150,.5)" }}>
            You are a Jungle Explorer!
          </div>
        </div>
      </Sticker>
    </div>
  );
}
 
/* ═══════════════ STEPPING-STONE NAV ═══════════════ */
function Trail({ i, n, go }) {
  const icons = ["🌴","🐒","🎨","🎨","🎮","🔤","🔤","🎶"];
  return (
    <div style={{ display:"flex", gap:5, justifyContent:"center", alignItems:"center", flexWrap:"wrap" }}>
      {Array.from({length:n},(_,k)=>(
        <div key={k} onClick={()=>go(k)} role="button" tabIndex={0}
          onKeyDown={e=>(e.key==="Enter") && go(k)}
          style={{
            width: k===i ? 38 : 26, height: 26, borderRadius:14, cursor:"pointer",
            background: k===i ? "#FFD84D" : k < i ? "#A8E6CF" : "rgba(255,255,255,.75)",
            border:"3px solid #fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, boxShadow:"0 3px 0 rgba(140,110,170,.28)",
            transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
            transform: k===i ? "translateY(-3px) scale(1.06)" : "none",
          }}>
          {k === i ? icons[k] : k < i ? "✓" : ""}
        </div>
      ))}
    </div>
  );
}
 
/* ═══════════════ APP ═══════════════ */
export default function JungleFrenchStickerBook() {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const N = 8;
  const touch = useRef(null);
 
  useEffect(() => { window.speechSynthesis.getVoices(); }, []);
 
  const go = useCallback((n) => {
    const t = Math.max(0, Math.min(n, N - 1));
    setDir(t > slide ? 1 : -1);
    window.speechSynthesis.cancel();
    setSlide(t);
  }, [slide]);
 
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(slide + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(slide - 1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slide, go]);
 
  const P = PALETTES[slide];
 
  const body = [
    <SlideTitle />,
    <SlideGuides />,
    <SlideColors set={COLORS.slice(0,3)} />,
    <SlideColors set={COLORS.slice(3,6)} />,
    <SlideGame />,
    <SlideAlphabet set={ALPHABET.slice(0,13)} offset={0} label="Tap a letter to hear it in French  ·  A – M" />,
    <SlideAlphabet set={ALPHABET.slice(13)} offset={5} label="Tap a letter to hear it in French  ·  N – Z" />,
    <SlideFinale />,
  ][slide];
 
  const NavBtn = ({ dis, onClick, children }) => (
    <button onClick={onClick} disabled={dis} style={{
      background: dis ? "rgba(255,255,255,.5)" : "#FFB3C7",
      border:"4px solid #fff", borderRadius:24, padding:"7px 16px",
      fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"clamp(11px,2.2vw,15px)",
      color: dis ? "rgba(74,59,92,.4)" : "#fff",
      textShadow: dis ? "none" : "0 2px 0 rgba(214,110,150,.5)",
      cursor: dis ? "default" : "pointer", boxShadow:"0 5px 0 rgba(140,110,170,.28)",
      transition:"transform .18s cubic-bezier(.34,1.56,.64,1)", whiteSpace:"nowrap",
    }}
      onMouseDown={e => !dis && (e.currentTarget.style.transform = "translateY(4px) scale(.96)")}
      onMouseUp={e => (e.currentTarget.style.transform = "none")}
      onMouseLeave={e => (e.currentTarget.style.transform = "none")}
    >{children}</button>
  );
 
  return (
    <div
      onTouchStart={e => (touch.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        if (touch.current == null) return;
        const d = touch.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 55) go(slide + (d > 0 ? 1 : -1));
        touch.current = null;
      }}
      style={{
        width:"100%", height:"100vh", position:"relative", overflow:"hidden",
        background: P.g, transition:"background 900ms ease",
        display:"flex", flexDirection:"column",
        fontFamily:"'Fredoka', system-ui, sans-serif",
      }}>
      <Keyframes />
      <Sky palette={P} slide={slide} />
 
      <div key={slide} style={{
        flex:1, position:"relative", zIndex:2, overflowY:"auto", display:"flex", flexDirection:"column",
        animation:`slideUpIn .55s cubic-bezier(.34,1.4,.64,1) both`,
      }}>
        {body}
      </div>
 
      <div style={{
        position:"relative", zIndex:3, padding:"8px 12px 12px",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
        background:"rgba(255,255,255,.42)", backdropFilter:"blur(10px)",
        borderTop:"4px solid rgba(255,255,255,.85)",
      }}>
        <NavBtn dis={slide === 0} onClick={() => go(slide - 1)}>← Back</NavBtn>
        <Trail i={slide} n={N} go={go} />
        <NavBtn dis={slide === N - 1} onClick={() => go(slide + 1)}>Next →</NavBtn>
      </div>
    </div>
  );
}
 
