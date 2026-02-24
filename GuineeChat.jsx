import { useState, useEffect, useRef, useCallback } from "react";

const GN_RED    = "#CE1126";
const GN_YELLOW = "#FCD116";
const GN_GREEN  = "#009460";

const CONTACTS = [
  { id:1, name:"Fatoumata Diallo", avatar:"FD", status:"online",  lastSeen:"en ligne",          color:GN_RED,    unread:2  },
  { id:2, name:"Mamadou Bah",      avatar:"MB", status:"offline", lastSeen:"hier à 22:14",       color:GN_GREEN,  unread:0  },
  { id:3, name:"Aissatou Camara",  avatar:"AC", status:"online",  lastSeen:"en ligne",          color:GN_RED,    unread:5  },
  { id:4, name:"Ibrahim Kouyaté",  avatar:"IK", status:"away",    lastSeen:"il y a 5 min",      color:GN_YELLOW, unread:0  },
  { id:5, name:"Mariama Sylla",    avatar:"MS", status:"online",  lastSeen:"en ligne",          color:GN_GREEN,  unread:1  },
  { id:6, name:"Groupe Famille 🏠",avatar:"GF", status:"group",   lastSeen:"groupe · 6 membres", color:GN_RED,   unread:12 },
];
const STATUSES = [
  { id:1, name:"Mamadou Bah",     avatar:"MB", color:GN_GREEN,  time:"Il y a 20 min", seen:false },
  { id:2, name:"Aissatou Camara", avatar:"AC", color:GN_RED,    time:"Il y a 1h",     seen:false },
  { id:3, name:"Ibrahim Kouyaté", avatar:"IK", color:GN_YELLOW, time:"Il y a 2h",     seen:true  },
  { id:4, name:"Mariama Sylla",   avatar:"MS", color:GN_GREEN,  time:"Il y a 3h",     seen:true  },
];
const INIT_MSGS = {
  1:[
    {id:1,text:"Salut ! Comment tu vas ? 😊",sender:"them",time:"10:23",type:"text",status:"read"},
    {id:2,text:"Très bien merci ! Et toi ?",sender:"me",time:"10:25",type:"text",status:"read"},
    {id:3,text:"Super ! T'as vu le match hier ?",sender:"them",time:"10:26",type:"text",status:"read"},
    {id:4,text:"Oui c'était incroyable 🔥",sender:"me",time:"10:28",type:"text",status:"read"},
    {id:5,text:"On se retrouve ce weekend ?",sender:"them",time:"10:30",type:"text",status:"delivered"},
  ],
  2:[
    {id:1,text:"Hey ! Tu m'envoies le doc ?",sender:"them",time:"hier",type:"text",status:"read"},
    {id:2,text:"Bien sûr, je te l'envoie maintenant",sender:"me",time:"hier",type:"text",status:"read"},
  ],
  3:[
    {id:1,text:"Coucou !! 👋",sender:"them",time:"09:00",type:"text",status:"read"},
    {id:2,text:"T'es libre pour déjeuner ?",sender:"them",time:"09:01",type:"text",status:"read"},
    {id:3,text:"Oui je suis dispo à midi !",sender:"me",time:"09:15",type:"text",status:"read"},
    {id:4,text:"Super ! Café du coin ?",sender:"them",time:"09:16",type:"text",status:"read"},
    {id:5,text:"Parfait 😄",sender:"me",time:"09:17",type:"text",status:"read"},
  ],
  4:[],
  5:[{id:1,text:"Bonjour ! J'ai une question",sender:"them",time:"11:45",type:"text",status:"read"}],
  6:[
    {id:1,text:"Maman: On se voit dimanche ?",sender:"them",time:"lun.",type:"text",status:"read"},
    {id:2,text:"Oui bien sûr !",sender:"me",time:"lun.",type:"text",status:"read"},
    {id:3,text:"Papa: Je fais un barbecue 🍖",sender:"them",time:"lun.",type:"text",status:"read"},
  ],
};
const BOT=["Super ! 😄","Ah oui vraiment ?","Haha 😂","C'est trop bien !","Je suis d'accord 👍","Ok je vois !","On en reparlera 😉","Bonne idée !","Merci pour l'info !"];

const Ic = ({ n, s=20, c="currentColor" }) => {
  const M = {
    send:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    srch:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    clip:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
    emo:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    c1:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    c2:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="17 6 9 17 4 12"/><polyline points="23 6 15 17"/></svg>,
    bk:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    more:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    ph:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18C0 .67.27.2.75.07A2 2 0 012.5.04l3 .5a2 2 0 011.7 1.43l.96 3.84a2 2 0 01-.56 1.98L6.09 9A16 16 0 0015 17.91l1.21-1.51a2 2 0 011.98-.56l3.84.96A2 2 0 0124 18.5z"/></svg>,
    vid:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    clk:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    ch:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    pl:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    xx:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    mic:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    stp:   <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
    pla:   <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    usr:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    key:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>,
    eye:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    shd:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    arr:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    msg:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  };
  return M[n]||null;
};

