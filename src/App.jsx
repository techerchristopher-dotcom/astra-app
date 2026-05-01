import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bg:          "#07040F",
  bgCard:      "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border:      "rgba(124,58,237,0.22)",
  borderGold:  "rgba(245,193,66,0.5)",
  violet:      "#7C3AED",
  violetDeep:  "#3B1878",
  violetLight: "#A78BFA",
  gold:        "#F5C142",
  goldDeep:    "#C49A0A",
  goldLight:   "#FDE68A",
  rose:        "#E8A4C8",
  text:        "#EDE9F6",
  textMuted:   "#7B6FA0",
  textFaint:   "#3E3560",
  success:     "#4ADE80",
  danger:      "#F87171",
};

const FONT_SERIF  = "'Playfair Display', Georgia, serif";
const FONT_BODY   = "'DM Sans', sans-serif";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const SIGNS = [
  { name:"Bélier",    glyph:"♈", emoji:"♈", dates:"21 mars – 19 avr", el:"Feu",   ec:"#FF6B35", planet:"Mars" },
  { name:"Taureau",   glyph:"♉", emoji:"♉", dates:"20 avr – 20 mai",  el:"Terre", ec:"#8BC34A", planet:"Vénus" },
  { name:"Gémeaux",   glyph:"♊", emoji:"♊", dates:"21 mai – 20 juin", el:"Air",   ec:"#64B5F6", planet:"Mercure" },
  { name:"Cancer",    glyph:"♋", emoji:"♋", dates:"21 juin – 22 juil",el:"Eau",   ec:"#7C4DFF", planet:"Lune" },
  { name:"Lion",      glyph:"♌", emoji:"♌", dates:"23 juil – 22 août",el:"Feu",   ec:"#FF6B35", planet:"Soleil" },
  { name:"Vierge",    glyph:"♍", emoji:"♍", dates:"23 août – 22 sep", el:"Terre", ec:"#8BC34A", planet:"Mercure" },
  { name:"Balance",   glyph:"♎", emoji:"♎", dates:"23 sep – 22 oct",  el:"Air",   ec:"#64B5F6", planet:"Vénus" },
  { name:"Scorpion",  glyph:"♏", emoji:"♏", dates:"23 oct – 21 nov",  el:"Eau",   ec:"#7C4DFF", planet:"Pluton" },
  { name:"Sagittaire",glyph:"♐", emoji:"♐", dates:"22 nov – 21 déc",  el:"Feu",   ec:"#FF6B35", planet:"Jupiter" },
  { name:"Capricorne",glyph:"♑", emoji:"♑", dates:"22 déc – 19 jan",  el:"Terre", ec:"#8BC34A", planet:"Saturne" },
  { name:"Verseau",   glyph:"♒", emoji:"♒", dates:"20 jan – 18 fév",  el:"Air",   ec:"#64B5F6", planet:"Uranus" },
  { name:"Poissons",  glyph:"♓", emoji:"♓", dates:"19 fév – 20 mars", el:"Eau",   ec:"#7C4DFF", planet:"Neptune" },
];

const TODAY_FR = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
const TODAY_ISO = new Date().toISOString().split("T")[0];

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;background:#02010A;}
input,textarea,button{font-family:${FONT_BODY};}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.35);border-radius:2px;}

@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.8);}50%{opacity:.9;transform:scale(1.2);}}
@keyframes pulse{0%,100%{transform:scale(1);filter:drop-shadow(0 0 8px ${C.gold});}50%{transform:scale(1.06);filter:drop-shadow(0 0 24px ${C.gold});}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(245,193,66,.25);}50%{box-shadow:0 0 40px rgba(245,193,66,.5);}}
@keyframes barFill{from{width:0;}to{width:var(--w);}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}

.anim-fadeUp{animation:fadeUp .5s ease forwards;}
.anim-fadeIn{animation:fadeIn .4s ease forwards;}
.anim-slide{animation:slideUp .45s cubic-bezier(.2,.8,.3,1) forwards;}

