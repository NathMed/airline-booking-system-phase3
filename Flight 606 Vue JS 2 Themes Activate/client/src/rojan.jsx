import { useState } from "react";

const BLUE = {
  primary:   "#1565c0",
  hover:     "#0d47a1",
  light:     "#e8f0fe",
  lighter:   "#f0f4ff",
  ring:      "rgba(21,101,192,0.2)",
  mid:       "#2979ff",
  accent:    "#448aff",
};

const COLORS = {
  bg:        "#f8faff",
  surface:   "#ffffff",
  surfaceAlt:"#f1f5ff",
  border:    "#dce5f5",
  text:      "#0d1b2e",
  muted:     "#5c6e8a",
  hint:      "#9aaec5",
  navH:      56,
  sideW:     240,
  sideMini:  72,
};

const PAGES = ["home","login","register","post"];

const MOCK_POSTS = [
  { id:1, title:"Classic Beef Kare-Kare", author:"RojanChef", time:90, tags:["Filipino","Stew"], diff:"Intermediate", emoji:"🥜", comments:24, date:"Jun 10" },
  { id:2, title:"Adobo Chicken Supreme", author:"MayaEats",  time:45, tags:["Filipino","Quick Meal"], diff:"Beginner",     emoji:"🍗", comments:18, date:"Jun 8"  },
  { id:3, title:"Sinigang na Hipon",     author:"TastyRojan",time:60, tags:["Soup","Seafood"],    diff:"Beginner",     emoji:"🍤", comments:31, date:"Jun 6"  },
  { id:4, title:"Lechon Kawali Crispy",  author:"RojanChef", time:120,tags:["Pork","Crispy"],     diff:"Advanced",     emoji:"🐷", comments:41, date:"Jun 4"  },
  { id:5, title:"Lumpia Shanghai",       author:"FilChef",   time:30, tags:["Snack","Fried"],     diff:"Beginner",     emoji:"🥟", comments:55, date:"Jun 2"  },
  { id:6, title:"Pancit Canton Fiesta",  author:"MayaEats",  time:25, tags:["Noodles","Quick Meal"],diff:"Beginner",   emoji:"🍜", comments:22, date:"May 30" },
  { id:7, title:"Tinola Manok",          author:"TastyRojan",time:50, tags:["Soup","Chicken"],    diff:"Beginner",     emoji:"🍲", comments:17, date:"May 28" },
  { id:8, title:"Laing Taro Leaves",     author:"RojanChef", time:75, tags:["Vegetarian","Bicol"],diff:"Intermediate", emoji:"🥬", comments:29, date:"May 25" },
];

const CHIPS = ["All","Filipino","Breakfast","Soup","Seafood","Vegetarian","Quick Meal","Beginner","Advanced"];

const diffStyle = (d) => ({
  Beginner:    {bg:"#e8f5e9",color:"#2e7d32"},
  Intermediate:{bg:"#fff3e0",color:"#e65100"},
  Advanced:    {bg:"#fce4ec",color:"#c62828"},
  "Pro Chef":  {bg:"#ede7f6",color:"#4527a0"},
}[d] || {bg:"#f5f5f5",color:"#616161"});

const avatarColors = ["#1565c0","#2e7d32","#e65100","#4527a0","#00838f","#1565c0","#558b2f"];
const avatarColor  = (name) => avatarColors[(name?.charCodeAt(0)||0) % avatarColors.length];

function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <svg width={30} height={30} viewBox="0 0 30 30" fill="none">
        <rect width={30} height={30} rx={8} fill={BLUE.primary}/>
        <path d="M10 8h10a4 4 0 010 8H10V8z" fill="white" opacity={0.9}/>
        <circle cx={10} cy={22} r={3} fill="white" opacity={0.7}/>
        <circle cx={17} cy={22} r={3} fill="white" opacity={0.5}/>
      </svg>
      <span style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:18,color:COLORS.text,letterSpacing:"-0.02em",whiteSpace:"nowrap"}}>
        Rojan <span style={{color:BLUE.primary}}>Cuisines</span>
      </span>
    </div>
  );
}