function VoiceMsg({ duration }) {
  const [playing,setPlaying]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const ref=useRef(null);
  const toggle=()=>{
    if(playing){clearInterval(ref.current);setPlaying(false);}
    else{setPlaying(true);setElapsed(0);ref.current=setInterval(()=>setElapsed(p=>{if(p>=duration){clearInterval(ref.current);setPlaying(false);return 0;}return+(p+0.1).toFixed(1);}),100);}
  };
  useEffect(()=>()=>clearInterval(ref.current),[]);
  const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const bars=[4,8,14,10,18,12,8,16,10,6,14,9,16,11,7,13,8,15,10,6];
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:190,padding:"2px 0"}}>
      <button onClick={toggle} style={{width:34,height:34,borderRadius:"50%",border:"none",cursor:"pointer",background:GN_RED,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Ic n={playing?"stp":"pla"} s={13} c="white"/>
      </button>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:2,height:28}}>
        {bars.map((h,i)=><div key={i} style={{width:3,borderRadius:2,background:playing?GN_YELLOW:`${GN_YELLOW}44`,height:`${h}px`,transition:"all 0.15s"}}/>)}
      </div>
      <span style={{color:"#a07070",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{playing?fmt(elapsed):fmt(duration)}</span>
    </div>
  );
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Nunito',sans-serif;background:#0f0202;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:${GN_RED}44;border-radius:10px;}

/* WELCOME */
.wlc{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;position:relative;overflow:hidden;background:linear-gradient(160deg,#1c0202 0%,#080f04 55%,#001208 100%);}
.wlc-gr{position:absolute;width:450px;height:450px;border-radius:50%;background:${GN_RED}16;filter:blur(90px);top:-120px;left:-120px;animation:plsSS 4s ease-in-out infinite;}
.wlc-gg{position:absolute;width:350px;height:350px;border-radius:50%;background:${GN_GREEN}12;filter:blur(70px);bottom:-100px;right:-100px;animation:plsSS 4s ease-in-out infinite 2s;}
@keyframes plsSS{0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}
.wlc-ft{position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,${GN_RED} 33.3%,${GN_YELLOW} 33.3% 66.6%,${GN_GREEN} 66.6%);}
.wlc-fb{position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,${GN_GREEN} 33.3%,${GN_YELLOW} 33.3% 66.6%,${GN_RED} 66.6%);}
.wlc-in{position:relative;z-index:1;text-align:center;width:100%;max-width:380px;}
.wlc-ring{width:130px;height:130px;border-radius:50%;margin:0 auto 18px;padding:3px;background:conic-gradient(${GN_RED} 0%,${GN_YELLOW} 33%,${GN_GREEN} 66%,${GN_RED} 100%);animation:spin 6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.wlc-ri{width:100%;height:100%;border-radius:50%;background:#100202;display:flex;align-items:center;justify-content:center;font-size:56px;}
.wlc-nm{font-size:38px;font-weight:900;letter-spacing:-1px;margin-bottom:2px;background:linear-gradient(100deg,${GN_RED},${GN_YELLOW},${GN_GREEN});-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.wlc-tg{color:#906060;font-size:13px;margin-bottom:26px;font-weight:600;letter-spacing:0.5px;}
.wlc-cd{background:linear-gradient(145deg,#240a0a,#10180a);border:1px solid #3a1212;border-radius:20px;padding:20px 22px;margin-bottom:24px;position:relative;overflow:hidden;}
.wlc-cs{position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,${GN_RED},${GN_YELLOW},${GN_GREEN});}
.wlc-av{width:58px;height:58px;border-radius:50%;margin:0 auto 10px;background:linear-gradient(135deg,${GN_RED},${GN_YELLOW});display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:white;border:3px solid ${GN_YELLOW}55;box-shadow:0 0 24px ${GN_RED}44;}
.wlc-gl{color:${GN_YELLOW};font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
.wlc-gt{color:#f0e0d0;font-size:17px;font-weight:800;line-height:1.4;margin-bottom:4px;}
.wlc-gs{color:#907060;font-size:13px;font-weight:600;}
.wlc-btn{width:100%;padding:15px;border:none;border-radius:14px;cursor:pointer;font-size:15px;font-weight:800;font-family:'Nunito',sans-serif;transition:all 0.2s;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:10px;}
.wlc-bp{background:linear-gradient(135deg,${GN_RED},#a50e1a);color:white;box-shadow:0 4px 20px ${GN_RED}55;}
.wlc-bp:hover{transform:translateY(-2px);box-shadow:0 8px 28px ${GN_RED}77;}
.wlc-bs{background:transparent;color:${GN_GREEN};border:2px solid ${GN_GREEN}44;}
.wlc-bs:hover{background:${GN_GREEN}12;border-color:${GN_GREEN}88;}
.wlc-fts{display:flex;gap:22px;justify-content:center;margin-top:18px;}
.wlc-fi{display:flex;flex-direction:column;align-items:center;gap:4px;}
.wlc-fic{font-size:22px;}
.wlc-flb{color:#806050;font-size:11px;font-weight:700;}

/* AUTH */
.auth{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(160deg,#1c0202 0%,#080f04 55%,#001208 100%);position:relative;overflow:hidden;}
.auth-gr{position:absolute;width:300px;height:300px;border-radius:50%;background:${GN_RED}14;filter:blur(70px);top:-80px;right:-80px;}
.auth-gg{position:absolute;width:250px;height:250px;border-radius:50%;background:${GN_GREEN}10;filter:blur(60px);bottom:-60px;left:-60px;}
.auth-tb{height:5px;background:linear-gradient(90deg,${GN_RED} 33.3%,${GN_YELLOW} 33.3% 66.6%,${GN_GREEN} 66.6%);}
.auth-hd{position:relative;z-index:1;padding:14px 20px;display:flex;align-items:center;gap:12px;}
.auth-bk{width:36px;height:36px;border-radius:50%;background:#2a0808;border:1px solid #3a1010;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#c09080;transition:all 0.2s;}
.auth-bk:hover{background:#3a1010;color:${GN_YELLOW};}
.auth-ht{color:#f0d8d0;font-size:17px;font-weight:800;}
.auth-bd{position:relative;z-index:1;flex:1;padding:16px 24px 40px;display:flex;flex-direction:column;align-items:center;}
.auth-mr{width:68px;height:68px;border-radius:50%;margin:0 auto 14px;padding:3px;background:conic-gradient(${GN_RED},${GN_YELLOW},${GN_GREEN},${GN_RED});}
.auth-mi{width:100%;height:100%;border-radius:50%;background:#100202;display:flex;align-items:center;justify-content:center;font-size:28px;}
.auth-ti{color:#f5e0d0;font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:4px;text-align:center;}
.auth-su{color:#907060;font-size:13px;margin-bottom:22px;text-align:center;line-height:1.6;max-width:320px;}
.auth-ca{width:100%;max-width:420px;background:linear-gradient(145deg,#220808,#0e1808);border:1px solid #3a1010;border-radius:20px;padding:22px;}
.auth-lb{color:#c09080;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;display:block;}
.auth-rw{display:flex;align-items:center;background:#2a0808;border:1.5px solid #3a1010;border-radius:12px;margin-bottom:16px;transition:border-color 0.2s;overflow:hidden;}
.auth-rw:focus-within{border-color:${GN_RED}88;}
.auth-rw.ok{border-color:${GN_GREEN}88;}
.auth-px{display:flex;align-items:center;gap:6px;padding:0 12px;border-right:1px solid #3a1010;color:#f0d0d0;font-size:14px;font-weight:800;white-space:nowrap;height:50px;}
.auth-ip{flex:1;background:none;border:none;outline:none;color:#f0e0d8;font-size:15px;padding:0 14px;height:50px;font-family:'Nunito',sans-serif;font-weight:600;}
.auth-ip::placeholder{color:#704040;font-weight:400;}
.auth-ic{padding:0 12px;color:#704040;display:flex;align-items:center;}
.auth-ey{background:none;border:none;cursor:pointer;padding:0 12px;color:#704040;display:flex;align-items:center;transition:color 0.2s;}
.auth-ey:hover{color:${GN_YELLOW};}
.auth-sb{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:800;font-family:'Nunito',sans-serif;background:linear-gradient(135deg,${GN_RED},#a50e1a);color:white;box-shadow:0 4px 18px ${GN_RED}44;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.auth-sb:hover{transform:translateY(-2px);box-shadow:0 8px 24px ${GN_RED}66;}
.auth-sb:disabled{opacity:0.5;transform:none;cursor:not-allowed;}
.auth-lk{text-align:center;margin-top:14px;color:#907060;font-size:13px;font-weight:600;}
.auth-lk span{color:${GN_GREEN};cursor:pointer;font-weight:800;}
.auth-lk span:hover{text-decoration:underline;}
.auth-nt{background:#1a1a08;border:1px solid ${GN_YELLOW}22;border-radius:10px;padding:11px 13px;margin-bottom:14px;color:#c0a060;font-size:13px;font-weight:600;display:flex;gap:9px;align-items:flex-start;line-height:1.5;}
.auth-er{color:${GN_RED};font-size:13px;font-weight:700;margin-bottom:12px;text-align:center;}

/* OTP */
.otp-boxes{display:flex;gap:9px;justify-content:center;margin-bottom:18px;}
.otp-b{width:46px;height:54px;background:#2a0808;border:2px solid #3a1010;border-radius:11px;text-align:center;font-size:22px;font-weight:900;color:${GN_YELLOW};outline:none;font-family:'Nunito',sans-serif;transition:border-color 0.2s;}
.otp-b:focus{border-color:${GN_RED};}
.otp-b.f{border-color:${GN_GREEN};}
.otp-rs{text-align:center;color:#907060;font-size:13px;margin-bottom:14px;font-weight:600;}
.otp-rs span{color:${GN_RED};cursor:pointer;font-weight:800;}
.sms-prv{background:linear-gradient(135deg,#1a1a08,#081208);border:1px solid ${GN_GREEN}33;border-radius:14px;padding:14px;margin-bottom:18px;position:relative;overflow:hidden;}
.sms-prv::before{content:'SMS';position:absolute;top:8px;right:10px;font-size:10px;font-weight:800;letter-spacing:1px;color:${GN_GREEN};background:${GN_GREEN}22;padding:2px 8px;border-radius:20px;}
.sms-fr{color:#c0e0c0;font-size:12px;font-weight:800;margin-bottom:6px;}
.sms-cd{color:${GN_YELLOW};font-weight:900;font-size:22px;letter-spacing:5px;}
.sms-bdy{color:#e0f0e0;font-size:13px;font-weight:600;line-height:1.6;}

/* MAIN APP */
.app{display:flex;height:100vh;background:#0f0202;font-family:'Nunito',sans-serif;}
.sidebar{width:375px;min-width:375px;background:#120202;display:flex;flex-direction:column;border-right:1px solid #2a0808;}
.sb-h{display:flex;flex-direction:column;}
.sb-f{height:5px;background:linear-gradient(90deg,${GN_RED} 33.3%,${GN_YELLOW} 33.3% 66.6%,${GN_GREEN} 66.6%);}
.sb-hi{padding:10px 16px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#220505,#120202);}
.sb-pr{display:flex;align-items:center;gap:10px;}
.sb-av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:white;background:linear-gradient(135deg,${GN_RED},${GN_YELLOW});box-shadow:0 0 0 2.5px ${GN_YELLOW}44;position:relative;flex-shrink:0;}
.sb-nm{color:#f5e0d0;font-weight:800;font-size:14px;letter-spacing:-0.3px;}
.sb-st{color:${GN_GREEN};font-size:11px;font-weight:700;}
.sdot{width:10px;height:10px;border-radius:50%;border:2px solid #120202;position:absolute;bottom:0;right:0;}
.sdot.online{background:${GN_GREEN};}
.sdot.offline{background:#6a4a4a;}
.sdot.away{background:${GN_YELLOW};}
.awrap{position:relative;}
.tabs{display:flex;background:#1a0404;border-bottom:1px solid #2a0808;}
.tab{flex:1;padding:13px;text-align:center;font-size:12px;font-weight:800;color:#c97a7a;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;letter-spacing:0.5px;text-transform:uppercase;}
.tab.on{color:${GN_YELLOW};border-bottom-color:${GN_YELLOW};}
.tab:hover:not(.on){color:#f0a0a0;background:#200808;}
.sbar{padding:8px 12px;background:#0f0202;}
.si{background:#1e0606;border:1px solid #2a0808;border-radius:9px;display:flex;align-items:center;padding:8px 12px;gap:8px;}
.si input{background:none;border:none;outline:none;color:#f0d0d0;font-size:14px;flex:1;font-family:'Nunito',sans-serif;font-weight:600;}
.si input::placeholder{color:#704040;}
.clist{flex:1;overflow-y:auto;}
.ci{display:flex;align-items:center;padding:11px 16px;cursor:pointer;transition:background 0.15s;gap:12px;border-bottom:1px solid #1e0606;}
.ci:hover{background:#1e0606;}
.ci.on{background:#280808;border-left:3px solid ${GN_RED};}
.cin{flex:1;min-width:0;}
.ctop{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}
.cnm{color:#f0d0d0;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ctm{color:#a07070;font-size:11px;white-space:nowrap;font-weight:600;}
.ctm.unr{color:${GN_YELLOW};font-weight:800;}
.cbt{display:flex;align-items:center;justify-content:space-between;}
.cpv{color:#a07070;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;font-weight:600;}
.ub{background:${GN_GREEN};color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;}
.ava{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:white;flex-shrink:0;}

/* chat */
.ca{flex:1;display:flex;flex-direction:column;background:#0a0404;position:relative;overflow:hidden;}
.cabg{position:absolute;inset:0;opacity:0.025;background-image:repeating-linear-gradient(0deg,transparent,transparent 38px,${GN_RED}55 38px,${GN_RED}55 39px),repeating-linear-gradient(90deg,transparent,transparent 38px,${GN_GREEN}33 38px,${GN_GREEN}33 39px);}
.chd{padding:10px 16px;background:linear-gradient(135deg,#220505,#120202);display:flex;align-items:center;gap:12px;z-index:10;border-bottom:3px solid;border-image:linear-gradient(90deg,${GN_RED},${GN_YELLOW},${GN_GREEN}) 1;}
.chi{flex:1;}
.chn{color:#f5e0d0;font-size:15px;font-weight:800;}
.chs{color:#c09080;font-size:12px;font-weight:600;}
.ib{background:none;border:none;cursor:pointer;color:#c09080;display:flex;align-items:center;justify-content:center;padding:5px;border-radius:50%;transition:all 0.2s;}
.ib:hover{background:#3a1010;color:${GN_YELLOW};}
.msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:2px;position:relative;z-index:1;}
.mr{display:flex;max-width:68%;animation:fi 0.18s ease;}
@keyframes fi{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.mr.me{align-self:flex-end;}
.mr.them{align-self:flex-start;}
.bl{padding:7px 11px 6px;border-radius:9px;max-width:100%;word-break:break-word;}
.bl.me{background:linear-gradient(135deg,#4a0e0e,#300808);border-radius:9px 0 9px 9px;border:1px solid ${GN_RED}33;}
.bl.them{background:#1e0808;border-radius:0 9px 9px 9px;border:1px solid #2a0808;}
.bt{color:#f0e0d8;font-size:14px;line-height:1.5;font-weight:600;}
.bm{display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:2px;}
.btm{color:#c09080;font-size:10px;font-weight:600;}
.ms{color:#a07060;}
.ms.rd{color:${GN_YELLOW};}
.mi{max-width:230px;border-radius:6px;display:block;}
.fb{display:flex;align-items:center;gap:10px;padding:3px 0;}
.fic{width:36px;height:36px;background:${GN_RED};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.fn{color:#f0e0d8;font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fsz{color:#a07070;font-size:11px;}
.typ{display:flex;align-items:center;gap:4px;padding:9px 13px;background:#1e0808;border-radius:8px;align-self:flex-start;margin:3px 0;border:1px solid #2a0808;}
.td{width:7px;height:7px;border-radius:50%;animation:tb 1.4s infinite ease-in-out;}
.td:nth-child(1){background:${GN_RED};}
.td:nth-child(2){background:${GN_YELLOW};animation-delay:0.2s;}
.td:nth-child(3){background:${GN_GREEN};animation-delay:0.4s;}
@keyframes tb{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}
.inp-a{padding:8px 12px;background:#140404;display:flex;align-items:flex-end;gap:8px;z-index:10;border-top:1px solid #2a0808;}
.mi-w{flex:1;background:#1e0606;border-radius:10px;display:flex;align-items:flex-end;padding:8px 12px;gap:8px;border:1px solid #2a0808;}
.mi-w textarea{flex:1;background:none;border:none;outline:none;color:#f0e0d8;font-size:14px;max-height:100px;resize:none;font-family:'Nunito',sans-serif;line-height:1.5;font-weight:600;}
.mi-w textarea::placeholder{color:#a07070;}
.snd{width:46px;height:46px;background:linear-gradient(135deg,${GN_RED},#a50e1a);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;box-shadow:0 2px 10px ${GN_RED}55;}
.snd:hover{transform:scale(1.05);}
.snd:disabled{opacity:0.5;transform:none;}
.mic-b{width:46px;height:46px;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
.mic-b.idle{background:#1e0606;border:1px solid #2a0808;color:#c09080;}
.mic-b.idle:hover{background:#2a0808;color:${GN_YELLOW};}
.mic-b.rec{background:${GN_RED};color:white;animation:rp 1s ease-in-out infinite;}
@keyframes rp{0%{box-shadow:0 0 0 0 ${GN_RED}88;}70%{box-shadow:0 0 0 12px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;position:relative;z-index:1;}
.ef{display:flex;width:72px;height:72px;border-radius:50%;overflow:hidden;border:3px solid #2a0808;}
.et{font-size:26px;font-weight:900;background:linear-gradient(90deg,${GN_RED},${GN_YELLOW},${GN_GREEN});-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.es{color:#907060;font-size:13px;text-align:center;max-width:300px;line-height:1.6;font-weight:600;}
.e2e{display:flex;align-items:center;gap:6px;background:#1a0808;padding:8px 16px;border-radius:8px;color:#c09080;font-size:12px;border:1px solid #2a0808;font-weight:700;}
.ddv{text-align:center;margin:6px 0;}
.ddv span{background:#180808;color:#c09080;font-size:11px;padding:3px 12px;border-radius:8px;font-weight:700;border:1px solid #2a0808;}
.epk{position:absolute;bottom:68px;left:12px;background:#220808;border-radius:12px;padding:10px;display:flex;flex-wrap:wrap;gap:5px;width:268px;z-index:50;box-shadow:0 8px 24px rgba(0,0,0,0.7);animation:fi 0.15s ease;border:1px solid #3a1010;}
.eb{font-size:21px;cursor:pointer;padding:3px;border-radius:6px;transition:background 0.15s;border:none;background:none;}
.eb:hover{background:#3a1010;}
.sgd{padding:10px 16px;overflow-y:auto;flex:1;}
.mys{display:flex;align-items:center;gap:14px;padding:10px 0;cursor:pointer;border-bottom:1px solid #1e0606;}
.myr{width:54px;height:54px;position:relative;}
.myi{width:54px;height:54px;background:#1e0606;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #2a0808;}
.myp{position:absolute;bottom:0;right:0;width:18px;height:18px;background:${GN_GREEN};border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #120202;}
.slb{color:#a07070;font-size:11px;padding:8px 0 3px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;}
.sti{display:flex;align-items:center;gap:14px;padding:9px 0;cursor:pointer;border-bottom:1px solid #1e0606;}
.srg{width:54px;height:54px;border-radius:50%;padding:3px;background:conic-gradient(${GN_RED} 0% 33%,${GN_YELLOW} 33% 66%,${GN_GREEN} 66% 100%);}
.srg.seen{background:conic-gradient(#5a3a3a 0% 100%);}
.sri{width:100%;height:100%;border-radius:50%;border:3px solid #120202;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.stov{position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:100;display:flex;flex-direction:column;}
.stoh{padding:16px;display:flex;align-items:center;gap:10px;}
.stp{height:4px;background:rgba(255,255,255,0.18);border-radius:2px;flex:1;}
.stpf{height:100%;background:linear-gradient(90deg,${GN_RED},${GN_YELLOW},${GN_GREEN});border-radius:2px;animation:stP 5s linear forwards;}
@keyframes stP{from{width:0%;}to{width:100%;}}
.stc{flex:1;display:flex;align-items:center;justify-content:center;font-size:80px;}
@media(max-width:767px){.sidebar{width:100%;min-width:unset;}.sidebar.hide{display:none;}.ca.hide{display:none;}}
`;

export default function GuineeChat() {
  const [screen, setScreen]   = useState("welcome");
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState(["","","","","",""]);
  const [fakeCode]            = useState(()=>String(Math.floor(100000+Math.random()*900000)));
  const [uname, setUname]     = useState("");
  const [pass, setPass]       = useState("");
  const [showP, setShowP]     = useState(false);
  const [lPhone, setLPhone]   = useState("");
  const [lPass, setLPass]     = useState("");
  const [showLP, setShowLP]   = useState(false);
  const [curUser, setCurUser] = useState(null);
  const [users, setUsers]     = useState([]);
  const [err, setErr]         = useState("");

  const [tab, setTab]           = useState("chats");
  const [sel, setSel]           = useState(null);
  const [msgs, setMsgs]         = useState(INIT_MSGS);
  const [inp, setInp]           = useState("");
  const [srch, setSrch]         = useState("");
  const [contacts, setContacts] = useState(CONTACTS);
  const [typing, setTyping]     = useState(false);
  const [stView, setStView]     = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMob, setIsMob]       = useState(window.innerWidth<768);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec]     = useState(0);
  const recRef  = useRef(null);
  const endRef  = useRef(null);
  const inpRef  = useRef(null);
  const fileRef = useRef(null);
  const otpR    = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(()=>{const h=()=>setIsMob(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,sel]);

  const handleOtp=(i,v)=>{if(!/^\d*$/.test(v))return;const n=[...otp];n[i]=v.slice(-1);setOtp(n);if(v&&i<5)otpR[i+1].current?.focus();};
  const handleOtpKey=(i,e)=>{if(e.key==="Backspace"&&!otp[i]&&i>0)otpR[i-1].current?.focus();};
  const otpStr=otp.join("");

  const doRegister=()=>{
    if(otpStr!==fakeCode){setErr("Code SMS incorrect. Réessayez.");return;}
    if(!uname.trim()){setErr("Entrez votre prénom et nom.");return;}
    if(pass.length<6){setErr("Mot de passe minimum 6 caractères.");return;}
    const u={name:uname.trim(),phone:`+224${phone}`,password:pass,avatar:uname.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()};
    setUsers(p=>[...p,u]);setCurUser(u);setScreen("app");
  };
  const doLogin=()=>{
    const u=users.find(u=>u.phone===`+224${lPhone}`&&u.password===lPass);
    if(!u){setErr("Numéro ou mot de passe incorrect.");return;}
    setCurUser(u);setScreen("app");
  };

  const startRec=()=>{setRecording(true);setRecSec(0);recRef.current=setInterval(()=>setRecSec(p=>p+1),1000);};
  const stopRec=()=>{clearInterval(recRef.current);setRecording(false);const d=recSec;setRecSec(0);if(d>0&&sel)sendMsg("",  "voice",{duration:d});};
  const cancelRec=()=>{clearInterval(recRef.current);setRecording(false);setRecSec(0);};

  const sendMsg=useCallback((text,type="text",extra={})=>{
    if(!text&&type==="text")return;if(!sel)return;
    const m={id:Date.now(),text,sender:"me",time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),type,status:"sent",...extra};
    setMsgs(p=>({...p,[sel.id]:[...(p[sel.id]||[]),m]}));setInp("");
    setTimeout(()=>setMsgs(p=>({...p,[sel.id]:p[sel.id].map(x=>x.id===m.id?{...x,status:"delivered"}:x)})),500);
    if(type==="text"){
      setTimeout(()=>setTyping(true),1000);
      setTimeout(()=>{
        setTyping(false);
        const bot={id:Date.now()+1,text:BOT[Math.floor(Math.random()*BOT.length)],sender:"them",time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),type:"text",status:"read"};
        setMsgs(p=>({...p,[sel.id]:[...(p[sel.id]||[]),bot]}));
        setMsgs(p=>({...p,[sel.id]:p[sel.id].map(x=>x.sender==="me"?{...x,status:"read"}:x)}));
      },2500);
    }
  },[sel]);

  const doSend=()=>{if(inp.trim())sendMsg(inp.trim());};
  const doKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend();}};
  const doFile=e=>{const f=e.target.files[0];if(!f)return;const url=URL.createObjectURL(f);sendMsg(f.name,f.type.startsWith("image/")?"image":"file",{url,fileSize:(f.size/1024).toFixed(1)+" KB"});};
  const pickC=c=>{setSel(c);setContacts(p=>p.map(x=>x.id===c.id?{...x,unread:0}:x));setMsgs(p=>({...p,[c.id]:(p[c.id]||[]).map(m=>({...m,status:"read"}))}));};

  const filtered=contacts.filter(c=>c.name.toLowerCase().includes(srch.toLowerCase()));
  const EMOJIS=["😊","😂","❤️","🔥","👍","😍","🎉","😭","🙏","😘","💪","🥰","😎","🤩","👏","✨","💯","🎊","🥳","😄","😆","🤣","😅","😋","😜","🤔","😴","🤗","😏","😒"];
  const MSt=({s})=>s==="read"?<span className="ms rd"><Ic n="c2" s={13} c={GN_YELLOW}/></span>:s==="delivered"?<span className="ms"><Ic n="c2" s={13} c="#a07060"/></span>:<span className="ms"><Ic n="c1" s={13} c="#a07060"/></span>;
  const fmtR=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const showChat=sel!==null;
  const uInit=curUser?curUser.avatar:"IB";
  const uNm=curUser?curUser.name:"Ibrahima Bah";

  // ── WELCOME ──
  if(screen==="welcome")return(<>
    <style>{CSS}</style>
    <div className="wlc">
      <div className="wlc-gr"/><div className="wlc-gg"/>
      <div className="wlc-ft"/><div className="wlc-fb"/>
      <div className="wlc-in">
        <div className="wlc-ring"><div className="wlc-ri">🇬🇳</div></div>
        <div className="wlc-nm">Guinée Chat</div>
        <div className="wlc-tg">🌍 La messagerie de la République de Guinée</div>
        <div className="wlc-cd">
          <div className="wlc-cs"/>
          <div className="wlc-av">IB</div>
          <div className="wlc-gl">🎉 Message de Bienvenue</div>
          <div className="wlc-gt">Ibrahima Bah vous souhaite la bienvenue sur Guinée Chat !</div>
          <div className="wlc-gs">Connectez-vous gratuitement avec vos proches en toute sécurité 🔒</div>
        </div>
        <button className="wlc-btn wlc-bp" onClick={()=>{setErr("");setScreen("register");}}>
          <Ic n="usr" s={18} c="white"/> Créer un compte
        </button>
        <button className="wlc-btn wlc-bs" onClick={()=>{setErr("");setScreen("login");}}>
          <Ic n="key" s={18} c={GN_GREEN}/> J'ai déjà un compte
        </button>
        <div className="wlc-fts">
          <div className="wlc-fi"><div className="wlc-fic">🔒</div><div className="wlc-flb">Chiffré</div></div>
          <div className="wlc-fi"><div className="wlc-fic">📞</div><div className="wlc-flb">Gratuit</div></div>
          <div className="wlc-fi"><div className="wlc-fic">🇬🇳</div><div className="wlc-flb">Guinéen</div></div>
          <div className="wlc-fi"><div className="wlc-fic">🎙️</div><div className="wlc-flb">Vocal</div></div>
        </div>
      </div>
    </div>
  </>);

  // ── REGISTER ──
  if(screen==="register")return(<>
    <style>{CSS}</style>
    <div className="auth">
      <div className="auth-gr"/><div className="auth-gg"/>
      <div className="auth-tb"/>
      <div className="auth-hd">
        <button className="auth-bk" onClick={()=>setScreen("welcome")}><Ic n="bk" s={18} c="#c09080"/></button>
        <span className="auth-ht">🇬🇳 Guinée Chat</span>
      </div>
      <div className="auth-bd">
        <div className="auth-mr"><div className="auth-mi">📱</div></div>
        <div className="auth-ti">Créer votre compte</div>
        <div className="auth-su">Entrez votre numéro de téléphone guinéen. Vous recevrez un code de confirmation par SMS.</div>
        <div className="auth-ca">
          <div className="auth-nt"><span>🇬🇳</span><span>Ibrahima Bah vous souhaite la bienvenue ! Inscrivez-vous avec votre numéro guinéen pour rejoindre la communauté.</span></div>
          <label className="auth-lb">Numéro de téléphone</label>
          <div className={`auth-rw${phone.length>=8?" ok":""}`}>
            <div className="auth-px"><span>🇬🇳</span>&nbsp;+224</div>
            <input className="auth-ip" placeholder="6XX XXX XXX" value={phone} maxLength={9} type="tel"
              onChange={e=>{setPhone(e.target.value.replace(/\D/g,""));setErr("");}}/>
          </div>
          {err&&<div className="auth-er">⚠️ {err}</div>}
          <button className="auth-sb" disabled={phone.length<8} onClick={()=>{setErr("");setScreen("otp");}}>
            <Ic n="msg" s={18} c="white"/> Recevoir le code SMS &nbsp;<Ic n="arr" s={16} c="white"/>
          </button>
        </div>
        <div className="auth-lk">Déjà inscrit ? <span onClick={()=>{setErr("");setScreen("login");}}>Se connecter</span></div>
      </div>
    </div>
  </>);

  // ── OTP ──
  if(screen==="otp")return(<>
    <style>{CSS}</style>
    <div className="auth">
      <div className="auth-gr"/><div className="auth-gg"/>
      <div className="auth-tb"/>
      <div className="auth-hd">
        <button className="auth-bk" onClick={()=>setScreen("register")}><Ic n="bk" s={18} c="#c09080"/></button>
        <span className="auth-ht">Vérification SMS</span>
      </div>
      <div className="auth-bd">
        <div className="auth-mr"><div className="auth-mi">💬</div></div>
        <div className="auth-ti">Code de confirmation</div>
        <div className="auth-su">Un SMS a été envoyé au<br/><strong style={{color:GN_YELLOW}}>+224 {phone}</strong></div>
        <div className="auth-ca">
          {/* SMS simulé */}
          <div className="sms-prv">
            <div className="sms-fr">📲 &nbsp;GUINEE CHAT</div>
            <div className="sms-bdy">
              Votre code de vérification Guinée Chat est :<br/>
              <span className="sms-cd">{fakeCode}</span><br/>
              <span style={{fontSize:12,color:"#a0c0a0"}}>⏱ Valable 10 minutes. Ne partagez pas ce code.</span>
            </div>
          </div>
          <label className="auth-lb">Entrez le code reçu</label>
          <div className="otp-boxes">
            {otp.map((v,i)=>(
              <input key={i} ref={otpR[i]} className={`otp-b${v?" f":""}`} value={v} maxLength={1} type="tel"
                onChange={e=>handleOtp(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)}/>
            ))}
          </div>
          <div className="otp-rs">Pas reçu ? <span onClick={()=>setOtp(["","","","","",""])}>Renvoyer le code</span></div>

          {otpStr.length===6&&<>
            <label className="auth-lb">Prénom et Nom</label>
            <div className={`auth-rw${uname.length>2?" ok":""}`}>
              <span className="auth-ic"><Ic n="usr" s={18} c="#704040"/></span>
              <input className="auth-ip" style={{paddingLeft:0}} placeholder="Ex: Fatoumata Diallo" value={uname}
                onChange={e=>{setUname(e.target.value);setErr("");}}/>
            </div>
            <label className="auth-lb">Mot de passe</label>
            <div className={`auth-rw${pass.length>=6?" ok":""}`}>
              <span className="auth-ic"><Ic n="key" s={18} c="#704040"/></span>
              <input className="auth-ip" style={{paddingLeft:0}} placeholder="Minimum 6 caractères" value={pass}
                type={showP?"text":"password"} onChange={e=>{setPass(e.target.value);setErr("");}}/>
              <button className="auth-ey" onClick={()=>setShowP(p=>!p)}><Ic n="eye" s={16} c={showP?GN_YELLOW:"#704040"}/></button>
            </div>
          </>}
          {err&&<div className="auth-er">⚠️ {err}</div>}
          <button className="auth-sb" disabled={otpStr.length<6||!uname.trim()||pass.length<6} onClick={doRegister}>
            <Ic n="shd" s={18} c="white"/> Créer mon compte
          </button>
        </div>
      </div>
    </div>
  </>);

  // ── LOGIN ──
  if(screen==="login")return(<>
    <style>{CSS}</style>
    <div className="auth">
      <div className="auth-gr"/><div className="auth-gg"/>
      <div className="auth-tb"/>
      <div className="auth-hd">
        <button className="auth-bk" onClick={()=>setScreen("welcome")}><Ic n="bk" s={18} c="#c09080"/></button>
        <span className="auth-ht">🇬🇳 Guinée Chat</span>
      </div>
      <div className="auth-bd">
        <div className="auth-mr"><div className="auth-mi">🔑</div></div>
        <div className="auth-ti">Connexion</div>
        <div className="auth-su">Entrez votre numéro et mot de passe pour vous connecter</div>
        <div className="auth-ca">
          <div className="auth-nt"><span>👋</span><span>Ibrahima Bah est heureux de vous revoir sur Guinée Chat !</span></div>
          <label className="auth-lb">Numéro de téléphone</label>
          <div className={`auth-rw${lPhone.length>=8?" ok":""}`}>
            <div className="auth-px"><span>🇬🇳</span>&nbsp;+224</div>
            <input className="auth-ip" placeholder="6XX XXX XXX" value={lPhone} maxLength={9} type="tel"
              onChange={e=>{setLPhone(e.target.value.replace(/\D/g,""));setErr("");}}/>
          </div>
          <label className="auth-lb">Mot de passe</label>
          <div className={`auth-rw${lPass.length>=6?" ok":""}`}>
            <span className="auth-ic"><Ic n="key" s={18} c="#704040"/></span>
            <input className="auth-ip" style={{paddingLeft:0}} placeholder="Votre mot de passe" value={lPass}
              type={showLP?"text":"password"} onChange={e=>{setLPass(e.target.value);setErr("");}}/>
            <button className="auth-ey" onClick={()=>setShowLP(p=>!p)}><Ic n="eye" s={16} c={showLP?GN_YELLOW:"#704040"}/></button>
          </div>
          {err&&<div className="auth-er">⚠️ {err}</div>}
          <button className="auth-sb" disabled={lPhone.length<8||lPass.length<6} onClick={doLogin}>
            <Ic n="arr" s={18} c="white"/> Se connecter
          </button>
        </div>
        <div className="auth-lk">Pas encore inscrit ? <span onClick={()=>{setErr("");setScreen("register");}}>Créer un compte</span></div>
        <div style={{marginTop:14,background:"#1a1808",border:`1px solid ${GN_YELLOW}22`,borderRadius:10,padding:"10px 14px",color:"#a09060",fontSize:12,fontWeight:600,textAlign:"center",maxWidth:420,width:"100%"}}>
          💡 Pour tester : créez d'abord un compte, puis connectez-vous avec le même numéro.
        </div>
      </div>
    </div>
  </>);

  // ── APP ──
  return(<>
    <style>{CSS}</style>
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar${isMob&&showChat?" hide":""}`}>
        <div className="sb-h">
          <div className="sb-f"/>
          <div className="sb-hi">
            <div className="sb-pr">
              <div style={{position:"relative"}}>
                <div className="ava sb-av">{uInit}</div>
                <div className="sdot online"/>
              </div>
              <div><div className="sb-nm">{uNm}</div><div className="sb-st">● en ligne</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:20}}>🇬🇳</span>
              <button className="ib"><Ic n="more" c="#c09080"/></button>
            </div>
          </div>
        </div>
        <div className="tabs">
          {["chats","status"].map(t=>(
            <div key={t} className={`tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>
              {t==="chats"?"💬 Chats":"🔵 Statuts"}
            </div>
          ))}
        </div>

        {tab==="chats"&&<>
          <div className="sbar"><div className="si"><Ic n="srch" c="#a07070" s={15}/><input placeholder="Rechercher..." value={srch} onChange={e=>setSrch(e.target.value)}/></div></div>
          <div className="clist">
            {filtered.map(c=>(
              <div key={c.id} className={`ci${sel?.id===c.id?" on":""}`} onClick={()=>pickC(c)}>
                <div className="awrap">
                  <div className="ava" style={{width:48,height:48,background:c.color,fontSize:14}}>{c.avatar}</div>
                  {c.status!=="group"&&<div className={`sdot ${c.status}`}/>}
                </div>
                <div className="cin">
                  <div className="ctop">
                    <span className="cnm">{c.name}</span>
                    <span className={`ctm${c.unread>0?" unr":""}`}>{msgs[c.id]?.length>0?msgs[c.id].at(-1).time:""}</span>
                  </div>
                  <div className="cbt">
                    <span className="cpv">{msgs[c.id]?.length>0?(msgs[c.id].at(-1).type==="image"?"📷 Photo":msgs[c.id].at(-1).type==="file"?"📎 Fichier":msgs[c.id].at(-1).type==="voice"?"🎙️ Vocal":msgs[c.id].at(-1).text):"Commencer..."}</span>
                    {c.unread>0&&<div className="ub">{c.unread}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {tab==="status"&&(
          <div className="sgd">
            <div className="mys">
              <div className="myr"><div className="myi"><Ic n="clk" c="#a07070" s={26}/></div><div className="myp"><Ic n="pl" c="white" s={11}/></div></div>
              <div><div style={{color:"#f0d0d0",fontSize:14,fontWeight:700}}>Mon statut</div><div style={{color:"#a07070",fontSize:12,fontWeight:600}}>Appuyer pour ajouter</div></div>
            </div>
            <div className="slb">Récents</div>
            {STATUSES.map(s=>(
              <div key={s.id} className="sti" onClick={()=>setStView(s)}>
                <div className={`srg${s.seen?" seen":""}`}><div className="sri"><div className="ava" style={{width:"100%",height:"100%",background:s.color,fontSize:14,borderRadius:"50%"}}>{s.avatar}</div></div></div>
                <div><div style={{color:"#f0d0d0",fontSize:14,fontWeight:700}}>{s.name}</div><div style={{color:"#a07070",fontSize:12,fontWeight:600}}>{s.time}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat */}
      {showChat?(
        <div className={`ca${isMob&&!showChat?" hide":""}`}>
          <div className="cabg"/>
          <div className="chd">
            {isMob&&<button className="ib" onClick={()=>setSel(null)}><Ic n="bk" c="#c09080"/></button>}
            <div className="ava" style={{width:40,height:40,background:sel.color,fontSize:13}}>{sel.avatar}</div>
            <div className="chi">
              <div className="chn">{sel.name}</div>
              <div className="chs">{typing?<span style={{color:GN_YELLOW}}>en train d'écrire...</span>:sel.lastSeen}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="ib"><Ic n="vid" c="#c09080"/></button>
              <button className="ib"><Ic n="ph" c="#c09080"/></button>
              <button className="ib"><Ic n="more" c="#c09080"/></button>
            </div>
          </div>

          <div className="msgs" onClick={()=>setShowEmoji(false)}>
            <div className="ddv"><span>AUJOURD'HUI</span></div>
            {(msgs[sel.id]||[]).map(m=>(
              <div key={m.id} className={`mr ${m.sender}`}>
                <div className={`bl ${m.sender}`}>
                  {m.type==="image"?(<><img src={m.url} alt="" className="mi"/><div className="bm"><span className="btm">{m.time}</span>{m.sender==="me"&&<MSt s={m.status}/>}</div></>)
                  :m.type==="file"?(<><div className="fb"><div className="fic"><Ic n="clip" c="white" s={15}/></div><div><div className="fn">{m.text}</div><div className="fsz">{m.fileSize}</div></div></div><div className="bm"><span className="btm">{m.time}</span>{m.sender==="me"&&<MSt s={m.status}/>}</div></>)
                  :m.type==="voice"?(<><VoiceMsg duration={m.duration} sender={m.sender}/><div className="bm"><span className="btm">{m.time}</span>{m.sender==="me"&&<MSt s={m.status}/>}</div></>)
                  :(<><span className="bt">{m.text}</span><div className="bm"><span className="btm">{m.time}</span>{m.sender==="me"&&<MSt s={m.status}/>}</div></>)}
                </div>
              </div>
            ))}
            {typing&&<div className="typ"><div className="td"/><div className="td"/><div className="td"/></div>}
            <div ref={endRef}/>
          </div>

          {showEmoji&&(
            <div className="epk">
              {EMOJIS.map(e=><button key={e} className="eb" onClick={()=>{setInp(p=>p+e);setShowEmoji(false);inpRef.current?.focus();}}>{e}</button>)}
            </div>
          )}

          <div className="inp-a">
            <div className="mi-w">
              <button className="ib" onClick={()=>setShowEmoji(v=>!v)}><Ic n="emo" c="#a07070" s={21}/></button>
              {recording?(
                <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>🔴</span>
                  <span style={{color:GN_RED,fontSize:13,fontWeight:800,minWidth:36}}>{fmtR(recSec)}</span>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:2,height:22}}>
                    {Array.from({length:18}).map((_,i)=>(
                      <div key={i} style={{width:3,borderRadius:2,background:`${GN_RED}99`,height:`${6+Math.random()*12}px`}}/>
                    ))}
                  </div>
                  <button onClick={cancelRec} style={{background:"none",border:"none",cursor:"pointer",color:"#c09080",fontSize:12,fontWeight:700}}>Annuler</button>
                </div>
              ):(
                <textarea ref={inpRef} placeholder="Message..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={doKey} rows={1}/>
              )}
              <button className="ib" onClick={()=>fileRef.current?.click()}><Ic n="clip" c="#a07070" s={21}/></button>
              <input ref={fileRef} type="file" style={{display:"none"}} accept="image/*,.pdf,.doc,.docx" onChange={doFile}/>
            </div>
            {inp.trim()?(
              <button className="snd" onClick={doSend}><Ic n="send" c="white" s={18}/></button>
            ):(
              <button className={`mic-b${recording?" rec":" idle"}`} onClick={recording?stopRec:startRec} title={recording?"Envoyer le vocal":"Enregistrer un vocal"}>
                <Ic n={recording?"stp":"mic"} c={recording?"white":"#c09080"} s={20}/>
              </button>
            )}
          </div>
        </div>
      ):(
        <div className={`ca${isMob?" hide":""}`}>
          <div className="cabg"/>
          <div className="empty">
            <div className="ef"><div style={{flex:1,background:GN_RED}}/><div style={{flex:1,background:GN_YELLOW}}/><div style={{flex:1,background:GN_GREEN}}/></div>
            <div className="et">Guinée Chat 🇬🇳</div>
            <div className="es">Sélectionnez une conversation pour commencer à chatter avec vos proches.</div>
            <div className="e2e">🔒 Messages chiffrés de bout en bout</div>
          </div>
        </div>
      )}

      {stView&&(
        <div className="stov" onClick={()=>setStView(null)}>
          <div className="stoh">
            <div className="stp"><div className="stpf" onAnimationEnd={()=>setStView(null)}/></div>
            <button className="ib" style={{marginLeft:10}} onClick={()=>setStView(null)}><Ic n="xx" c="white" s={20}/></button>
          </div>
          <div style={{padding:"6px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div className="ava" style={{width:40,height:40,background:stView.color}}>{stView.avatar}</div>
            <div><div style={{color:"white",fontWeight:700}}>{stView.name}</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>{stView.time}</div></div>
          </div>
          <div className="stc" style={{background:`linear-gradient(135deg,${stView.color}22,#000)`}}>
            {["🌟","✨","🎉","💫","🔥","❤️","😊","🎊","🙌","💪"][stView.id%10]}
          </div>
        </div>
      )}
    </div>
  </>);
}