.btn-gold{
  width:100%;background:linear-gradient(135deg,${C.gold},#D4A017);
  border:none;border-radius:50px;padding:16px;
  font-size:15px;font-weight:700;color:#1a0900;cursor:pointer;
  font-family:${FONT_BODY};letter-spacing:.3px;
  box-shadow:0 4px 24px rgba(245,193,66,.35);
  transition:transform .15s,box-shadow .15s;
}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 6px 32px rgba(245,193,66,.5);}
.btn-gold:active{transform:scale(.98);}
.btn-ghost{
  width:100%;background:rgba(255,255,255,.05);
  border:1px solid ${C.border};border-radius:50px;padding:14px;
  font-size:14px;font-weight:500;color:${C.textMuted};cursor:pointer;
  font-family:${FONT_BODY};transition:all .15s;
}
.btn-ghost:hover{border-color:${C.violetLight};color:${C.text};}
.card{
  background:${C.bgCard};border:1px solid ${C.border};
  border-radius:16px;padding:16px;
  transition:border-color .2s;
}
.card:hover{border-color:rgba(124,58,237,.4);}
.premium-badge{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(245,193,66,.15);border:1px solid rgba(245,193,66,.4);
  border-radius:20px;padding:3px 10px;
  font-size:11px;font-weight:700;color:${C.gold};
  font-family:${FONT_BODY};letter-spacing:.5px;
}
.lock-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(245,193,66,.12);border:1px solid rgba(245,193,66,.3);
  border-radius:20px;padding:4px 12px;
  font-size:11px;font-weight:600;color:${C.gold};
  font-family:${FONT_BODY};white-space:nowrap;
}
.progress-bar{
  height:3px;border-radius:2px;
  background:rgba(255,255,255,.08);
  display:flex;gap:4px;
}
.progress-seg{
  flex:1;height:100%;border-radius:2px;
  transition:background .4s;
}
`;

/* ─────────────────────────────────────────────
   STARS BACKGROUND
───────────────────────────────────────────── */
const STARS_DATA = Array.from({length:90},(_,i)=>({
  id:i, x:Math.random()*100, y:Math.random()*100,
  s:Math.random()*1.8+.4,
  delay:Math.random()*5, dur:Math.random()*3+2,
}));

function Stars(){
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {STARS_DATA.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:s.s,height:s.s,borderRadius:"50%",background:"#fff",
          animation:`twinkle ${s.dur}s ${s.delay}s infinite`,
        }}/>
      ))}
      {/* Ambient glows */}
      <div style={{position:"absolute",top:"-20%",left:"30%",width:400,height:400,borderRadius:"50%",background:"rgba(124,58,237,.06)",filter:"blur(80px)"}}/>
      <div style={{position:"absolute",bottom:"10%",right:"20%",width:300,height:300,borderRadius:"50%",background:"rgba(232,164,200,.04)",filter:"blur(60px)"}}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────────── */
function BottomNav({active,go,sign}){
  const tabs=[
    {id:"home",   icon:"✦",    label:"Accueil"},
    {id:"horoscope",icon:"🌙",label:"Horoscope"},
    {id:"chat",   icon:"💬",   label:"Chat"},
    {id:"premium",icon:"⭐",   label:"Premium"},
    {id:"profil", icon: sign?.glyph||"♏", label:"Profil"},
  ];
  return(
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,
      background:"rgba(7,4,15,.92)",backdropFilter:"blur(20px)",
      borderTop:`1px solid ${C.border}`,
      display:"flex",justifyContent:"space-around",
      padding:"10px 0 16px",zIndex:10,
    }}>
      {tabs.map(t=>{
        const on=active===t.id;
        return(
          <button key={t.id} onClick={()=>go(t.id)} style={{
            background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            color:on?C.gold:C.textMuted,
            fontSize:9,fontFamily:FONT_BODY,fontWeight:on?700:400,
            transition:"color .2s",padding:"0 4px",
          }}>
            <span style={{fontSize:on?20:18,transition:"font-size .2s"}}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PHONE SHELL
───────────────────────────────────────────── */
function Phone({children,noNav,active,go,sign}){
  return(
    <div style={{
      width:375,minHeight:700,maxHeight:780,
      background:`linear-gradient(180deg, #0B0518 0%, ${C.bg} 100%)`,
      borderRadius:44,
      border:"2px solid rgba(124,58,237,.35)",
      boxShadow:"0 0 0 1px rgba(124,58,237,.08), 0 40px 100px rgba(0,0,0,.7), 0 0 80px rgba(124,58,237,.08)",
      display:"flex",flexDirection:"column",
      overflow:"hidden",position:"relative",zIndex:1,
    }}>
      {/* Status bar */}
      <div style={{
        padding:"12px 24px 6px",display:"flex",
        justifyContent:"space-between",alignItems:"center",
        fontSize:12,color:C.text,fontFamily:FONT_BODY,flexShrink:0,
      }}>
        <span style={{fontWeight:600}}>
          {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,"0")}
        </span>
        <span style={{fontSize:10,letterSpacing:1}}>▐▐▐ ▲ ▮▮</span>
      </div>

      {/* Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
        {children}
      </div>

      {/* Nav */}
      {!noNav && <BottomNav active={active} go={go} sign={sign}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ONBOARDING — Step 1: Prénom
───────────────────────────────────────────── */
function OnboardPrenom({onNext}){
  const [name,setName]=useState("");
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 24px"}}>
      {/* Progress */}
      <div className="progress-bar" style={{width:"100%",marginBottom:8}}>
        {[0,1,2,3].map(i=>(
          <div key={i} className="progress-seg" style={{background:i===0?C.gold:"rgba(255,255,255,.12)"}}/>
        ))}
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,textAlign:"center"}}>
        <div style={{animation:"pulse 2.5s infinite"}}>
          <span style={{fontSize:40,filter:`drop-shadow(0 0 16px ${C.gold})`}}>✦</span>
        </div>
        <h1 style={{fontFamily:FONT_SERIF,fontSize:36,color:C.gold,letterSpacing:1}}>Astra</h1>
        <div>
          <h2 style={{fontFamily:FONT_SERIF,fontSize:26,color:C.text,marginBottom:8,fontWeight:500}}>
            Comment tu t'appelles&nbsp;?
          </h2>
          <p style={{color:C.textMuted,fontSize:14,fontFamily:FONT_BODY,lineHeight:1.5}}>
            Astra te parle directement — pas à n'importe qui.
          </p>
        </div>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onNext(name.trim())}
          placeholder="Ton prénom"
          autoFocus
          style={{
            width:"100%",background:"rgba(124,58,237,.12)",
            border:`1px solid ${name?C.violetLight:C.border}`,
            borderRadius:16,padding:"16px 20px",
            color:C.text,fontSize:16,fontFamily:FONT_SERIF,
            outline:"none",textAlign:"center",
            transition:"border-color .2s",
          }}
        />
      </div>

      <button className="btn-gold" disabled={!name.trim()} onClick={()=>onNext(name.trim())}
        style={{opacity:name.trim()?1:.45}}>
        Continuer →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ONBOARDING — Step 2: Signe