function NavBar({page,setPage,dark,setDark,search,setSearch}) {
  const [menu,setMenu] = useState(false);
  return (
    <header style={{
      position:"fixed",top:0,left:0,right:0,height:COLORS.navH,
      background:COLORS.surface,borderBottom:`1px solid ${COLORS.border}`,
      display:"flex",alignItems:"center",padding:"0 16px",zIndex:100,gap:12,
    }}>
      <button style={{background:"none",border:"none",cursor:"pointer",padding:6,color:COLORS.muted,borderRadius:6}}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1={3} y1={6} x2={21} y2={6}/><line x1={3} y1={12} x2={21} y2={12}/><line x1={3} y1={18} x2={21} y2={18}/>
        </svg>
      </button>

      <div style={{cursor:"pointer"}} onClick={()=>setPage("home")}><Logo/></div>

      {/* Search bar */}
      <div style={{
        flex:1,maxWidth:560,display:"flex",alignItems:"center",
        border:`1.5px solid ${COLORS.border}`,borderRadius:40,overflow:"hidden",
        background:COLORS.bg,transition:"border-color .15s",margin:"0 16px",
        outline:"none",
      }}
        onFocus={e=>e.currentTarget.style.borderColor=BLUE.primary}
        onBlur={e=>e.currentTarget.style.borderColor=COLORS.border}
      >
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search recipes, cuisines, ingredients..."
          style={{flex:1,border:"none",outline:"none",background:"transparent",color:COLORS.text,fontSize:15,padding:"6px 16px"}}
        />
        <button style={{padding:"6px 18px",background:COLORS.surfaceAlt,border:"none",borderLeft:`1px solid ${COLORS.border}`,cursor:"pointer",color:COLORS.muted}}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx={11} cy={11} r={8}/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
        <button onClick={()=>setDark(!dark)} style={{background:"none",border:"none",cursor:"pointer",padding:6,color:COLORS.muted,borderRadius:6}}>
          {dark
            ? <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={5}/><line x1={12} y1={1} x2={12} y2={3}/><line x1={12} y1={21} x2={12} y2={23}/><line x1={4.22} y1={4.22} x2={5.64} y2={5.64}/><line x1={18.36} y1={18.36} x2={19.78} y2={19.78}/><line x1={1} y1={12} x2={3} y2={12}/><line x1={21} y1={12} x2={23} y2={12}/><line x1={4.22} y1={19.78} x2={5.64} y2={18.36}/><line x1={18.36} y1={5.64} x2={19.78} y2={4.22}/></svg>
            : <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <button onClick={()=>setPage("login")} style={{padding:"6px 14px",border:`1.5px solid ${COLORS.border}`,borderRadius:8,background:"none",cursor:"pointer",color:COLORS.text,fontSize:13,fontWeight:500}}>
          Sign in
        </button>
        <button onClick={()=>setPage("register")} style={{padding:"6px 16px",border:"none",borderRadius:8,background:BLUE.primary,cursor:"pointer",color:"#fff",fontSize:13,fontWeight:600}}>
          Join Free
        </button>
      </div>
    </header>
  );
}

function Sidebar({setPage,activeChip,setActiveChip}) {
  const navItems = [
    {icon:"🏠",label:"Home",action:()=>setPage("home")},
    {icon:"🔥",label:"Trending",action:()=>{}},
    {icon:"⭐",label:"Subscriptions",action:()=>{}},
    {icon:"📚",label:"My Recipes",action:()=>{}},
    {icon:"🔖",label:"Saved",action:()=>{}},
    {icon:"📜",label:"History",action:()=>{}},
  ];
  const cats = ["Filipino","Breakfast","Lunch","Dinner","Soup","Seafood","Vegan","Quick Meal","Dessert","Italian","Asian","Pasta"];
  return (
    <nav style={{
      position:"fixed",top:COLORS.navH,left:0,bottom:0,width:COLORS.sideW,
      background:COLORS.surface,borderRight:`1px solid ${COLORS.border}`,
      overflowY:"auto",zIndex:50,paddingTop:12,
    }}>
      {navItems.map(n=>(
        <button key={n.label} onClick={n.action} style={{
          display:"flex",alignItems:"center",gap:12,width:"100%",
          padding:"10px 16px",border:"none",background:"none",cursor:"pointer",
          color:COLORS.text,fontSize:14,borderRadius:10,margin:"1px 8px",
          width:"calc(100% - 16px)",
        }}
          onMouseEnter={e=>e.currentTarget.style.background=COLORS.surfaceAlt}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
        >
          <span style={{fontSize:18}}>{n.icon}</span>
          <span style={{fontWeight:500}}>{n.label}</span>
        </button>
      ))}
      <div style={{borderTop:`1px solid ${COLORS.border}`,margin:"12px 16px",paddingTop:12}}>
        <p style={{fontSize:11,fontWeight:600,color:COLORS.hint,letterSpacing:"0.06em",textTransform:"uppercase",padding:"0 4px 8px"}}>Categories</p>
        {cats.map(c=>(
          <button key={c} onClick={()=>setActiveChip(activeChip===c?"":c)} style={{
            display:"block",width:"calc(100% - 8px)",padding:"8px 12px",border:"none",
            borderRadius:8,cursor:"pointer",textAlign:"left",fontSize:13,margin:"1px 4px",
            background:activeChip===c?BLUE.light:"none",
            color:activeChip===c?BLUE.primary:COLORS.muted,
            fontWeight:activeChip===c?600:400,
          }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{borderTop:`1px solid ${COLORS.border}`,margin:"12px 16px",paddingTop:16}}>
        <p style={{fontSize:12,color:COLORS.hint,padding:"0 4px"}}>© 2025 Rojan Cuisines</p>
      </div>
    </nav>
  );
}

function PostCard({post,setPage}) {
  const diff = diffStyle(post.diff);
  return (
    <div onClick={()=>setPage("post")} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {/* 16:9 Thumb */}
      <div style={{
        position:"relative",aspectRatio:"16/9",background:`linear-gradient(135deg,${BLUE.lighter},${BLUE.light})`,
        borderRadius:12,overflow:"hidden",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        <span style={{fontSize:52}}>{post.emoji}</span>
        <span style={{
          position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.8)",color:"#fff",
          fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:5,
        }}>{post.time}m</span>
        <span style={{
          position:"absolute",top:8,left:8,background:diff.bg,color:diff.color,
          fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,textTransform:"uppercase",letterSpacing:"0.05em",
        }}>{post.diff}</span>
      </div>
      {/* Meta */}
      <div style={{display:"flex",gap:10}}>
        <div style={{
          width:36,height:36,borderRadius:"50%",flexShrink:0,
          background:avatarColor(post.author),color:"#fff",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontWeight:700,fontSize:13,
        }}>
          {post.author[0].toUpperCase()}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:"0 0 2px",fontWeight:600,fontSize:14,color:COLORS.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</p>
          <p style={{margin:0,fontSize:12,color:COLORS.muted}}>{post.author}</p>
          <p style={{margin:"2px 0 0",fontSize:12,color:COLORS.hint}}>
            {post.time}m cook · {post.comments} reviews · {post.date}
          </p>
          <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
            {post.tags.slice(0,2).map(t=>(
              <span key={t} style={{fontSize:11,padding:"1px 7px",borderRadius:12,background:BLUE.light,color:BLUE.primary,fontWeight:500}}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({setPage,activeChip,setActiveChip}) {
  const [chip,setChip] = useState("All");
  const filtered = MOCK_POSTS.filter(p=>
    chip==="All" || p.tags.some(t=>t===chip) || p.diff===chip
  );
  return (
    <div>
      {/* Chip row */}
      <div style={{
        position:"sticky",top:COLORS.navH,background:COLORS.surface,
        borderBottom:`1px solid ${COLORS.border}`,padding:"10px 24px",
        display:"flex",gap:8,overflowX:"auto",zIndex:40,
      }}>
        {CHIPS.map(c=>(
          <button key={c} onClick={()=>setChip(c)} style={{
            padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",whiteSpace:"nowrap",
            fontSize:13,fontWeight:chip===c?600:400,transition:"all .15s",
            background:chip===c?BLUE.primary:COLORS.surfaceAlt,
            color:chip===c?"#fff":COLORS.muted,
          }}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{padding:"24px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:24}}>
        {filtered.map(p=><PostCard key={p.id} post={p} setPage={setPage}/>)}
      </div>
    </div>
  );
}

function AuthShell({children}) {
  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:`linear-gradient(135deg, ${BLUE.lighter} 0%, #f8faff 60%, #eef2ff 100%)`,
      padding:24,
    }}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Logo/></div>
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthCard({title,subtitle,children,footer}) {
  return (
    <AuthShell>
      <div style={{
        background:"#fff",borderRadius:16,border:`1px solid ${COLORS.border}`,
        padding:"32px 36px",boxShadow:`0 4px 32px ${BLUE.ring}`,
      }}>
        <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:COLORS.text,fontFamily:"Georgia,serif"}}>{title}</h1>
        <p style={{margin:"0 0 24px",fontSize:14,color:COLORS.muted}}>{subtitle}</p>
        {children}
      </div>
      {footer && <div style={{textAlign:"center",marginTop:20,fontSize:13,color:COLORS.muted}}>{footer}</div>}
    </AuthShell>
  );
}

function AuthInput({label,type="text",value,onChange,trailing}) {
  const [focused,setFocused] = useState(false);
  return (
    <div style={{position:"relative",marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:COLORS.muted,marginBottom:6,letterSpacing:"0.02em"}}>{label}</label>
      <div style={{
        display:"flex",alignItems:"center",
        border:`1.5px solid ${focused?BLUE.primary:COLORS.border}`,
        borderRadius:10,overflow:"hidden",background:"#fff",
        boxShadow:focused?`0 0 0 3px ${BLUE.ring}`:"none",transition:"all .15s",
      }}>
        <input type={type} value={value} onChange={onChange}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{flex:1,border:"none",outline:"none",padding:"10px 14px",fontSize:14,color:COLORS.text,background:"transparent"}}
        />
        {trailing}
      </div>
    </div>
  );
}

function LoginPage({setPage}) {
  const [email,setEmail] = useState("");
  const [pw,setPw] = useState("");
  const [showPw,setShowPw] = useState(false);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");

  const handleLogin = () => {
    if(!email||!pw){setErr("Email and password are required.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{setLoading(false);setPage("home");},900);
  };

  const EyeBtn = () => (
    <button type="button" onClick={()=>setShowPw(!showPw)}
      style={{padding:"8px 12px",background:"none",border:"none",cursor:"pointer",color:COLORS.hint}}>
      {showPw
        ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>
        : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>
      }
    </button>
  );

  return (
    <div style={{marginTop:COLORS.navH}}>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your Rojan Cuisines account"
        footer={<>New here? <button onClick={()=>setPage("register")} style={{background:"none",border:"none",cursor:"pointer",color:BLUE.primary,fontWeight:600,fontSize:13,padding:0}}>Create an account →</button></>}
      >
        {err && (
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#991b1b"}}>
            ⚠ {err}
          </div>
        )}
        <AuthInput label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <AuthInput label="Password" type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} trailing={<EyeBtn/>}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
          <button style={{background:"none",border:"none",cursor:"pointer",color:BLUE.primary,fontSize:13}}>Forgot password?</button>
        </div>
        <button onClick={handleLogin} disabled={loading} style={{
          width:"100%",padding:"11px 0",borderRadius:10,border:"none",cursor:"pointer",
          background:BLUE.primary,color:"#fff",fontSize:15,fontWeight:600,
          opacity:loading?0.75:1,transition:"background .15s",
        }}
          onMouseEnter={e=>!loading&&(e.currentTarget.style.background=BLUE.hover)}
          onMouseLeave={e=>e.currentTarget.style.background=BLUE.primary}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{position:"relative",margin:"20px 0",display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,height:1,background:COLORS.border}}/>
          <span style={{fontSize:12,color:COLORS.hint}}>or</span>
          <div style={{flex:1,height:1,background:COLORS.border}}/>
        </div>

        <button style={{
          width:"100%",padding:"10px 0",borderRadius:10,
          border:`1.5px solid ${COLORS.border}`,cursor:"pointer",
          background:"#fff",color:COLORS.text,fontSize:14,fontWeight:500,
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </AuthCard>
    </div>
  );
}

function StrengthBar({pw}) {
  const score = !pw ? 0 : [pw.length>=6,pw.length>=10,/[A-Z0-9]/.test(pw),/[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ["#e0e0e0","#ef5350","#ffa726","#1565c0","#1565c0"];
  const labels = ["","Weak","Fair","Good","Strong"];
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",gap:4,marginBottom:4}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=score?colors[score]:"#e0e0e0",transition:"background .3s"}}/>
        ))}
      </div>
      <p style={{margin:0,fontSize:12,color:COLORS.hint}}>{labels[score]||"Use at least 6 characters"}</p>
    </div>
  );
}

function RegisterPage({setPage}) {
  const [form,setForm] = useState({username:"",email:"",password:"",bio:""});
  const [showPw,setShowPw] = useState(false);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");
  const upd = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handleReg = () => {
    if(!form.username||!form.email||!form.password){setErr("All required fields must be filled.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{setLoading(false);setPage("home");},900);
  };

  const EyeBtn = () => (
    <button type="button" onClick={()=>setShowPw(!showPw)} style={{padding:"8px 12px",background:"none",border:"none",cursor:"pointer",color:COLORS.hint}}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        {showPw
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8"/><line x1={1} y1={1} x2={23} y2={23}/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></>
        }
      </svg>
    </button>
  );

  return (
    <div style={{marginTop:COLORS.navH}}>
      <AuthCard
        title="Create your account"
        subtitle="Join the Rojan Cuisines community of food storytellers"
        footer={<>Already have an account? <button onClick={()=>setPage("login")} style={{background:"none",border:"none",cursor:"pointer",color:BLUE.primary,fontWeight:600,fontSize:13,padding:0}}>Sign in →</button></>}
      >
        {err && <div style={{display:"flex",alignItems:"center",gap:8,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#991b1b"}}>⚠ {err}</div>}
        <AuthInput label="Username" value={form.username} onChange={upd("username")}/>
        <AuthInput label="Email address" type="email" value={form.email} onChange={upd("email")}/>
        <AuthInput label="Password" type={showPw?"text":"password"} value={form.password} onChange={upd("password")} trailing={<EyeBtn/>}/>
        <StrengthBar pw={form.password}/>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:COLORS.muted,marginBottom:6}}>Bio <span style={{fontWeight:400}}>(optional)</span></label>
          <textarea value={form.bio} onChange={upd("bio")} rows={2} maxLength={200}
            style={{width:"100%",border:`1.5px solid ${COLORS.border}`,borderRadius:10,padding:"10px 14px",fontSize:14,color:COLORS.text,background:"#fff",outline:"none",resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
            placeholder="Tell us about your cooking style…"
          />
          <p style={{margin:"2px 0 0",fontSize:11,color:COLORS.hint,textAlign:"right"}}>{form.bio.length}/200</p>
        </div>
        <button onClick={handleReg} disabled={loading} style={{
          width:"100%",padding:"11px 0",borderRadius:10,border:"none",cursor:"pointer",
          background:BLUE.primary,color:"#fff",fontSize:15,fontWeight:600,
          opacity:loading?0.75:1,
        }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p style={{fontSize:12,color:COLORS.hint,textAlign:"center",marginTop:16,marginBottom:0}}>
          By joining, you agree to our <span style={{color:BLUE.primary,cursor:"pointer"}}>Terms</span> and <span style={{color:BLUE.primary,cursor:"pointer"}}>Privacy Policy</span>.
        </p>
      </AuthCard>
    </div>
  );
}

function PostDetailPage({setPage}) {
  const post = MOCK_POSTS[0];
  const diff = diffStyle(post.diff);
  const [comment,setComment] = useState("");
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:24}}>
      {/* Back */}
      <button onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:COLORS.muted,fontSize:14,marginBottom:20,padding:0}}>
        ← Back to recipes
      </button>

      {/* Hero thumb */}
      <div style={{aspectRatio:"16/9",background:`linear-gradient(135deg,${BLUE.lighter},${BLUE.light})`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,position:"relative"}}>
        <span style={{fontSize:96}}>{post.emoji}</span>
        <span style={{position:"absolute",top:12,left:12,background:diff.bg,color:diff.color,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{post.diff}</span>
        <span style={{position:"absolute",bottom:12,right:12,background:"rgba(0,0,0,0.8)",color:"#fff",fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:6}}>{post.time} min</span>
      </div>

      {/* Title + meta */}
      <h1 style={{margin:"0 0 8px",fontSize:28,fontWeight:700,color:COLORS.text,fontFamily:"Georgia,serif",lineHeight:1.25}}>{post.title}</h1>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:avatarColor(post.author),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>
          {post.author[0]}
        </div>
        <div>
          <p style={{margin:0,fontSize:14,fontWeight:600,color:COLORS.text}}>{post.author}</p>
          <p style={{margin:0,fontSize:12,color:COLORS.muted}}>{post.date} · {post.time}m cook · serves 4</p>
        </div>
        <button style={{marginLeft:"auto",padding:"7px 16px",border:`1.5px solid ${BLUE.primary}`,borderRadius:8,background:"none",cursor:"pointer",color:BLUE.primary,fontSize:13,fontWeight:600}}>
          Subscribe
        </button>
      </div>

      {/* Tags */}
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {post.tags.map(t=>(
          <span key={t} style={{padding:"4px 12px",borderRadius:16,background:BLUE.light,color:BLUE.primary,fontSize:12,fontWeight:600}}>{t}</span>
        ))}
      </div>

      {/* Content */}
      <div style={{fontSize:15,color:COLORS.text,lineHeight:1.75,marginBottom:32}}>
        <p>Kare-Kare is a classic Filipino stew known for its rich, savory peanut-based sauce. This recipe brings together tender braised oxtail, tripe, and a colorful array of vegetables — all simmered until meltingly soft in a golden annatto-tinted broth.</p>
        <p>The secret to an exceptional Kare-Kare lies in patience. Low and slow is the philosophy here: the oxtail needs at least 2 hours to reach that fall-off-the-bone tenderness that defines the dish. Serve always with a generous side of bagoong alamang (fermented shrimp paste) to contrast the richness.</p>
        <h3 style={{fontFamily:"Georgia,serif",color:COLORS.text,marginTop:28}}>Ingredients</h3>
        <ul style={{paddingLeft:20,color:COLORS.muted}}>
          {["2 lbs oxtail, cut into pieces","1 lb banana blossom","1 bunch eggplant","1 cup ground roasted peanuts","3 tbsp annatto seeds","Bagoong alamang for serving","4 cups beef broth","Salt and pepper to taste"].map(i=>(
            <li key={i} style={{marginBottom:6}}>{i}</li>
          ))}
        </ul>
      </div>

      {/* Comments */}
      <div style={{borderTop:`1px solid ${COLORS.border}`,paddingTop:24}}>
        <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700,color:COLORS.text}}>{post.comments} Reviews</h3>
        <div style={{display:"flex",gap:10,marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:BLUE.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>Y</div>
          <div style={{flex:1,border:`1.5px solid ${COLORS.border}`,borderRadius:10,overflow:"hidden",background:"#fff"}}>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience with this recipe…" rows={2}
              style={{width:"100%",border:"none",outline:"none",padding:"10px 14px",fontSize:14,color:COLORS.text,resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
            />
            <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 12px",borderTop:`1px solid ${COLORS.border}`}}>
              <button disabled={!comment} style={{padding:"6px 16px",border:"none",borderRadius:7,background:comment?BLUE.primary:"#e0e0e0",color:comment?"#fff":"#999",cursor:comment?"pointer":"default",fontSize:13,fontWeight:600}}>
                Post Review
              </button>
            </div>
          </div>
        </div>
        {/* Sample comments */}
        {[{name:"MayaEats",text:"Made this last Sunday — incredible flavor depth! The bagoong really ties it together.",date:"Jun 12"},
          {name:"FilChef",text:"Third time making this recipe. I add a bit of toasted garlic to the peanut sauce for extra depth.",date:"Jun 11"}].map(c=>(
          <div key={c.name} style={{display:"flex",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:avatarColor(c.name),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>{c.name[0]}</div>
            <div>
              <p style={{margin:"0 0 4px"}}><strong style={{fontSize:13,color:COLORS.text}}>{c.name}</strong> <span style={{fontSize:12,color:COLORS.hint}}>{c.date}</span></p>
              <p style={{margin:0,fontSize:14,color:COLORS.muted,lineHeight:1.6}}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page,setPage] = useState("home");
  const [dark,setDark] = useState(false);
  const [search,setSearch] = useState("");
  const [activeChip,setActiveChip] = useState("");

  const isAuth = page!=="login"&&page!=="register";

  return (
    <div style={{
      minHeight:"100vh",
      background:dark?"#0d1b2e":COLORS.bg,
      color:dark?"#e8f0fe":COLORS.text,
      fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif",
    }}>
      <NavBar page={page} setPage={setPage} dark={dark} setDark={setDark} search={search} setSearch={setSearch}/>

      {page!=="login"&&page!=="register" && (
        <Sidebar setPage={setPage} activeChip={activeChip} setActiveChip={setActiveChip}/>
      )}

      <main style={{
        marginLeft:(page==="login"||page==="register")?0:COLORS.sideW,
        paddingTop:(page==="login"||page==="register")?0:COLORS.navH,
        minHeight:"100vh",transition:"margin-left .2s",
      }}>
        {page==="home"    && <HomePage setPage={setPage} activeChip={activeChip} setActiveChip={setActiveChip}/>}
        {page==="login"   && <LoginPage setPage={setPage}/>}
        {page==="register"&& <RegisterPage setPage={setPage}/>}
        {page==="post"    && <PostDetailPage setPage={setPage}/>}
      </main>
    </div>
  );
}