───────────────────────────────────────────── */
function OnboardSigne({name,onNext}){
  const [sel,setSel]=useState(null);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 16px 24px"}}>
      <div className="progress-bar" style={{marginBottom:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} className="progress-seg" style={{background:i<=1?C.gold:"rgba(255,255,255,.12)"}}/>
        ))}
      </div>

      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{animation:"pulse 2.5s infinite",marginBottom:8}}>
          <span style={{fontSize:28,filter:`drop-shadow(0 0 12px ${C.gold})`}}>✦</span>
        </div>
        <h1 style={{fontFamily:FONT_SERIF,fontSize:26,color:C.gold,marginBottom:12}}>Astra</h1>
        <h2 style={{fontFamily:FONT_SERIF,fontSize:22,color:C.text,marginBottom:4,fontWeight:500}}>
          Ton signe du zodiaque&nbsp;?
        </h2>
        <p style={{color:C.textMuted,fontSize:13,fontFamily:FONT_BODY}}>
          La base de ton profil astral personnel.
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,flex:1,overflowY:"auto"}}>
        {SIGNS.map(s=>{
          const on=sel?.name===s.name;
          return(
            <button key={s.name} onClick={()=>setSel(s)} style={{
              background:on?`rgba(124,58,237,.3)`:C.bgCard,
              border:`1.5px solid ${on?C.violetLight:C.border}`,
              borderRadius:14,padding:"12px 6px",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              transition:"all .15s",
              boxShadow:on?`0 0 16px rgba(124,58,237,.3)`:"none",
            }}>
              <span style={{
                fontSize:22,
                background:`linear-gradient(135deg, ${C.violet}, ${C.violetDeep})`,
                width:40,height:40,borderRadius:10,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`1px solid rgba(124,58,237,.5)`,
              }}>{s.glyph}</span>
              <span style={{
                fontSize:9,fontFamily:FONT_BODY,fontWeight:700,
                color:on?C.violetLight:C.textMuted,
                letterSpacing:.8,
              }}>{s.name.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      <div style={{padding:"12px 0 0",display:"flex",flexDirection:"column",gap:8}}>
        <button className="btn-gold" disabled={!sel} onClick={()=>onNext(sel)}
          style={{opacity:sel?1:.45}}>
          Confirmer mon signe
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ONBOARDING — Step 3: Teaser profil
───────────────────────────────────────────── */
function OnboardTeaser({name,sign,onNext,onSkip}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 24px"}}>
      <div className="progress-bar" style={{width:"100%",marginBottom:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} className="progress-seg" style={{background:i<=2?C.gold:"rgba(255,255,255,.12)"}}/>
        ))}
      </div>

      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{animation:"pulse 2.5s infinite",marginBottom:8}}>
          <span style={{fontSize:28,filter:`drop-shadow(0 0 12px ${C.gold})`}}>✦</span>
        </div>
        <h1 style={{fontFamily:FONT_SERIF,fontSize:26,color:C.gold,marginBottom:12}}>Astra</h1>
      </div>

      <div style={{
        background:"rgba(124,58,237,.1)",border:`1px solid ${C.border}`,
        borderRadius:20,padding:"24px 20px",textAlign:"center",width:"100%",
        animation:"slideUp .5s ease forwards",
      }}>
        {/* Constellation image placeholder */}
        <div style={{
          width:72,height:72,borderRadius:12,margin:"0 auto 16px",
          background:`linear-gradient(135deg, #1a0a3a, #0d0620)`,
          border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:32,
        }}>🌌</div>
        <h2 style={{
          fontFamily:FONT_SERIF,fontSize:20,color:C.text,
          fontStyle:"italic",lineHeight:1.4,marginBottom:16,fontWeight:500,
        }}>
          Ton profil est plus complexe qu'il n'y paraît…
        </h2>
        <p style={{
          color:C.textMuted,fontSize:13,fontFamily:FONT_BODY,lineHeight:1.65,marginBottom:20,
        }}>
          En tant que <span style={{color:C.violetLight,fontWeight:600}}>{sign?.name}</span>, tu portes une énergie particulière — mais ce n'est que la surface.
          Ton ascendant, ta Lune, ta Maison 7… influencent ta journée sans que tu t'en rendes compte.
        </p>
        <div style={{
          background:"rgba(0,0,0,.25)",border:`1px solid ${C.border}`,
          borderRadius:12,padding:"12px 16px",
          display:"flex",alignItems:"center",gap:10,
        }}>
          <span style={{fontSize:18}}>🔒</span>
          <p style={{color:C.textMuted,fontSize:12,fontFamily:FONT_BODY,textAlign:"left",lineHeight:1.4}}>
            Heure et lieu de naissance · débloque ton thème natal complet avec <span style={{color:C.gold}}>Astra Premium</span>
          </p>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",marginTop:16}}>
        <button className="btn-gold" onClick={onNext}>Je veux en savoir plus</button>
        <button className="btn-ghost" onClick={onSkip}>Plus tard</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ONBOARDING — Step 4: Premium upsell
───────────────────────────────────────────── */
function OnboardPremium({onUnlock,onSkip}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 24px"}}>
      <div className="progress-bar" style={{width:"100%",marginBottom:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} className="progress-seg" style={{background:C.gold}}/>
        ))}
      </div>

      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{animation:"pulse 2.5s infinite",marginBottom:6}}>
          <span style={{fontSize:26,filter:`drop-shadow(0 0 12px ${C.gold})`}}>✦</span>
        </div>
        <h1 style={{fontFamily:FONT_SERIF,fontSize:24,color:C.gold}}>Astra</h1>
      </div>

      <div style={{textAlign:"center",width:"100%"}}>
        <h2 style={{fontFamily:FONT_SERIF,fontSize:22,color:C.text,marginBottom:8,fontWeight:500}}>
          Pour aller plus loin…
        </h2>
        <p style={{color:C.textMuted,fontSize:13,fontFamily:FONT_BODY,marginBottom:24,lineHeight:1.5}}>
          Ces données révèlent ton thème natal complet.<br/>Facultatif, mais puissant.
        </p>

        {/* Locked inputs */}
        {["Heure de naissance (ex : 14h30)","Ville de naissance"].map(ph=>(
          <div key={ph} style={{
            background:"rgba(0,0,0,.2)",border:`1px solid ${C.border}`,
            borderRadius:14,padding:"14px 16px",marginBottom:12,
            display:"flex",alignItems:"center",justifyContent:"space-between",
          }}>
            <span style={{color:C.textFaint,fontSize:14,fontFamily:FONT_BODY}}>{ph}</span>
            <span className="lock-badge">🔒 Premium</span>
          </div>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",marginTop:8}}>
        <button className="btn-gold" onClick={onUnlock}>
          Débloquer le thème natal — 4,99€/mois
        </button>
        <button className="btn-ghost" onClick={onSkip}>
          Continuer sans — rester gratuit
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME SCREEN
───────────────────────────────────────────── */
function HomeScreen({name,sign,streak,go,horoscopeData,momentCle}){
  const score = horoscopeData?.score || 7;
  const bars = Array.from({length:7},(_,i)=>i);
  const dayLetters = ["L","M","M","J","V","S","D"];
  const todayIdx = (new Date().getDay()+6)%7;

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <p style={{color:C.textMuted,fontSize:11,fontFamily:FONT_BODY,letterSpacing:1,marginBottom:2}}>{TODAY_FR}</p>
          <h2 style={{fontFamily:FONT_SERIF,fontSize:28,color:C.text,fontWeight:500}}>
            Bonjour, <span style={{color:C.gold}}>✦</span>
          </h2>
          {name && <p style={{color:C.violetLight,fontSize:14,fontFamily:FONT_BODY}}>{name}</p>}
        </div>
        <button onClick={()=>go("premium")} className="premium-badge" style={{cursor:"pointer",border:"none"}}>
          ⭐ Premium
        </button>
      </div>

      {/* Streak */}
      <div className="card" style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🔥</span>
          <div>
            <span style={{fontFamily:FONT_SERIF,fontSize:28,color:C.gold,fontWeight:600}}>{streak}</span>
            <p style={{color:C.textMuted,fontSize:11,fontFamily:FONT_BODY,marginTop:-2}}>jours consécutifs</p>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {dayLetters.map((l,i)=>(
            <div key={i} style={{
              width:24,height:24,borderRadius:6,
              background:i<=todayIdx?"rgba(245,193,66,.2)":"rgba(255,255,255,.04)",
              border:`1px solid ${i<=todayIdx?C.gold:C.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,fontFamily:FONT_BODY,fontWeight:700,
              color:i===todayIdx?C.gold:i<todayIdx?C.goldDeep:C.textFaint,
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Moment clé */}
      <div className="card" style={{
        marginBottom:12,background:"rgba(124,58,237,.12)",
        borderColor:"rgba(124,58,237,.3)",
      }}>
        <p style={{color:C.violetLight,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>
          ● MOMENT CLÉ DU JOUR
        </p>
        <p style={{
          fontFamily:FONT_SERIF,fontSize:16,color:C.text,
          fontStyle:"italic",lineHeight:1.55,
        }}>
          "{momentCle || `Tu ressens un tiraillement intérieur aujourd'hui… et ce n'est pas un hasard. Ton signe traverse une période charnière.`}"
        </p>
      </div>

      {/* Score du jour */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
          <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5}}>SCORE DU JOUR</p>
          <span style={{fontFamily:FONT_SERIF,fontSize:26,color:C.gold,fontWeight:700}}>{score}<span style={{fontSize:14,color:C.textMuted}}>/10</span></span>
        </div>
        <div style={{display:"flex",gap:4}}>
          {bars.map(i=>(
            <div key={i} style={{
              flex:1,height:28,borderRadius:6,
              background:i<score?
                (i===score-1?C.gold:`rgba(124,58,237,${0.4+i*0.05})`)
                :"rgba(255,255,255,.05)",
              transition:`background .3s ${i*50}ms`,
            }}/>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      {[
        {icon:"🌙",title:"Horoscope du jour",sub:`Généré par IA · ${sign?.name||"ton signe"}`,nav:"horoscope",lock:false},
        {icon:"💬",title:"Poser une question",sub:"1 message gratuit disponible",nav:"chat",lock:false},
        {icon:"🪐",title:"Compatibilité avancée",sub:null,nav:"premium",lock:true},
        {icon:"🔮",title:"Thème natal complet",sub:null,nav:"premium",lock:true},
      ].map(a=>(
        <button key={a.title} onClick={()=>go(a.nav)} style={{
          width:"100%",display:"flex",alignItems:"center",gap:14,
          background:C.bgCard,border:`1px solid ${C.border}`,
          borderRadius:14,padding:"14px 16px",marginBottom:8,
          cursor:"pointer",textAlign:"left",transition:"all .15s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,.45)";e.currentTarget.style.background=C.bgCardHover;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bgCard;}}
        >
          <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
          <div style={{flex:1}}>
            <p style={{color:C.text,fontSize:14,fontFamily:FONT_BODY,fontWeight:600,marginBottom:2}}>{a.title}</p>
            {a.sub&&<p style={{color:C.textMuted,fontSize:12,fontFamily:FONT_BODY}}>{a.sub}</p>}
            {a.lock&&<span className="lock-badge" style={{marginTop:4}}>🔒 Premium</span>}
          </div>
          <span style={{color:C.textFaint,fontSize:14}}>›</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOROSCOPE SCREEN
───────────────────────────────────────────── */
function HoroscopeScreen({sign,name,horoscopeData,setHoroscopeData,go}){
  const [status,setStatus]=useState(horoscopeData?"success":"idle");
  const [displayed,setDisplayed]=useState(horoscopeData?{...horoscopeData}:{amour:"",travail:"",energie:"",conseil:""});

  async function generate(){
    if(!sign) return;
    setStatus("loading");
    setDisplayed({amour:"",travail:"",energie:"",conseil:""});
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Tu es Astra, une astrologue IA bienveillante, mystérieuse et légèrement directe. Tu parles exclusivement en français.
RÈGLE : Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après, aucun backtick.
Format : {"amour":"...","travail":"...","energie":"...","conseil":"...","score":7,"momentCle":"..."}
- Chaque section : 2-3 phrases PRÉCISES, jamais vagues. Mentionne des planètes réelles.
- momentCle : 1 phrase percutante, mystérieuse (style "Tu ressens un tiraillement...")
- score : entier 1-10
- Ton : chaleureux mais direct, jamais alarmiste`,
          messages:[{role:"user",content:`Horoscope du jour pour ${name||"l'utilisateur"}, signe ${sign.name}. Date : ${TODAY_FR}.`}],
        }),
      });
      const j=await res.json();
      const txt=j.content?.[0]?.text||"";
      const parsed=JSON.parse(txt.trim());
      setHoroscopeData(parsed);
      setStatus("success");
      // Typewriter
      const fields=["amour","travail","energie","conseil"];
      let fi=0;
      function nextF(){
        if(fi>=fields.length)return;
        const f=fields[fi]; const t=parsed[f]||""; let i=0;
        const iv=setInterval(()=>{
          i++;
          setDisplayed(p=>({...p,[f]:t.slice(0,i)}));
          if(i>=t.length){clearInterval(iv);fi++;setTimeout(nextF,80);}
        },15);
      }
      nextF();
    }catch{setStatus("error");}
  }

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{
          width:44,height:44,borderRadius:12,
          background:`linear-gradient(135deg, ${C.violet}, ${C.violetDeep})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,border:`1px solid rgba(124,58,237,.6)`,
        }}>{sign?.glyph||"♏"}</div>
        <div>
          <h2 style={{fontFamily:FONT_SERIF,fontSize:20,color:C.text,fontWeight:500}}>{sign?.name||"Signe"}</h2>
          <p style={{color:C.textMuted,fontSize:11,fontFamily:FONT_BODY,letterSpacing:.8}}>{TODAY_FR}</p>
        </div>
      </div>

      {status==="idle"&&(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <button onClick={generate} style={{
            background:`rgba(124,58,237,.2)`,border:`1.5px solid ${C.violetLight}`,
            borderRadius:50,padding:"16px 36px",
            fontSize:15,fontWeight:600,color:C.violetLight,
            cursor:"pointer",fontFamily:FONT_BODY,
            boxShadow:`0 0 30px rgba(124,58,237,.25)`,
            transition:"all .2s",
          }}>✨ Générer mon horoscope</button>
        </div>
      )}

      {status==="loading"&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontSize:40,marginBottom:16,animation:"spin 3s linear infinite",display:"inline-block"}}>✦</div>
          <p style={{color:C.textMuted,fontFamily:FONT_BODY,fontSize:13}}>Consultation des astres…</p>
        </div>
      )}

      {status==="error"&&(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <p style={{color:C.danger,fontFamily:FONT_BODY,marginBottom:16}}>Erreur de connexion aux astres</p>
          <button onClick={generate} className="btn-ghost" style={{width:"auto",padding:"12px 28px"}}>Réessayer</button>
        </div>
      )}

      {status==="success"&&(
        <>
          {[
            {key:"amour",icon:"❤️",label:"Amour"},
            {key:"travail",icon:"💼",label:"Travail"},
            {key:"energie",icon:"✨",label:"Énergie"},
          ].map(c=>(
            <div key={c.key} className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <span style={{fontSize:14}}>{c.icon}</span>
                <span style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5}}>{c.label.toUpperCase()}</span>
              </div>
              <p style={{color:C.text,fontSize:14,fontFamily:FONT_BODY,lineHeight:1.65,minHeight:36}}>{displayed[c.key]}</p>
            </div>
          ))}

          {/* Locked premium section */}
          <div className="card" style={{marginBottom:10,position:"relative",overflow:"hidden"}}>
            <div style={{filter:"blur(4px)",pointerEvents:"none",userSelect:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <span>🪐</span>
                <span style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5}}>ASCENDANT</span>
              </div>
              <p style={{color:C.textMuted,fontSize:14,fontFamily:FONT_BODY,lineHeight:1.6}}>
                Ton ascendant influence fortement ta manière d'aborder les défis de cette journée. La conjonction avec ta Maison 7 crée une dynamique particulière.
              </p>
            </div>
            <div style={{
              position:"absolute",inset:0,display:"flex",
              alignItems:"center",justifyContent:"center",
              background:"rgba(7,4,15,.6)",backdropFilter:"blur(1px)",
            }}>
              <button onClick={()=>go("premium")} className="lock-badge" style={{cursor:"pointer",fontSize:12,padding:"8px 16px"}}>
                🔒 Ton ascendant influence ta journée — Débloquer
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="card" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
              <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5}}>SCORE DU JOUR</p>
              <span style={{fontFamily:FONT_SERIF,fontSize:24,color:C.gold,fontWeight:700}}>
                {horoscopeData?.score||7}<span style={{fontSize:13,color:C.textMuted}}>/10</span>
              </span>
            </div>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:50,height:6,overflow:"hidden",marginBottom:10}}>
              <div style={{
                height:"100%",borderRadius:50,
                background:`linear-gradient(90deg, ${C.violet}, ${C.gold})`,
                width:`${((horoscopeData?.score||7)/10)*100}%`,
                transition:"width 1.5s ease",
              }}/>
            </div>
            {displayed.conseil&&(
              <p style={{color:C.goldLight,fontSize:13,fontStyle:"italic",fontFamily:FONT_SERIF,lineHeight:1.5}}>
                💫 {displayed.conseil}
              </p>
            )}
          </div>

          <button onClick={()=>go("chat")} className="btn-ghost">
            💬 Poser une question à Astra
          </button>
          <button onClick={generate} style={{
            width:"100%",background:"none",border:"none",
            color:C.textFaint,fontSize:12,fontFamily:FONT_BODY,
            cursor:"pointer",padding:"10px",marginTop:4,
          }}>↺ Régénérer</button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAT SCREEN
───────────────────────────────────────────── */
function ChatScreen({sign,name,go}){
  const [msgs,setMsgs]=useState([
    {role:"assistant",content:`Bonjour ✨ Je suis là. Qu'est-ce qui te pèse ou te questionne aujourd'hui ?`}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [typing,setTyping]=useState("");
  const [freeUsed,setFreeUsed]=useState(0);
  const FREE_LIMIT=1;
  const bottomRef=useRef(null);
  const [showSuggestions,setShowSuggestions]=useState(true);

  const SUGGESTIONS=[
    "Cette semaine propice pour changer de job ?",
    "Suis-je compatible avec un Scorpion ?",
    "Mon avenir amoureux ce mois-ci ?",
  ];

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);

  async function send(text){
    if(!text.trim()||loading) return;
    if(freeUsed>=FREE_LIMIT){go("premium");return;}
    setShowSuggestions(false);
    const userMsg={role:"user",content:text};
    const hist=[...msgs,userMsg];
    setMsgs(hist);
    setInput("");
    setLoading(true);
    setFreeUsed(f=>f+1);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Tu es Astra, une astrologue IA francophone, mystérieuse, bienveillante et légèrement directe.
${sign?`L'utilisateur est ${sign.name}.`:""} Nous sommes le ${TODAY_FR}.
Réponds en français. Maximum 100 mots. Direct et personnel. Commence par une phrase d'accroche liée à son signe.
Style : émotionnellement intelligent, jamais banal, jamais vague.`,
          messages:hist.map(m=>({role:m.role,content:m.content})),
        }),
      });
      const j=await res.json();
      const reply=j.content?.[0]?.text||"Les astres sont silencieux…";
      let i=0; setTyping("");
      const iv=setInterval(()=>{
        i++;setTyping(reply.slice(0,i));
        if(i>=reply.length){
          clearInterval(iv);
          setMsgs(p=>[...p,{role:"assistant",content:reply}]);
          setTyping(""); setLoading(false);
        }
      },18);
    }catch{
      setMsgs(p=>[...p,{role:"assistant",content:"Une erreur s'est produite. Réessaie ✦"}]);
      setLoading(false);
    }
  }

  const remaining=FREE_LIMIT-freeUsed;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{
        padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:38,height:38,borderRadius:"50%",
            background:`linear-gradient(135deg,${C.violet},${C.violetDeep})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,boxShadow:`0 0 12px rgba(124,58,237,.5)`,
          }}>✦</div>
          <div>
            <p style={{color:C.text,fontFamily:FONT_BODY,fontSize:15,fontWeight:600}}>Astra IA</p>
            <p style={{color:C.success,fontSize:11,fontFamily:FONT_BODY}}>● En ligne</p>
          </div>
        </div>
        {remaining>0?(
          <div style={{
            background:"rgba(245,193,66,.15)",border:`1px solid rgba(245,193,66,.4)`,
            borderRadius:20,padding:"4px 10px",
            fontSize:11,fontFamily:FONT_BODY,fontWeight:600,color:C.gold,
          }}>{remaining} message gratuit</div>
        ):(
          <button onClick={()=>go("premium")} className="premium-badge" style={{cursor:"pointer",border:"none"}}>
            ⭐ Débloquer
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 0",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{
            display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",
            gap:8,alignItems:"flex-end",animation:"fadeIn .3s ease",
          }}>
            {m.role==="assistant"&&(
              <div style={{
                width:26,height:26,borderRadius:"50%",flexShrink:0,
                background:`linear-gradient(135deg,${C.violet},${C.violetDeep})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,
              }}>✦</div>
            )}
            <div style={{
              maxWidth:"80%",padding:"11px 14px",
              background:m.role==="user"
                ?`linear-gradient(135deg,${C.violet},${C.violetDeep})`
                :"rgba(255,255,255,.05)",
              border:m.role==="assistant"?`1px solid ${C.border}`:"none",
              borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
              color:C.text,fontSize:14,lineHeight:1.6,fontFamily:FONT_BODY,
            }}>{m.content}</div>
          </div>
        ))}

        {/* Typing */}
        {typing&&(
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${C.violet},${C.violetDeep})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✦</div>
            <div style={{maxWidth:"80%",padding:"11px 14px",background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:"18px 18px 18px 4px",color:C.text,fontSize:14,lineHeight:1.6,fontFamily:FONT_BODY}}>{typing}</div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions&&msgs.length===1&&(
          <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:4,paddingLeft:34}}>
            {SUGGESTIONS.map(s=>(
              <button key={s} onClick={()=>send(s)} style={{
                background:"rgba(124,58,237,.1)",border:`1px solid ${C.border}`,
                borderRadius:16,padding:"10px 14px",textAlign:"left",
                color:C.text,fontSize:13,fontFamily:FONT_BODY,cursor:"pointer",
                transition:"border-color .15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.violetLight}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
              >{s}</button>
            ))}
          </div>
        )}

        {/* Paywall nudge */}
        {freeUsed>=FREE_LIMIT&&!loading&&(
          <div style={{
            background:"rgba(245,193,66,.08)",border:`1px solid rgba(245,193,66,.3)`,
            borderRadius:14,padding:"14px",textAlign:"center",margin:"8px 0",
          }}>
            <p style={{color:C.gold,fontFamily:FONT_BODY,fontSize:13,marginBottom:10}}>
              Tu veux creuser plus ? ✨
            </p>
            <button onClick={()=>go("premium")} className="btn-gold" style={{padding:"12px",fontSize:13}}>
              Débloquer le chat illimité
            </button>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding:"10px 12px 12px",borderTop:`1px solid ${C.border}`,
        display:"flex",gap:8,alignItems:"center",flexShrink:0,
      }}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send(input)}
          placeholder={freeUsed>=FREE_LIMIT?"Débloquer pour continuer…":"Pose ta question à Astra…"}
          disabled={freeUsed>=FREE_LIMIT}
          style={{
            flex:1,background:"rgba(255,255,255,.05)",
            border:`1px solid ${C.border}`,borderRadius:50,
            padding:"11px 16px",color:C.text,
            fontSize:14,fontFamily:FONT_BODY,outline:"none",
            opacity:freeUsed>=FREE_LIMIT?.5:1,
          }}
        />
        <button onClick={()=>send(input)} disabled={loading||!input.trim()||freeUsed>=FREE_LIMIT} style={{
          width:40,height:40,borderRadius:"50%",flexShrink:0,
          background:loading||!input.trim()||freeUsed>=FREE_LIMIT?"rgba(124,58,237,.2)":`linear-gradient(135deg,${C.gold},${C.goldDeep})`,
          border:"none",cursor:"pointer",fontSize:16,
          color:loading?"transparent":"#1a0900",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"background .2s",
        }}>
          {loading?<div style={{width:14,height:14,border:"2px solid rgba(124,58,237,.6)",borderTopColor:C.violetLight,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>:"➤"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PREMIUM SCREEN
───────────────────────────────────────────── */
function PremiumScreen({sign}){
  const [plan,setPlan]=useState("annuel");
  const features=[
    {icon:"🔮",title:"Thème natal complet",desc:"Ascendant, Lune, Maison 7… révèle qui tu es vraiment, pas juste ton signe."},
    {icon:"💬",title:"Chat IA illimité",desc:"Parle à Astra autant que tu veux. Sans limite. Sans jugement."},
    {icon:"🧿",title:"Analyse émotionnelle profonde",desc:"Comprends pourquoi tu te sens comme ça — chaque jour, pas des platitudes."},
    {icon:"💝",title:"Compatibilité avancée",desc:"Va au-delà du signe solaire. Analyse multi-planètes avec n'importe qui."},
  ];

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
      <h2 style={{fontFamily:FONT_SERIF,fontSize:24,color:C.text,marginBottom:8,fontWeight:500}}>
        Va au fond de qui tu es
      </h2>
      <p style={{color:C.textMuted,fontSize:13,fontFamily:FONT_BODY,lineHeight:1.6,marginBottom:20}}>
        Ton signe solaire n'est que la surface. Astra Premium révèle la totalité de ton profil astral — et pourquoi certaines choses ne font que se répéter dans ta vie.
      </p>

      {features.map(f=>(
        <div key={f.title} className="card" style={{marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
          <span style={{fontSize:24,flexShrink:0}}>{f.icon}</span>
          <div>
            <p style={{color:C.text,fontFamily:FONT_BODY,fontSize:14,fontWeight:700,marginBottom:3}}>{f.title}</p>
            <p style={{color:C.textMuted,fontFamily:FONT_BODY,fontSize:12,lineHeight:1.55}}>{f.desc}</p>
          </div>
        </div>
      ))}

      {/* Plans */}
      <div style={{display:"flex",gap:10,marginBottom:16,marginTop:4}}>
        {[
          {id:"mensuel",label:"MENSUEL",price:"4,99€",sub:"/mois",badge:null},
          {id:"annuel",label:"ANNUEL",price:"3,33€",sub:"/mois · 39,99€/an",badge:"2 mois offerts",extra:"Économise 20%"},
        ].map(p=>(
          <button key={p.id} onClick={()=>setPlan(p.id)} style={{
            flex:1,background:plan===p.id?"rgba(245,193,66,.08)":C.bgCard,
            border:`${plan===p.id?"2px":"1px"} solid ${plan===p.id?C.gold:C.border}`,
            borderRadius:16,padding:"16px 12px",cursor:"pointer",textAlign:"center",
            position:"relative",transition:"all .15s",
          }}>
            {p.badge&&(
              <div style={{
                position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",
                background:C.gold,color:"#1a0900",
                fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20,
                fontFamily:FONT_BODY,whiteSpace:"nowrap",
              }}>{p.badge}</div>
            )}
            <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{p.label}</p>
            <p style={{fontFamily:FONT_SERIF,fontSize:28,color:plan===p.id?C.gold:C.text,fontWeight:700}}>{p.price}<span style={{fontSize:11,color:C.textMuted}}>€</span></p>
            <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,marginTop:2}}>{p.sub.replace("€","")}</p>
            {p.extra&&<p style={{color:C.gold,fontSize:11,fontFamily:FONT_BODY,fontWeight:700,marginTop:4}}>{p.extra}</p>}
          </button>
        ))}
      </div>

      {/* Trust badges */}
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16}}>
        {["🔒 Paiement sécurisé","🔄 Annulable en 2 clics","🚫 Zéro piège"].map(b=>(
          <span key={b} style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY}}>{b}</span>
        ))}
      </div>

      <button className="btn-gold" style={{marginBottom:10}}>
        Commencer à {plan==="annuel"?"3,33":"4,99"}€/mois ✦
      </button>
      <p style={{
        color:C.textFaint,fontSize:10,fontFamily:FONT_BODY,
        textAlign:"center",lineHeight:1.5,
      }}>
        Pas de CB pré-cochée. Pas d'arnaque. Annulable quand tu veux depuis ton profil — en 2 clics, promis.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROFIL SCREEN
───────────────────────────────────────────── */
function ProfilScreen({sign,name,streak,horoscopeCount,avgScore,go}){
  const LOCKED=[
    {label:"Signe ascendant"},
    {label:"Lune natale"},
    {label:"Maison 7"},
    {label:"Planète dominante"},
    {label:"Thème natal PDF"},
  ];

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
      {/* Avatar */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{
          width:80,height:80,borderRadius:"50%",margin:"0 auto 12px",
          background:`linear-gradient(135deg,${C.violet},${C.violetDeep})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:36,border:`2px solid rgba(124,58,237,.6)`,
          boxShadow:`0 0 24px rgba(124,58,237,.3)`,
        }}>{sign?.glyph||"♏"}</div>
        {name&&<p style={{color:C.text,fontFamily:FONT_SERIF,fontSize:18,fontWeight:500,marginBottom:2}}>{name}</p>}
        <p style={{color:C.textMuted,fontSize:13,fontFamily:FONT_BODY}}>
          {sign?.name||"—"} · {sign?.el||"—"}
        </p>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        {[
          {v:streak,l:"STREAK"},
          {v:horoscopeCount,l:"HOROSCOPES"},
          {v:avgScore,l:"SCORE MOY."},
        ].map(s=>(
          <div key={s.l} className="card" style={{flex:1,textAlign:"center"}}>
            <p style={{fontFamily:FONT_SERIF,fontSize:24,color:C.gold,fontWeight:700,marginBottom:2}}>{s.v}</p>
            <p style={{color:C.textMuted,fontSize:9,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Base profile */}
      <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>PROFIL DE BASE · GRATUIT</p>
      <div className="card" style={{marginBottom:16}}>
        {[
          {l:"Signe solaire",v:`${sign?.name||"—"} ${sign?.glyph||""}`},
          {l:"Élément",v:sign?.el||"—"},
          {l:"Planète",v:sign?.planet||"—"},
          {l:"Période",v:sign?.dates||"—"},
        ].map((r,i)=>(
          <div key={r.l} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 0",
            borderTop:i>0?`1px solid ${C.border}`:"none",
          }}>
            <span style={{color:C.textMuted,fontSize:13,fontFamily:FONT_BODY}}>{r.l}</span>
            <span style={{color:C.text,fontSize:13,fontFamily:FONT_BODY,fontWeight:600}}>{r.v}</span>
          </div>
        ))}
      </div>

      {/* Premium profile */}
      <p style={{color:C.textMuted,fontSize:10,fontFamily:FONT_BODY,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>PROFIL COMPLET · PREMIUM</p>
      <div className="card" style={{marginBottom:16}}>
        {LOCKED.map((r,i)=>(
          <div key={r.label} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 0",
            borderTop:i>0?`1px solid ${C.border}`:"none",
          }}>
            <span style={{color:C.textFaint,fontSize:13,fontFamily:FONT_BODY}}>{r.label}</span>
            <button onClick={()=>go("premium")} className="lock-badge" style={{cursor:"pointer",border:"none",fontSize:10}}>
              🔒 Débloquer
            </button>
          </div>
        ))}
      </div>

      <button onClick={()=>go("premium")} className="btn-gold">
        Débloquer mon profil complet ✦
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function AstraApp(){
  // State
  const [onboardStep,setOnboardStep]=useState(0); // 0=prenom,1=signe,2=teaser,3=premium,4=done
  const [name,setName]=useState("");
  const [sign,setSign]=useState(null);
  const [screen,setScreen]=useState("home");
  const [streak]=useState(4);
  const [horoscopeCount]=useState(12);
  const [horoscopeData,setHoroscopeData]=useState(null);

  const avgScore = horoscopeData?.score
    ? parseFloat(((horoscopeData.score*12)/12).toFixed(1))
    : 7.4;

  const momentCle = horoscopeData?.momentCle;

  const inOnboarding = onboardStep < 4;

  function goScreen(s){ setScreen(s); }

  return(
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Full-page wrapper */}
      <div style={{
        minHeight:"100vh",
        background:`radial-gradient(ellipse at 25% 15%, rgba(124,58,237,.12) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 85%, rgba(232,164,200,.07) 0%, transparent 50%),
          linear-gradient(180deg, #0A0418 0%, #02010A 100%)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:"32px 16px",position:"relative",
      }}>
        <Stars/>

        {/* ── ONBOARDING FLOW ── */}
        {inOnboarding&&(
          <Phone noNav>
            {onboardStep===0&&(
              <OnboardPrenom onNext={n=>{setName(n);setOnboardStep(1);}}/>
            )}
            {onboardStep===1&&(
              <OnboardSigne name={name} onNext={s=>{setSign(s);setOnboardStep(2);}}/>
            )}
            {onboardStep===2&&(
              <OnboardTeaser
                name={name} sign={sign}
                onNext={()=>setOnboardStep(3)}
                onSkip={()=>setOnboardStep(4)}
              />
            )}
            {onboardStep===3&&(
              <OnboardPremium
                onUnlock={()=>setOnboardStep(4)}
                onSkip={()=>setOnboardStep(4)}
              />
            )}
          </Phone>
        )}

        {/* ── MAIN APP ── */}
        {!inOnboarding&&(
          <Phone active={screen} go={goScreen} sign={sign}>
            {screen==="home"&&(
              <HomeScreen
                name={name} sign={sign} streak={streak}
                go={goScreen} horoscopeData={horoscopeData}
                momentCle={momentCle}
              />
            )}
            {screen==="horoscope"&&(
              <HoroscopeScreen
                sign={sign} name={name}
                horoscopeData={horoscopeData}
                setHoroscopeData={setHoroscopeData}
                go={goScreen}
              />
            )}
            {screen==="chat"&&(
              <ChatScreen sign={sign} name={name} go={goScreen}/>
            )}
            {screen==="premium"&&(
              <PremiumScreen sign={sign}/>
            )}
            {screen==="profil"&&(
              <ProfilScreen
                sign={sign} name={name} streak={streak}
                horoscopeCount={horoscopeCount} avgScore={avgScore}
                go={goScreen}
              />
            )}
          </Phone>
        )}
      </div>
    </>
  );
}
