import React, { useState, useEffect, useRef } from "react";
 
const SUPA_URL = "https://pvwztyiwpgcxmnctqidh.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3p0eWl3cGdjeG1uY3RxaWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODA1NjgsImV4cCI6MjA5NTM1NjU2OH0.72sT1gXryFSc_ApydLTJLCqOqBgJjgNDy56NpLIgbh8";
const STRIPE_LINK = "https://buy.stripe.com/test_3cI28q8dScMEcmr1By18c00";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CD = "Clash Display, sans-serif";
const ST = "Satoshi, sans-serif";
const COLORS = ["#7c3aed","#2563eb","#4f46e5","#0ea5e9","#8b5cf6","#db2777"];
const SOCIAL_OPTIONS = ["Instagram","Facebook","TikTok","LinkedIn","Twitter/X","YouTube","Pinterest"];
 
async function db(method, table, body, query) {
  const url = SUPA_URL + "/rest/v1/" + table + (query ? "?" + query : "");
  const headers = { "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":"Bearer "+SUPA_KEY, "Prefer":"return=representation" };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if(!res.ok){ const e = await res.text(); throw new Error(e); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}
 
async function uploadFile(file) {
  const ext = file.name.split(".").pop();
  const name = Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
  const res = await fetch(SUPA_URL + "/storage/v1/object/post-images/" + name, {
    method:"POST", headers:{ "apikey":SUPA_KEY, "Authorization":"Bearer "+SUPA_KEY, "Content-Type":file.type }, body:file
  });
  if(!res.ok) throw new Error("Upload failed");
  return SUPA_URL + "/storage/v1/object/public/post-images/" + name;
}
 
async function authSignUp(email, password) {
  const res = await fetch(SUPA_URL+"/auth/v1/signup", { method:"POST", headers:{"Content-Type":"application/json","apikey":SUPA_KEY}, body:JSON.stringify({email,password}) });
  return res.json();
}
async function authSignIn(email, password) {
  const res = await fetch(SUPA_URL+"/auth/v1/token?grant_type=password", { method:"POST", headers:{"Content-Type":"application/json","apikey":SUPA_KEY}, body:JSON.stringify({email,password}) });
  return res.json();
}
 
const inp = { width:"100%", padding:"10px 12px", borderRadius:8, background:"#12122a", border:"1px solid #1e1e35", color:"#e2e8f0", fontFamily:ST, fontSize:14, boxSizing:"border-box" };
const lab = { display:"block", fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em", marginBottom:6 };
const pbtn = { padding:"10px 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff", fontFamily:ST, fontSize:13, fontWeight:600, cursor:"pointer" };
const gbtn = { padding:"9px 16px", borderRadius:10, border:"1px solid #1e1e35", background:"transparent", color:"#94a3b8", fontFamily:ST, fontSize:13, fontWeight:500, cursor:"pointer" };
const chip = (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:99, background:c+"20", color:c, border:"1px solid "+c+"40", fontWeight:500 });
const STATUS = { draft:{label:"Draft",color:"#6b7280"}, pending_approval:{label:"Awaiting Approval",color:"#f59e0b"}, revision_requested:{label:"Revision Requested",color:"#ef4444"}, approved:{label:"Approved",color:"#10b981"} };
 
function Badge({ status }) {
  const m = STATUS[status]||STATUS.draft;
  return <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, color:m.color, background:m.color+"20", border:"1px solid "+m.color+"40", whiteSpace:"nowrap" }}>{m.label}</span>;
}
function Ava({ initials, color, size=40 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,"+color+",#60a5fa)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:CD, fontWeight:700, fontSize:size*0.35, color:"#fff" }}>{initials}</div>;
}
function Spinner() {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}><div style={{ width:32, height:32, border:"3px solid #1e1e35", borderTop:"3px solid #7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /></div>;
}
function Modal({ onClose, title, children, wide }) {
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose(); }} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }}>
      <div style={{ background:"#0d0d1a", border:"1px solid #2d2d4e", borderRadius:18, padding:28, width:"100%", maxWidth:wide?680:460, boxShadow:"0 24px 80px rgba(0,0,0,0.6)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontFamily:CD, fontSize:18, fontWeight:700, color:"#f1f5f9" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", fontSize:22, cursor:"pointer" }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Banner({ status }) {
  if(!status||status.type==="online") return null;
  const cfg = { ooo:{color:"#fbbf24",label:"Out of Office"}, holiday:{color:"#a78bfa",label:"Bank Holiday"}, busy:{color:"#f87171",label:"High Volume"} };
  const c = cfg[status.type]||cfg.ooo;
  return (
    <div style={{ background:c.color+"15", border:"1px solid "+c.color+"40", borderRadius:12, padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontWeight:600, color:c.color, fontSize:13 }}>{c.label}:</span>
      <span style={{ color:"#cbd5e1", fontSize:13 }}>{status.message}</span>
    </div>
  );
}
 
function MediaUpload({ onUploaded, label, multiple }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
 
  async function handleFiles(e) {
    const selected = Array.from(e.target.files);
    if(!selected.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(selected.map(f => uploadFile(f)));
      const newFiles = [...files, ...urls];
      setFiles(newFiles);
      onUploaded(newFiles);
    } catch(err) { alert("Upload failed. Check storage bucket exists in Supabase."); }
    setUploading(false);
  }
  function remove(idx) {
    const updated = files.filter((_,i)=>i!==idx);
    setFiles(updated);
    onUploaded(updated);
  }
 
  return (
    <div>
      {label && <label style={lab}>{label}</label>}
      <div style={{ border:"2px dashed #2d2d4e", borderRadius:10, padding:14, background:"#12122a", cursor:"pointer" }} onClick={()=>ref.current.click()}>
        {uploading ? (
          <div style={{ textAlign:"center", color:"#64748b", fontSize:13 }}>Uploading...</div>
        ) : (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:24, color:"#4b5563", marginBottom:4 }}>+</div>
            <div style={{ fontSize:13, color:"#64748b" }}>{multiple?"Click to upload images or videos (select multiple)":"Click to upload an image or video"}</div>
            <div style={{ fontSize:11, color:"#374151", marginTop:2 }}>JPG, PNG, GIF, MP4, MOV supported</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*,video/*" multiple={multiple} onChange={handleFiles} style={{display:"none"}} />
      {files.length>0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
          {files.map((url,i)=>{
            const isVideo = url.match(/\.(mp4|mov|webm|avi)$/i);
            return (
              <div key={i} style={{ position:"relative", width:80, height:80 }}>
                {isVideo
                  ? <video src={url} style={{ width:80, height:80, objectFit:"cover", borderRadius:8 }} />
                  : <img src={url} alt="" style={{ width:80, height:80, objectFit:"cover", borderRadius:8 }} />
                }
                <button onClick={()=>remove(i)} style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:"#ef4444", border:"none", color:"#fff", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>x</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
 
function MediaGallery({ urls }) {
  if(!urls||urls.length===0) return null;
  const list = typeof urls === "string" ? JSON.parse(urls) : urls;
  if(!list.length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
      {list.map((url,i)=>{
        const isVideo = url.match(/\.(mp4|mov|webm|avi)$/i);
        return isVideo
          ? <video key={i} src={url} controls style={{ maxWidth:"100%", maxHeight:240, borderRadius:10, marginBottom:4 }} />
          : <img key={i} src={url} alt="" style={{ maxHeight:200, maxWidth:"100%", borderRadius:10, objectFit:"cover" }} />;
      })}
    </div>
  );
}
 
function ClientDrive({ clientId, role }) {
  const [link, setLink] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
 
  useEffect(()=>{ if(clientId) load(); },[clientId]);
 
  async function load() {
    setLoading(true);
    try {
      const d = await db("GET","profiles",null,"id=eq."+clientId+"&select=drive_link");
      if(d&&d[0]) setLink(d[0].drive_link||"");
    } catch(e){ console.error("Drive load error:",e); }
    setLoading(false);
  }
  async function save() {
    setSaving(true);
    try { await db("PATCH","profiles",{drive_link:link},"id=eq."+clientId); setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),3000); } catch(e){ alert("Error saving."); }
    setSaving(false);
  }
 
  if(loading) return <Spinner />;
  return (
    <div>
      <h3 style={{fontFamily:CD,fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>Google Drive</h3>
      <p style={{fontSize:13,color:"#64748b",marginBottom:20}}>{role==="client"?"Add your Google Drive folder so our team can access your images and brand assets.":"Client image and asset folder."}</p>
      <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:24}}>
        <label style={lab}>Google Drive Folder Link</label>
        {editing ? (
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <input value={link} onChange={e=>setLink(e.target.value)} style={{...inp,flex:1}} placeholder="https://drive.google.com/drive/folders/..." />
            <button onClick={save} disabled={saving} style={{...pbtn,opacity:saving?0.6:1}}>{saving?"Saving...":"Save"}</button>
            <button onClick={()=>setEditing(false)} style={gbtn}>Cancel</button>
          </div>
        ) : (
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{flex:1,background:"#12122a",borderRadius:8,padding:"10px 12px",border:"1px solid #1e1e35"}}>
              {link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{color:"#a78bfa",fontSize:13,wordBreak:"break-all"}}>{link}</a> : <span style={{color:"#4b5563",fontSize:13}}>No link added yet</span>}
            </div>
            <button onClick={()=>setEditing(true)} style={gbtn}>Edit</button>
          </div>
        )}
        {saved && <p style={{color:"#10b981",fontSize:12,marginTop:4}}>Saved!</p>}
        {link && !editing && <a href={link} target="_blank" rel="noopener noreferrer" style={{...pbtn,display:"inline-block",textDecoration:"none",marginTop:8}}>Open Drive Folder</a>}
        {!link && !editing && <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:12,marginTop:8}}><p style={{color:"#fbbf24",fontSize:13}}>Click Edit to add your Google Drive folder link.</p></div>}
      </div>
    </div>
  );
}
 
function Analytics({ clientId, role }) {
  const [platforms, setPlatforms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editVals, setEditVals] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newPlat, setNewPlat] = useState("");
  const [loading, setLoading] = useState(true);
 
  useEffect(()=>{ load(); },[clientId]);
 
  async function load() {
    setLoading(true);
    try { const d = await db("GET","analytics",null,"client_id=eq."+clientId); setPlatforms(d); if(d.length>0) setSelected(d[0]); } catch(e){}
    setLoading(false);
  }
  async function addPlat() {
    if(!newPlat) return;
    try { await db("POST","analytics",{client_id:clientId,platform:newPlat,month_data:JSON.stringify(Array(12).fill(0))}); setShowAdd(false); setNewPlat(""); load(); } catch(e){ alert("Error."); }
  }
  async function removePlat(id) {
    if(!window.confirm("Remove this platform?")) return;
    try { await db("DELETE","analytics",null,"id=eq."+id); load(); } catch(e){}
  }
  async function saveNums() {
    if(!selected) return;
    try { await db("PATCH","analytics",{month_data:JSON.stringify(MONTHS.map((_,i)=>parseInt(editVals[i])||0))},"id=eq."+selected.id); setEditing(false); load(); } catch(e){ alert("Error."); }
  }
  function startEdit(p) {
    const d = JSON.parse(p.month_data||"[]");
    const v = {}; MONTHS.forEach((_,i)=>{ v[i]=d[i]||0; }); setEditVals(v); setEditing(true);
  }
 
  if(loading) return <Spinner />;
  const selData = selected ? JSON.parse(selected.month_data||"[]") : [];
  const latest = selData[selData.length-1]||0;
  const prev = selData[selData.length-2]||latest;
  const growth = prev ? (((latest-prev)/prev)*100).toFixed(1) : "0.0";
  const total = latest-(selData[0]||0);
  const maxVal = Math.max(...selData,1);
 
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:CD,fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Analytics</h3>
        {role==="team" && <button onClick={()=>setShowAdd(true)} style={pbtn}>+ Add Platform</button>}
      </div>
      {platforms.length===0 && <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:24,textAlign:"center"}}><p style={{color:"#4b5563",fontSize:14}}>{role==="team"?"No platforms added yet. Click + Add Platform.":"No analytics data yet."}</p></div>}
      {platforms.length>0 && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {platforms.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:4}}>
                <button onClick={()=>{setSelected(p);setEditing(false);}} style={{padding:"6px 16px",borderRadius:99,border:"1px solid",fontFamily:ST,fontSize:12,fontWeight:600,cursor:"pointer",borderColor:selected?.id===p.id?"#7c3aed":"#1e1e35",background:selected?.id===p.id?"rgba(124,58,237,0.2)":"transparent",color:selected?.id===p.id?"#a78bfa":"#64748b"}}>{p.platform}</button>
                {role==="team" && <button onClick={()=>removePlat(p.id)} style={{fontSize:11,color:"#ef4444",background:"none",border:"none",cursor:"pointer"}}>x</button>}
              </div>
            ))}
          </div>
          {selected && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {[{label:"Current Followers",value:latest.toLocaleString(),color:"#a78bfa"},{label:"Monthly Growth",value:"+"+growth+"%",color:"#10b981"},{label:"Gained This Year",value:"+"+total.toLocaleString(),color:"#60a5fa"}].map(s=>(
                  <div key={s.label} style={{background:"#12122a",border:"1px solid #1e1e35",borderRadius:12,padding:"16px 18px"}}>
                    <div style={{fontFamily:CD,fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#12122a",border:"1px solid #1e1e35",borderRadius:14,padding:"20px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#64748b",letterSpacing:"0.06em"}}>{"FOLLOWER GROWTH 2026 - "+selected.platform.toUpperCase()}</div>
                  {role==="team" && <button onClick={()=>editing?saveNums():startEdit(selected)} style={{...pbtn,padding:"5px 14px",fontSize:11}}>{editing?"Save":"Update Numbers"}</button>}
                </div>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,height:160}}>
                  {MONTHS.map((m,i)=>{
                    const val=selData[i]||0; const pv=selData[i-1]||val; const up=val>=pv; const h=Math.max((val/maxVal)*140,2);
                    return (
                      <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{fontSize:9,color:"#64748b"}}>{val>999?(val/1000).toFixed(1)+"k":val}</div>
                        <div style={{width:"100%",height:h,background:up?"linear-gradient(180deg,#7c3aed,#2563eb)":"#ef4444",borderRadius:"4px 4px 0 0",transition:"height 0.3s"}} />
                        <div style={{fontSize:9,color:"#64748b"}}>{m}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {editing && (
                <div style={{background:"#0d0d1a",border:"1px solid #2d2d4e",borderRadius:12,padding:16,marginBottom:16}}>
                  <div style={{fontSize:12,color:"#a78bfa",fontWeight:600,marginBottom:12}}>Enter follower counts for each month:</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {MONTHS.map((m,i)=>(
                      <div key={m}><div style={{fontSize:10,color:"#64748b",marginBottom:4}}>{m}</div><input type="number" value={editVals[i]||0} onChange={e=>setEditVals(p=>({...p,[i]:e.target.value}))} style={{...inp,padding:"6px 8px",fontSize:13}} /></div>
                    ))}
                  </div>
                  <button onClick={saveNums} style={{...pbtn,width:"100%",marginTop:12}}>Save Numbers</button>
                </div>
              )}
              <div style={{background:"#12122a",border:"1px solid #1e1e35",borderRadius:12,padding:16}}>
                <div style={{fontSize:11,fontWeight:600,color:"#64748b",letterSpacing:"0.06em",marginBottom:12}}>MONTHLY BREAKDOWN</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {MONTHS.map((m,i)=>{ const val=selData[i]||0; const pv=selData[i-1]||val; const diff=val-pv; return (
                    <div key={m} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:8,padding:"8px 12px",minWidth:68,textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#4b5563",marginBottom:3}}>{m}</div>
                      <div style={{fontFamily:CD,fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{val.toLocaleString()}</div>
                      {i>0 && <div style={{fontSize:10,color:diff>=0?"#10b981":"#ef4444"}}>{diff>=0?"+":""}{diff}</div>}
                    </div>
                  );})}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showAdd && (
        <Modal onClose={()=>setShowAdd(false)} title="Add Social Media Platform">
          <div style={{marginBottom:14}}><label style={lab}>Select Platform</label><select value={newPlat} onChange={e=>setNewPlat(e.target.value)} style={inp}><option value="">Choose...</option>{SOCIAL_OPTIONS.filter(s=>!platforms.find(p=>p.platform===s)).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <button onClick={addPlat} style={{...pbtn,width:"100%"}}>Add Platform</button>
        </Modal>
      )}
    </div>
  );
}
 
function Briefs({ clientId, role }) {
  const [briefs, setBriefs] = useState([]);
  const [clients, setClients] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ weekOf:"", details:"", inspo:"" });
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0,10);
 
  useEffect(()=>{ load(); if(role==="team") loadClients(); },[]);
  async function load(){ setLoading(true); try { const q = clientId?"client_id=eq."+clientId+"&order=submitted_at.desc":"order=submitted_at.desc"; setBriefs(await db("GET","briefs",null,q)); } catch(e){} setLoading(false); }
  async function loadClients(){ try { setClients(await db("GET","profiles",null,"role=eq.client")); } catch(e){} }
  async function submit(){
    if(!form.weekOf||!form.details.trim()) return;
    if(Math.floor((new Date(form.weekOf)-new Date(today))/86400000)<7){ alert("Please submit at least 7 days before the required week."); return; }
    try { await db("POST","briefs",{client_id:clientId,week_of:form.weekOf,details:form.details,inspo:form.inspo}); setForm({weekOf:"",details:"",inspo:""}); setShow(false); load(); } catch(e){ alert("Error saving brief."); }
  }
 
  if(loading) return <Spinner />;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h3 style={{fontFamily:CD,fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Weekly Briefs</h3><p style={{fontSize:12,color:"#64748b",marginTop:3}}>Submit content ideas at least 7 days in advance</p></div>
        {role==="client" && <button onClick={()=>setShow(true)} style={pbtn}>+ New Brief</button>}
      </div>
      {briefs.length===0 && <p style={{color:"#4b5563",fontSize:14}}>No briefs yet.</p>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {briefs.map(b=>{ const cl=clients.find(c=>c.id===b.client_id); const days=Math.floor((new Date(b.week_of)-new Date(today))/86400000); return (
          <div key={b.id} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {role==="team" && cl && <Ava initials={(cl.business_name||"?").slice(0,2).toUpperCase()} color={cl.color||"#7c3aed"} size={28} />}
                <div><div style={{fontFamily:CD,fontWeight:600,fontSize:14,color:"#e2e8f0"}}>{"Week of "+b.week_of}{role==="team"&&cl&&<span style={{color:"#64748b",fontWeight:400,fontSize:13}}>{" - "+cl.business_name}</span>}</div><div style={{fontSize:11,color:"#4b5563"}}>{b.submitted_at?b.submitted_at.slice(0,10):""}</div></div>
              </div>
              <span style={chip(days>7?"#10b981":days>0?"#f59e0b":"#ef4444")}>{days>0?days+"d away":"This week"}</span>
            </div>
            <div style={{background:"#12122a",borderRadius:10,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid #7c3aed"}}><div style={{fontSize:11,color:"#7c3aed",fontWeight:600,marginBottom:6}}>CONTENT DETAILS</div><p style={{color:"#cbd5e1",fontSize:13,lineHeight:1.6}}>{b.details}</p></div>
            {b.inspo && <div style={{background:"#12122a",borderRadius:10,padding:"10px 14px",borderLeft:"3px solid #60a5fa"}}><div style={{fontSize:11,color:"#60a5fa",fontWeight:600,marginBottom:4}}>INSPO</div><p style={{color:"#94a3b8",fontSize:13}}>{b.inspo}</p></div>}
          </div>
        );})}
      </div>
      {show && (
        <Modal onClose={()=>setShow(false)} title="Submit Weekly Brief" wide>
          <div style={{marginBottom:14}}><label style={lab}>Week commencing (must be 7+ days away)</label><input type="date" value={form.weekOf} onChange={e=>setForm(p=>({...p,weekOf:e.target.value}))} style={inp} min={today} /></div>
          <div style={{marginBottom:14}}><label style={lab}>Content details and requests</label><textarea value={form.details} onChange={e=>setForm(p=>({...p,details:e.target.value}))} style={{...inp,height:120,resize:"vertical"}} placeholder="Describe what you want this week..." /></div>
          <div style={{marginBottom:18}}><label style={lab}>Inspiration / style notes (optional)</label><textarea value={form.inspo} onChange={e=>setForm(p=>({...p,inspo:e.target.value}))} style={{...inp,height:70,resize:"vertical"}} placeholder="Reference brands, colour schemes..." /></div>
          <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:12,marginBottom:16}}><p style={{fontSize:12,color:"#fbbf24"}}>Briefs must be submitted at least 7 days before the required week.</p></div>
          <button onClick={submit} style={{...pbtn,width:"100%"}}>Submit Brief</button>
        </Modal>
      )}
    </div>
  );
}
 
function Meetings({ clientId, role }) {
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [reqForm, setReqForm] = useState({ date:"", time:"" });
  const [meetLinkModal, setMeetLinkModal] = useState(null);
  const [meetLink, setMeetLink] = useState("");
  const [loading, setLoading] = useState(true);
 
  const now = new Date();
  const todayStr = now.toISOString().slice(0,10);
 
  useEffect(()=>{ load(); if(role==="team") loadClients(); },[]);
  async function load(){ setLoading(true); try { const q = role==="client"?"requested_by=eq."+clientId+"&order=requested_date.asc":"order=requested_date.asc,requested_time.asc"; setMeetings(await db("GET","slots",null,q)); } catch(e){} setLoading(false); }
  async function loadClients(){ try { setClients(await db("GET","profiles",null,"role=eq.client")); } catch(e){} }
 
  async function requestMeeting() {
    if(!reqForm.date||!reqForm.time) return;
    const meetingDt = new Date(reqForm.date+"T"+reqForm.time);
    const diffHrs = (meetingDt - new Date()) / 3600000;
    if(diffHrs < 3){ alert("Meetings must be requested at least 3 hours in advance."); return; }
    try {
      await db("POST","slots",{ requested_by:clientId, requested_date:reqForm.date, requested_time:reqForm.time, status:"pending" });
      setReqForm({date:"",time:""}); setShowRequest(false); load();
    } catch(e){ alert("Error requesting meeting."); }
  }
 
  const [declineModal, setDeclineModal] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
 
  async function approve(id) { try { await db("PATCH","slots",{status:"approved"},"id=eq."+id); load(); } catch(e){ alert("Error."); } }
  async function declineWithSuggestion() {
    if(!declineModal) return;
    const updates = { status:"declined" };
    if(suggestedDate && suggestedTime) updates.meet_link = "SUGGESTED:"+suggestedDate+" at "+suggestedTime;
    try { await db("PATCH","slots",updates,"id=eq."+declineModal); setDeclineModal(null); setSuggestedDate(""); setSuggestedTime(""); load(); } catch(e){ alert("Error."); }
  }
  async function cancel(id) { try { await db("DELETE","slots",null,"id=eq."+id); load(); } catch(e){ alert("Error."); } }
  async function saveMeetLink() {
    try { await db("PATCH","slots",{meet_link:meetLink},"id=eq."+meetLinkModal); setMeetLinkModal(null); setMeetLink(""); load(); } catch(e){ alert("Error."); }
  }
 
  const statusColors = { pending:"#f59e0b", approved:"#10b981", declined:"#ef4444" };
 
  if(loading) return <Spinner />;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h3 style={{fontFamily:CD,fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Meetings</h3><p style={{fontSize:12,color:"#64748b",marginTop:3}}>{role==="client"?"Request a 15-min call with our team":"Manage client meeting requests"}</p></div>
        {role==="client" && <button onClick={()=>setShowRequest(true)} style={pbtn}>Request Meeting</button>}
      </div>
 
      {meetings.length===0 && <p style={{color:"#4b5563",fontSize:14}}>{role==="client"?"No meetings requested yet.":"No meeting requests yet."}</p>}
 
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {meetings.map(m=>{
          const cl = clients.find(c=>c.id===m.requested_by);
          const sc = statusColors[m.status]||"#6b7280";
          return (
            <div key={m.id} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {role==="team" && cl && <Ava initials={(cl.business_name||"?").slice(0,2).toUpperCase()} color={cl.color||"#7c3aed"} size={32} />}
                  <div>
                    <div style={{fontFamily:CD,fontWeight:600,fontSize:15,color:"#e2e8f0"}}>{m.requested_date+" at "+m.requested_time}</div>
                    {role==="team" && cl && <div style={{fontSize:12,color:"#64748b"}}>{cl.business_name+" - "+cl.contact_name}</div>}
                  </div>
                </div>
                <span style={chip(sc)}>{m.status.charAt(0).toUpperCase()+m.status.slice(1)}</span>
              </div>
 
              {m.meet_link && m.status==="approved" && (
                <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontSize:11,color:"#10b981",fontWeight:600,marginBottom:6}}>GOOGLE MEET LINK</div>
                  <a href={m.meet_link} target="_blank" rel="noopener noreferrer" style={{color:"#a78bfa",fontSize:13,wordBreak:"break-all",display:"block",marginBottom:8}}>{m.meet_link}</a>
                  <a href={m.meet_link} target="_blank" rel="noopener noreferrer" style={{...pbtn,display:"inline-block",textDecoration:"none",padding:"7px 14px",fontSize:12,background:"linear-gradient(135deg,#059669,#10b981)"}}>Join Meeting</a>
                </div>
              )}
 
              {role==="team" && (
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {m.status==="pending" && (
                    <>
                      <button onClick={()=>approve(m.id)} style={{...pbtn,padding:"7px 14px",fontSize:12,background:"linear-gradient(135deg,#059669,#10b981)"}}>Approve</button>
                      <button onClick={()=>setDeclineModal(m.id)} style={{...gbtn,borderColor:"#ef4444",color:"#f87171",padding:"7px 14px",fontSize:12}}>Decline</button>
                    </>
                  )}
                  {m.status==="approved" && !m.meet_link && (
                    <button onClick={()=>{ setMeetLinkModal(m.id); setMeetLink(""); }} style={{...pbtn,padding:"7px 14px",fontSize:12}}>+ Add Meet Link</button>
                  )}
                  {m.status==="approved" && m.meet_link && (
                    <button onClick={()=>{ setMeetLinkModal(m.id); setMeetLink(m.meet_link); }} style={{...gbtn,padding:"7px 14px",fontSize:12}}>Edit Meet Link</button>
                  )}
                  <button onClick={()=>cancel(m.id)} style={{...gbtn,padding:"7px 14px",fontSize:12,color:"#4b5563",borderColor:"#1e1e35"}}>Remove</button>
                </div>
              )}
              {role==="client" && m.status==="pending" && (
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:12,color:"#f59e0b"}}>Awaiting team confirmation</span>
                  <button onClick={()=>cancel(m.id)} style={{...gbtn,padding:"4px 10px",fontSize:11,color:"#4b5563"}}>Cancel</button>
                </div>
              )}
              {role==="client" && m.status==="declined" && (
                <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:12}}>
                  <p style={{fontSize:12,color:"#ef4444",marginBottom:4}}>Meeting declined.</p>
                  {m.meet_link && m.meet_link.startsWith("SUGGESTED:") && <p style={{fontSize:12,color:"#fbbf24"}}>{"Team suggested: "+m.meet_link.replace("SUGGESTED:","")}</p>}
                  <button onClick={()=>cancel(m.id)} style={{...gbtn,padding:"4px 10px",fontSize:11,marginTop:8}}>Remove</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
 
      {declineModal && (
        <Modal onClose={()=>setDeclineModal(null)} title="Decline Meeting">
          <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>Optionally suggest an alternative time for the client.</p>
          <div style={{marginBottom:14}}><label style={lab}>Suggest alternative date (optional)</label><input type="date" value={suggestedDate} onChange={e=>setSuggestedDate(e.target.value)} style={inp} /></div>
          <div style={{marginBottom:18}}><label style={lab}>Suggest alternative time (optional)</label><input type="time" value={suggestedTime} onChange={e=>setSuggestedTime(e.target.value)} style={inp} /></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={declineWithSuggestion} style={{...gbtn,flex:1,borderColor:"#ef4444",color:"#f87171"}}>Decline</button>
            <button onClick={()=>setDeclineModal(null)} style={{...gbtn,flex:1}}>Cancel</button>
          </div>
        </Modal>
      )}
 
      {showRequest && (
        <Modal onClose={()=>setShowRequest(false)} title="Request a Meeting">
          <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>Meetings must be requested at least 3 hours in advance. The team will confirm or suggest another time.</p>
          <div style={{marginBottom:14}}><label style={lab}>Preferred Date</label><input type="date" value={reqForm.date} onChange={e=>setReqForm(p=>({...p,date:e.target.value}))} style={inp} min={todayStr} /></div>
          <div style={{marginBottom:18}}><label style={lab}>Preferred Time</label><input type="time" value={reqForm.time} onChange={e=>setReqForm(p=>({...p,time:e.target.value}))} style={inp} /></div>
          <button onClick={requestMeeting} style={{...pbtn,width:"100%"}}>Send Request</button>
        </Modal>
      )}
 
      {meetLinkModal && (
        <Modal onClose={()=>setMeetLinkModal(null)} title="Add Google Meet Link">
          <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>This link will be visible to the client once added.</p>
          <div style={{marginBottom:18}}><label style={lab}>Google Meet Link</label><input value={meetLink} onChange={e=>setMeetLink(e.target.value)} style={inp} placeholder="https://meet.google.com/xxx-xxxx-xxx" /></div>
          <button onClick={saveMeetLink} style={{...pbtn,width:"100%"}}>Save Link</button>
        </Modal>
      )}
    </div>
  );
}
 
function InviteCodes() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ load(); },[]);
  async function load(){ setLoading(true); try { setCodes(await db("GET","invite_codes",null,"order=created_at.desc")); } catch(e){} setLoading(false); }
  async function add(){ if(!newCode.trim()) return; try { await db("POST","invite_codes",{code:newCode.toUpperCase().trim(),used:false}); setNewCode(""); load(); } catch(e){ alert("Code may already exist."); } }
  if(loading) return <Spinner />;
  return (
    <div>
      <h3 style={{fontFamily:CD,fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>Invite Codes</h3>
      <p style={{fontSize:13,color:"#64748b",marginBottom:20}}>Give these codes to clients so they can sign up</p>
      <div style={{display:"flex",gap:10,marginBottom:20}}><input value={newCode} onChange={e=>setNewCode(e.target.value)} style={{...inp,flex:1}} placeholder="e.g. CLIENT2026" /><button onClick={add} style={pbtn}>Add Code</button></div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {codes.map(c=>(<div key={c.id} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontFamily:CD,fontWeight:600,color:"#e2e8f0",fontSize:15,letterSpacing:"0.05em"}}>{c.code}</span><span style={chip(c.used?"#ef4444":"#10b981")}>{c.used?"Used":"Available"}</span></div>))}
        {codes.length===0 && <p style={{color:"#4b5563",fontSize:14}}>No codes yet.</p>}
      </div>
    </div>
  );
}
 
function PostDetail({ post, posts, setPosts, role, onBack }) {
  const [revText, setRevText] = useState("");
  const [revMedia, setRevMedia] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState([]);
  const p = posts.find(x=>x.id===post.id)||post;
  const mediaList = p.media_urls ? (typeof p.media_urls==="string" ? JSON.parse(p.media_urls) : p.media_urls) : [];
 
  async function updatePost(updates) {
    setSaving(true);
    try { await db("PATCH","posts",updates,"id=eq."+p.id); setPosts(ps=>ps.map(x=>x.id===p.id?{...x,...updates}:x)); onBack(); } catch(e){ alert("Error updating post."); }
    setSaving(false);
  }
  async function saveEdit() {
    setSaving(true);
    try { await db("PATCH","posts",{content:editContent,media_urls:JSON.stringify(editMedia)},"id=eq."+p.id); setPosts(ps=>ps.map(x=>x.id===p.id?{...x,content:editContent,media_urls:JSON.stringify(editMedia)}:x)); setEditing(false); } catch(e){ alert("Error saving."); }
    setSaving(false);
  }
  function startEdit() {
    setEditContent(p.content||"");
    setEditMedia(mediaList);
    setEditing(true);
  }
 
  return (
    <div>
      <button onClick={onBack} style={{...gbtn,marginBottom:16}}>Back to Posts</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><h2 style={{fontFamily:CD,fontSize:20,fontWeight:700,color:"#f1f5f9"}}>{p.title}</h2><div style={{fontSize:12,color:"#64748b",marginTop:4}}>{"Due "+p.due_date}</div></div>
            <Badge status={p.status} />
          </div>
 
          {mediaList.length>0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"#7c3aed",fontWeight:600,marginBottom:8}}>POST MEDIA</div>
              <MediaGallery urls={mediaList} />
            </div>
          )}
 
          <div style={{background:"#12122a",borderRadius:10,padding:16,marginBottom:14,borderLeft:"3px solid #7c3aed"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:11,color:"#7c3aed",fontWeight:600}}>POST CONTENT</div>
              {role==="team" && !editing && <button onClick={startEdit} style={{...gbtn,padding:"3px 10px",fontSize:11}}>Edit</button>}
              {role==="team" && editing && <div style={{display:"flex",gap:6}}><button onClick={saveEdit} disabled={saving} style={{...pbtn,padding:"3px 10px",fontSize:11,opacity:saving?0.6:1}}>{saving?"Saving...":"Save"}</button><button onClick={()=>setEditing(false)} style={{...gbtn,padding:"3px 10px",fontSize:11}}>Cancel</button></div>}
            </div>
            {editing ? (
              <div>
                <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} style={{...inp,height:100,resize:"vertical",marginBottom:10}} placeholder="Post caption..." />
                <MediaUpload label="Replace media (uploads add to existing)" onUploaded={urls=>setEditMedia(prev=>[...prev,...urls])} multiple={true} />
                {editMedia.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                    {editMedia.map((url,i)=>{ const isVid=url.match(/\.(mp4|mov|webm)$/i); return (
                      <div key={i} style={{position:"relative",width:70,height:70}}>
                        {isVid?<video src={url} style={{width:70,height:70,objectFit:"cover",borderRadius:6}} />:<img src={url} alt="" style={{width:70,height:70,objectFit:"cover",borderRadius:6}} />}
                        <button onClick={()=>setEditMedia(m=>m.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"#ef4444",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}}>x</button>
                      </div>
                    );})}
                  </div>
                )}
              </div>
            ) : (
              <p style={{color:"#cbd5e1",fontSize:14,lineHeight:1.6}}>{p.content||"Draft in progress."}</p>
            )}
          </div>
 
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,background:"#12122a",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:"#64748b"}}>REVISIONS USED</div>
              <div style={{fontFamily:CD,fontSize:22,fontWeight:700,color:p.revisions>=2?"#ef4444":"#a78bfa"}}>{p.revisions||0}</div>
              <div style={{fontSize:11,color:"#4b5563"}}>1 free included</div>
            </div>
            <div style={{flex:2,background:p.fee_owed?"rgba(239,68,68,0.06)":"#12122a",borderRadius:10,padding:"12px 14px",border:"1px solid "+(p.fee_owed?"rgba(239,68,68,0.3)":"#1e1e35")}}>
              <div style={{fontSize:11,color:"#64748b"}}>REVISION FEE</div>
              {p.fee_owed
                ? <div><div style={{fontFamily:CD,fontSize:22,fontWeight:700,color:"#ef4444"}}>£5.00</div><div style={{fontSize:11,color:"#ef4444"}}>Payment required</div></div>
                : <div><div style={{fontFamily:CD,fontSize:22,fontWeight:700,color:"#10b981"}}>Free</div><div style={{fontSize:11,color:"#4b5563"}}>Next revision = £5 fee</div></div>
              }
            </div>
          </div>
 
          {p.revision_note && (
            <div style={{marginTop:14,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:"#ef4444",fontWeight:600,marginBottom:6}}>CLIENT REVISION REQUEST</div>
              <p style={{color:"#fca5a5",fontSize:13,lineHeight:1.6}}>{p.revision_note}</p>
              {p.revision_media && JSON.parse(p.revision_media||"[]").length>0 && (
                <div style={{marginTop:10}}><div style={{fontSize:11,color:"#ef4444",fontWeight:600,marginBottom:6}}>REVISION MEDIA</div><MediaGallery urls={p.revision_media} /></div>
              )}
            </div>
          )}
        </div>
 
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:20}}>
          <div style={{fontSize:11,fontWeight:600,color:"#64748b",marginBottom:14}}>ACTIONS</div>
 
          {role==="team" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {p.status==="draft" && <button onClick={()=>updatePost({status:"pending_approval"})} style={{...pbtn,width:"100%"}}>Send for Approval</button>}
              {p.status==="revision_requested" && <button onClick={()=>updatePost({status:"pending_approval",revision_note:""})} style={{...pbtn,width:"100%",background:"linear-gradient(135deg,#d97706,#f59e0b)"}}>Revision Done - Resend</button>}
              {p.status==="pending_approval" && <div style={{background:"#12122a",borderRadius:10,padding:14,textAlign:"center"}}><p style={{color:"#94a3b8",fontSize:13}}>Awaiting client approval</p></div>}
              {p.status==="approved" && <div style={{background:"rgba(16,185,129,0.08)",borderRadius:10,padding:14,textAlign:"center"}}><p style={{color:"#10b981",fontSize:13}}>Approved by client</p></div>}
              {p.fee_owed && !p.payment_received && (
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:14}}>
                  <p style={{color:"#fca5a5",fontSize:13,fontWeight:600,marginBottom:8}}>£5 revision fee owed</p>
                  <p style={{color:"#9ca3af",fontSize:12,marginBottom:10}}>Once the client has paid via Stripe, mark it as received to unlock their revision form.</p>
                  <button onClick={()=>updatePost({payment_received:true})} style={{...pbtn,width:"100%",background:"linear-gradient(135deg,#059669,#10b981)",padding:"8px 14px",fontSize:12}}>Mark Payment Received</button>
                </div>
              )}
              {p.fee_owed && p.payment_received && (
                <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:10,padding:14}}>
                  <p style={{color:"#10b981",fontSize:13,fontWeight:600,marginBottom:4}}>Payment received</p>
                  <p style={{color:"#9ca3af",fontSize:12}}>Client can now submit their revision request.</p>
                </div>
              )}
            </div>
          )}
 
          {role==="client" && p.status==="pending_approval" && (
            <div>
              <button onClick={()=>updatePost({status:"approved",revision_note:""})} style={{...pbtn,width:"100%",marginBottom:12,background:"linear-gradient(135deg,#059669,#10b981)"}}>Approve Post</button>
 
              {!p.fee_owed && (
                <div>
                  <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:10,padding:14,marginBottom:12}}>
                    <p style={{color:"#a78bfa",fontSize:13,fontWeight:600,marginBottom:6}}>Free revision included</p>
                    <p style={{color:"#94a3b8",fontSize:12,lineHeight:1.6}}>You have <strong style={{color:"#e2e8f0"}}>1 free revision</strong> for this post. Include ALL the changes you want in this one message — any further revisions after this will cost <strong style={{color:"#e2e8f0"}}>£5 each</strong>.</p>
                  </div>
                  <label style={lab}>Describe all your changes (make it detailed!)</label>
                  <textarea value={revText} onChange={e=>setRevText(e.target.value)} style={{...inp,height:100,resize:"vertical",marginBottom:10}} placeholder="e.g. Change the font to bold, move the logo to the top right, use a darker background, update the caption to say..." />
                  <div style={{marginBottom:12}}><MediaUpload label="Upload reference images/videos (optional)" onUploaded={urls=>setRevMedia(urls)} multiple={true} /></div>
                  <button onClick={()=>{ if(!revText.trim()) return; const r=(p.revisions||0)+1; updatePost({status:"revision_requested",revision_note:revText,revision_media:JSON.stringify(revMedia),revisions:r,fee_owed:r>=2}); }} style={{...gbtn,width:"100%",borderColor:"#ef4444",color:"#f87171"}}>Submit Revision Request</button>
                </div>
              )}
 
              {p.fee_owed && !p.payment_received && (
                <div>
                  <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:16,marginBottom:12}}>
                    <p style={{color:"#fca5a5",fontSize:13,fontWeight:600,marginBottom:6}}>Payment required before revision</p>
                    <p style={{color:"#9ca3af",fontSize:12,lineHeight:1.6,marginBottom:12}}>You have used your free revision. To request further changes please pay the <strong style={{color:"#e2e8f0"}}>£5 revision fee</strong>. Once paid, contact us and we will unlock the revision form.</p>
                    <button onClick={()=>{ try{ window.open(STRIPE_LINK,"_blank"); }catch(e){ window.location.href=STRIPE_LINK; } }} style={{display:"block",width:"100%",textAlign:"center",padding:"11px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",fontFamily:ST,fontSize:14,fontWeight:600,marginBottom:10,cursor:"pointer"}}>Pay £5 Now — Click Here</button>
                    <p style={{fontSize:12,color:"#a78bfa",textAlign:"center",marginBottom:4}}>Or copy this link: <span style={{wordBreak:"break-all",color:"#60a5fa",fontSize:11}}>{STRIPE_LINK}</span></p>
                    <p style={{fontSize:11,color:"#4b5563",textAlign:"center"}}>After paying, message us and we will unlock your revision.</p>
                  </div>
                </div>
              )}
 
              {p.fee_owed && p.payment_received === true && (
                <div>
                  <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:10,padding:12,marginBottom:12}}>
                    <p style={{color:"#10b981",fontSize:13,fontWeight:600}}>Payment confirmed — you can now submit your revision</p>
                  </div>
                  <label style={lab}>Describe all your changes</label>
                  <textarea value={revText} onChange={e=>setRevText(e.target.value)} style={{...inp,height:100,resize:"vertical",marginBottom:10}} placeholder="Include ALL changes you want in this message..." />
                  <div style={{marginBottom:12}}><MediaUpload label="Upload reference images/videos (optional)" onUploaded={urls=>setRevMedia(urls)} multiple={true} /></div>
                  <button onClick={()=>{ if(!revText.trim()) return; const r=(p.revisions||0)+1; updatePost({status:"revision_requested",revision_note:revText,revision_media:JSON.stringify(revMedia),revisions:r,fee_owed:true,payment_received:false}); }} style={{...gbtn,width:"100%",borderColor:"#ef4444",color:"#f87171"}}>Submit Revision Request</button>
                </div>
              )}
            </div>
          )}
          {role==="client" && p.status==="approved" && <div style={{textAlign:"center",padding:20}}><p style={{color:"#10b981",fontWeight:600,fontSize:15}}>Post approved!</p></div>}
          {role==="client" && p.status==="revision_requested" && (
            p.fee_owed && !p.payment_received ? (
              <div>
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:16,marginBottom:12}}>
                  <p style={{color:"#fca5a5",fontSize:13,fontWeight:600,marginBottom:6}}>Payment required — £5 revision fee</p>
                  <p style={{color:"#9ca3af",fontSize:12,lineHeight:1.6,marginBottom:14}}>You have used your free revision. Please pay the <strong style={{color:"#e2e8f0"}}>£5 fee</strong> to request further changes. Once paid, contact us and we will unlock the revision form.</p>
                  <button onClick={()=>{ try{ window.open(STRIPE_LINK,"_blank"); }catch(e){ window.location.href=STRIPE_LINK; } }} style={{display:"block",width:"100%",textAlign:"center",padding:"12px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",fontFamily:ST,fontSize:14,fontWeight:600,marginBottom:10,cursor:"pointer"}}>Pay £5 Now</button>
                  <p style={{fontSize:11,color:"#64748b",textAlign:"center"}}>Or copy link: <span style={{color:"#a78bfa",wordBreak:"break-all"}}>{STRIPE_LINK}</span></p>
                </div>
              </div>
            ) : p.fee_owed && p.payment_received === true ? (
              <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:10,padding:14}}>
                <p style={{color:"#10b981",fontSize:13,fontWeight:600,marginBottom:4}}>Payment confirmed!</p>
                <p style={{color:"#9ca3af",fontSize:12}}>Our team has been notified. We will send the post back shortly for your revision.</p>
              </div>
            ) : (
              <p style={{color:"#f59e0b",fontSize:13,padding:12}}>Revision in progress - we will send it back shortly.</p>
            )
          )}
          {role==="client" && p.status==="draft" && <p style={{color:"#64748b",fontSize:13,padding:12}}>Our team is still working on this post.</p>}
        </div>
      </div>
    </div>
  );
}
 
function ClientHub({ client, role, agencyStatus }) {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState({ title:"", dueDate:"", content:"" });
  const [newMedia, setNewMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const TABS = ["posts","briefs","meetings","drive","analytics"];
 
  useEffect(()=>{ loadPosts(); },[client.id]);
  async function loadPosts(){ setLoading(true); try { setPosts(await db("GET","posts",null,"client_id=eq."+client.id+"&order=created_at.desc")); } catch(e){} setLoading(false); }
  async function addPost(){
    if(!newPost.title||!newPost.dueDate) return;
    try {
      await db("POST","posts",{ client_id:client.id, title:newPost.title, due_date:newPost.dueDate, content:newPost.content, media_urls:JSON.stringify(newMedia), status:"draft", revisions:0, fee_owed:false, revision_note:"" });
      setNewPost({title:"",dueDate:"",content:""}); setNewMedia([]); setShowNew(false); loadPosts();
    } catch(e){ alert("Error creating post."); }
  }
 
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
        <Ava initials={(client.business_name||"?").slice(0,2).toUpperCase()} color={client.color||"#7c3aed"} size={48} />
        <div><h1 style={{fontFamily:CD,fontSize:24,fontWeight:700,color:"#f1f5f9"}}>{client.business_name}</h1><p style={{color:"#64748b",fontSize:13}}>{client.contact_name+" - "+client.email}</p></div>
      </div>
      <Banner status={agencyStatus} />
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"1px solid #1e1e35"}}>
        {TABS.map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:"9px 16px",border:"none",background:"none",cursor:"pointer",fontFamily:ST,fontSize:13,fontWeight:600,color:tab===t?"#a78bfa":"#64748b",borderBottom:"2px solid "+(tab===t?"#7c3aed":"transparent"),textTransform:"capitalize"}}>{t==="drive"?"Google Drive":t}</button>))}
      </div>
 
      {tab==="posts" && !selectedPost && (
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><button onClick={()=>setShowNew(true)} style={pbtn}>+ New Post</button></div>
          {loading ? <Spinner /> : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {posts.map(p=>{
                const media = p.media_urls?(typeof p.media_urls==="string"?JSON.parse(p.media_urls):p.media_urls):[];
                const thumb = media.find(u=>!u.match(/\.(mp4|mov|webm)$/i));
                return (
                  <div key={p.id} onClick={()=>setSelectedPost(p)} style={{background:"#0d0d1a",border:"1px solid "+(p.fee_owed?"#ef444440":"#1e1e35"),borderLeft:"3px solid "+(p.fee_owed?"#ef4444":"transparent"),borderRadius:12,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                    {thumb && <img src={thumb} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0}} />}
                    <div style={{flex:1}}>
                      <div style={{fontFamily:CD,fontWeight:600,fontSize:14,color:"#e2e8f0"}}>{p.title}</div>
                      <div style={{fontSize:12,color:"#64748b"}}>{"Due "+p.due_date+(media.length>0?" - "+media.length+" file"+(media.length>1?"s":""):"")}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {p.fee_owed && <span style={{...chip("#ef4444"),fontSize:10}}>£5 FEE</span>}
                      <Badge status={p.status} />
                    </div>
                  </div>
                );
              })}
              {posts.length===0 && <p style={{color:"#4b5563",fontSize:14}}>No posts yet.</p>}
            </div>
          )}
          {showNew && (
            <Modal onClose={()=>setShowNew(false)} title="Create New Post" wide>
              <div style={{marginBottom:14}}><label style={lab}>Post Title</label><input value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. Summer Sale Post" /></div>
              <div style={{marginBottom:14}}><label style={lab}>Caption / Content</label><textarea value={newPost.content} onChange={e=>setNewPost(p=>({...p,content:e.target.value}))} style={{...inp,height:90,resize:"vertical"}} placeholder="Post copy..." /></div>
              <div style={{marginBottom:14}}><label style={lab}>Due Date</label><input type="date" value={newPost.dueDate} onChange={e=>setNewPost(p=>({...p,dueDate:e.target.value}))} style={inp} /></div>
              <div style={{marginBottom:18}}><MediaUpload label="Upload images / videos (select multiple)" onUploaded={urls=>setNewMedia(urls)} multiple={true} /></div>
              <button onClick={addPost} style={{...pbtn,width:"100%"}}>Create Post</button>
            </Modal>
          )}
        </div>
      )}
      {tab==="posts" && selectedPost && <PostDetail post={selectedPost} posts={posts} setPosts={setPosts} role={role} onBack={()=>{ setSelectedPost(null); loadPosts(); }} />}
      {tab==="briefs" && <Briefs clientId={client.id} role={role} />}
      {tab==="meetings" && <Meetings clientId={client.id} role={role} />}
      {tab==="drive" && <ClientDrive clientId={client.id} role={role} />}
      {tab==="analytics" && <Analytics clientId={client.id} role={role} />}
    </div>
  );
}
 
function ClientApp({ profile, onSignOut }) {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [agencyStatus, setAgencyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const TABS = ["posts","briefs","meetings","drive","analytics"];
 
  useEffect(()=>{ loadData(); },[]);
  async function loadData(){
    setLoading(true);
    try {
      const [ps,st] = await Promise.all([db("GET","posts",null,"client_id=eq."+profile.id+"&order=created_at.desc"),db("GET","agency_status",null,"id=eq.1")]);
      setPosts(ps); if(st[0]&&st[0].type!=="online") setAgencyStatus(st[0]);
    } catch(e){}
    setLoading(false);
  }
 
  return (
    <div style={{fontFamily:ST,background:"#0a0a12",minHeight:"100vh",color:"#e2e8f0",display:"flex",height:"100vh",overflow:"hidden"}}>
      <aside style={{width:200,background:"#0d0d1a",borderRight:"1px solid #1e1e35",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"24px 20px",borderBottom:"1px solid #1e1e35"}}>
          <div style={{fontFamily:CD,fontWeight:700,fontSize:16,background:"linear-gradient(135deg,#a78bfa,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Affordable Socials</div>
          <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>{profile.business_name}</div>
        </div>
        <div style={{flex:1}} />
        <div style={{padding:"12px 8px",borderTop:"1px solid #1e1e35"}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6,paddingLeft:4}}>{profile.email}</div>
          <button onClick={onSignOut} style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",fontSize:13,fontFamily:ST,cursor:"pointer"}}>Sign Out</button>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        <Banner status={agencyStatus} />
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
          <Ava initials={(profile.business_name||"?").slice(0,2).toUpperCase()} color={profile.color||"#7c3aed"} size={44} />
          <div><h1 style={{fontFamily:CD,fontSize:22,fontWeight:700,color:"#f1f5f9"}}>{"Hi, "+(profile.contact_name||"").split(" ")[0]}</h1><p style={{color:"#64748b",fontSize:13}}>{profile.business_name}</p></div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"1px solid #1e1e35"}}>
          {TABS.map(t=>(<button key={t} onClick={()=>{ setTab(t); setSelectedPost(null); }} style={{padding:"9px 16px",border:"none",background:"none",cursor:"pointer",fontFamily:ST,fontSize:13,fontWeight:600,color:tab===t?"#a78bfa":"#64748b",borderBottom:"2px solid "+(tab===t?"#7c3aed":"transparent"),textTransform:"capitalize"}}>{t==="drive"?"Drive":t}</button>))}
        </div>
        {tab==="posts" && !selectedPost && (
          loading ? <Spinner /> : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {posts.map(p=>{
                const media = p.media_urls?(typeof p.media_urls==="string"?JSON.parse(p.media_urls):p.media_urls):[];
                const thumb = media.find(u=>!u.match(/\.(mp4|mov|webm)$/i));
                return (
                  <div key={p.id} onClick={()=>setSelectedPost(p)} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:12,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                    {thumb && <img src={thumb} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0}} />}
                    <div style={{flex:1}}>
                      <div style={{fontFamily:CD,fontWeight:600,fontSize:14,color:"#e2e8f0"}}>{p.title}</div>
                      <div style={{fontSize:12,color:"#64748b"}}>{"Due "+p.due_date+(media.length>0?" - "+media.length+" file"+(media.length>1?"s":""):"")}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {p.fee_owed && <span style={{...chip("#ef4444"),fontSize:10}}>£5 FEE</span>}
                      <Badge status={p.status} />
                    </div>
                  </div>
                );
              })}
              {posts.length===0 && <p style={{color:"#4b5563",fontSize:14}}>No posts yet - check back soon.</p>}
            </div>
          )
        )}
        {tab==="posts" && selectedPost && <PostDetail post={selectedPost} posts={posts} setPosts={setPosts} role="client" onBack={()=>{ setSelectedPost(null); loadData(); }} />}
        {tab==="briefs" && <Briefs clientId={profile.id} role="client" />}
        {tab==="meetings" && <Meetings clientId={profile.id} role="client" />}
        {tab==="drive" && <ClientDrive clientId={profile.id} role="client" />}
        {tab==="analytics" && <Analytics clientId={profile.id} role="client" />}
      </main>
    </div>
  );
}
 
function TeamApp({ profile, onSignOut }) {
  const [view, setView] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [hubClient, setHubClient] = useState(null);
  const [agencyStatus, setAgencyStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ type:"ooo", message:"" });
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ business_name:"", contact_name:"", email:"", password:"" });
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
 
  const [pendingMeetings, setPendingMeetings] = useState(0);
 
  useEffect(()=>{ loadAll(); },[]);
  async function loadAll(){
    setLoading(true);
    try {
      const [cls,ps,st,mtgs] = await Promise.all([
        db("GET","profiles",null,"role=eq.client&order=created_at.desc"),
        db("GET","posts",null,"order=created_at.desc"),
        db("GET","agency_status",null,"id=eq.1"),
        db("GET","slots",null,"status=eq.pending"),
      ]);
      setClients(cls); setAllPosts(ps);
      if(st[0]&&st[0].type!=="online") setAgencyStatus(st[0]);
      setPendingMeetings(mtgs.length);
    } catch(e){}
    setLoading(false);
  }
  async function updateStatus(){ try { await db("PATCH","agency_status",{type:statusForm.type,message:statusForm.message},"id=eq.1"); setAgencyStatus(statusForm.type==="online"?null:statusForm); setShowStatusModal(false); } catch(e){ alert("Error."); } }
  async function createClient(){
    if(!newClient.business_name||!newClient.email||!newClient.password) return;
    setCreating(true);
    try {
      const authRes = await authSignUp(newClient.email, newClient.password);
      if(authRes.error){ alert("Error: "+authRes.error.message); setCreating(false); return; }
      const uid = authRes.user?.id||authRes.id;
      if(!uid){ alert("Could not create user."); setCreating(false); return; }
      await db("POST","profiles",{ id:uid, role:"client", business_name:newClient.business_name, contact_name:newClient.contact_name, email:newClient.email, color:COLORS[Math.floor(Math.random()*COLORS.length)], avatar:newClient.business_name.slice(0,2).toUpperCase() });
      setNewClient({business_name:"",contact_name:"",email:"",password:""}); setShowNewClient(false); loadAll();
    } catch(e){ alert("Error: "+e.message); }
    setCreating(false);
  }
 
  const stats={ clients:clients.length, pending:allPosts.filter(p=>p.status==="pending_approval").length, revision:allPosts.filter(p=>p.status==="revision_requested").length, fees:allPosts.filter(p=>p.fee_owed).length };
  const statusCfg={ online:{label:"Online",color:"#10b981"}, ooo:{label:"Out of Office",color:"#f59e0b"}, holiday:{label:"Bank Holiday",color:"#a78bfa"}, busy:{label:"High Volume",color:"#f87171"} };
  const curStatus = statusCfg[agencyStatus?.type||"online"];
 
  return (
    <div style={{fontFamily:ST,background:"#0a0a12",minHeight:"100vh",color:"#e2e8f0",display:"flex",height:"100vh",overflow:"hidden"}}>
      <aside style={{width:220,background:"#0d0d1a",borderRight:"1px solid #1e1e35",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"24px 20px",borderBottom:"1px solid #1e1e35"}}>
          <div style={{fontFamily:CD,fontWeight:700,fontSize:17,background:"linear-gradient(135deg,#a78bfa,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Affordable Socials</div>
          <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>Team Portal</div>
        </div>
        <nav style={{flex:1,padding:"12px 8px"}}>
          {[{id:"dashboard",label:"Dashboard"},{id:"clients",label:"Clients"},{id:"meetings",label:"All Meetings",dot:true},{id:"briefs",label:"All Briefs"},{id:"invites",label:"Invite Codes"}].map(item=>{
            const showDot = item.dot && pendingMeetings > 0;
            return (
              <button key={item.id} onClick={()=>{ setView(item.id); setHubClient(null); }} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,border:"none",background:view===item.id&&!hubClient?"rgba(124,58,237,0.15)":"transparent",color:view===item.id&&!hubClient?"#a78bfa":"#94a3b8",fontFamily:ST,fontSize:14,fontWeight:500,marginBottom:2,cursor:"pointer",textAlign:"left"}}>
                <span>{item.label}</span>
                {showDot && <span style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",display:"inline-block",flexShrink:0}} />}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"12px 8px",borderTop:"1px solid #1e1e35"}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6,paddingLeft:4}}>{profile.email}</div>
          <button onClick={onSignOut} style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",fontSize:13,fontFamily:ST,cursor:"pointer"}}>Sign Out</button>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        {hubClient && <ClientHub client={hubClient} role="team" agencyStatus={agencyStatus} />}
 
        {!hubClient && view==="dashboard" && (
          <div>
            <h1 style={{fontFamily:CD,fontSize:28,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Good day, team</h1>
            <p style={{color:"#64748b",fontSize:14,marginBottom:24}}>Here is your overview</p>
            <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:20,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:"#64748b",marginBottom:6}}>AGENCY STATUS</div>
                  <div style={{fontFamily:CD,fontWeight:600,color:curStatus.color,fontSize:15}}>{curStatus.label}</div>
                  {agencyStatus?.message && <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{agencyStatus.message}</div>}
                </div>
                <button onClick={()=>setShowStatusModal(true)} style={pbtn}>Update Status</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
              {[{label:"Active Clients",value:stats.clients,color:"#a78bfa"},{label:"Awaiting Approval",value:stats.pending,color:"#f59e0b"},{label:"Revision Requests",value:stats.revision,color:"#ef4444"},{label:"Fees Owed",value:stats.fees,color:"#10b981"}].map(s=>(
                <div key={s.label} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:"18px 20px"}}>
                  <div style={{fontFamily:CD,fontSize:30,fontWeight:700,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
            <h2 style={{fontFamily:CD,fontSize:17,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Needs Attention</h2>
            {loading ? <Spinner /> : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {allPosts.filter(p=>p.status==="revision_requested"||p.status==="pending_approval").map(post=>{
                  const cl=clients.find(c=>c.id===post.client_id);
                  const media = post.media_urls?(typeof post.media_urls==="string"?JSON.parse(post.media_urls):post.media_urls):[];
                  const thumb = media.find(u=>!u.match(/\.(mp4|mov|webm)$/i));
                  return (
                    <div key={post.id} onClick={()=>{ if(cl){ setHubClient(cl); setView("clients"); } }} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:12,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                      {thumb ? <img src={thumb} alt="" style={{width:40,height:40,borderRadius:6,objectFit:"cover",flexShrink:0}} /> : cl ? <Ava initials={(cl.business_name||"?").slice(0,2).toUpperCase()} color={cl.color||"#7c3aed"} size={32} /> : null}
                      <div style={{flex:1}}>
                        <div style={{fontFamily:CD,fontWeight:600,fontSize:14,color:"#e2e8f0"}}>{post.title}</div>
                        <div style={{fontSize:12,color:"#64748b"}}>{(cl?cl.business_name+" - ":"")+"Due "+post.due_date}</div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {post.fee_owed && <span style={{...chip("#ef4444"),fontSize:10}}>£5 FEE</span>}
                        <Badge status={post.status} />
                      </div>
                    </div>
                  );
                })}
                {allPosts.filter(p=>p.status==="revision_requested"||p.status==="pending_approval").length===0 && <p style={{color:"#4b5563",fontSize:14}}>All clear!</p>}
              </div>
            )}
            {showStatusModal && (
              <Modal onClose={()=>setShowStatusModal(false)} title="Update Agency Status">
                <div style={{marginBottom:14}}><label style={lab}>Status</label><select value={statusForm.type} onChange={e=>setStatusForm(p=>({...p,type:e.target.value}))} style={inp}>{Object.entries(statusCfg).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                <div style={{marginBottom:18}}><label style={lab}>Message to clients</label><textarea value={statusForm.message} onChange={e=>setStatusForm(p=>({...p,message:e.target.value}))} style={{...inp,height:80,resize:"vertical"}} placeholder="e.g. Back Monday 2nd June..." /></div>
                <div style={{display:"flex",gap:10}}><button onClick={updateStatus} style={{...pbtn,flex:1}}>Apply to All Clients</button><button onClick={()=>setShowStatusModal(false)} style={{...gbtn,flex:1}}>Cancel</button></div>
              </Modal>
            )}
          </div>
        )}
 
        {!hubClient && view==="clients" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div><h1 style={{fontFamily:CD,fontSize:28,fontWeight:700,color:"#f1f5f9"}}>Clients</h1><p style={{color:"#64748b",fontSize:14}}>{clients.length+" active clients"}</p></div>
              <button onClick={()=>setShowNewClient(true)} style={pbtn}>+ Add Client</button>
            </div>
            {loading ? <Spinner /> : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
                {clients.map(cl=>{ const cp=allPosts.filter(p=>p.client_id===cl.id); return (
                  <div key={cl.id} onClick={()=>setHubClient(cl)} style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:14,padding:20,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <Ava initials={(cl.business_name||"?").slice(0,2).toUpperCase()} color={cl.color||"#7c3aed"} size={44} />
                      <div><div style={{fontFamily:CD,fontWeight:600,fontSize:15,color:"#f1f5f9"}}>{cl.business_name}</div><div style={{fontSize:12,color:"#64748b"}}>{cl.contact_name}</div></div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={chip("#6b7280")}>{cp.length+" posts"}</span>
                      {cp.filter(p=>p.status==="pending_approval").length>0 && <span style={chip("#f59e0b")}>{cp.filter(p=>p.status==="pending_approval").length+" pending"}</span>}
                      {cp.filter(p=>p.status==="revision_requested").length>0 && <span style={chip("#ef4444")}>{cp.filter(p=>p.status==="revision_requested").length+" revision"}</span>}
                      {cp.some(p=>p.fee_owed) && <span style={chip("#10b981")}>fee owed</span>}
                    </div>
                  </div>
                );})}
              </div>
            )}
            {showNewClient && (
              <Modal onClose={()=>setShowNewClient(false)} title="Add New Client">
                <p style={{fontSize:12,color:"#64748b",marginBottom:16}}>This creates a login for the client. Share their email and password with them.</p>
                {[["Business Name","business_name","text"],["Contact Person","contact_name","text"],["Email","email","email"],["Password (share with client)","password","password"]].map(([label,key,type])=>(
                  <div key={key} style={{marginBottom:14}}><label style={lab}>{label}</label><input type={type} value={newClient[key]} onChange={e=>setNewClient(p=>({...p,[key]:e.target.value}))} style={inp} placeholder={label} /></div>
                ))}
                <button onClick={createClient} disabled={creating} style={{...pbtn,width:"100%",marginTop:8,opacity:creating?0.6:1}}>{creating?"Creating...":"Add Client"}</button>
              </Modal>
            )}
          </div>
        )}
 
        {!hubClient && view==="meetings" && (
          <div>
            <h1 style={{fontFamily:CD,fontSize:28,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>All Meetings</h1>
            <p style={{color:"#64748b",fontSize:14,marginBottom:24}}>Manage all client meeting requests</p>
            <Meetings clientId={null} role="team" />
          </div>
        )}
        {!hubClient && view==="briefs" && (
          <div>
            <h1 style={{fontFamily:CD,fontSize:28,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>All Briefs</h1>
            <p style={{color:"#64748b",fontSize:14,marginBottom:24}}>Weekly content briefs from all clients</p>
            <Briefs clientId={null} role="team" />
          </div>
        )}
        {!hubClient && view==="invites" && (
          <div>
            <h1 style={{fontFamily:CD,fontSize:28,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Invite Codes</h1>
            <p style={{color:"#64748b",fontSize:14,marginBottom:24}}>Manage client sign-up codes</p>
            <InviteCodes />
          </div>
        )}
      </main>
    </div>
  );
}
 
export default function App() {
  const [screen, setScreen] = useState("login");
  const [loginType, setLoginType] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupBusiness, setSignupBusiness] = useState("");
  const [signupContact, setSignupContact] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
 
  useEffect(()=>{
    const saved = localStorage.getItem("as_session");
    if(saved){ try { const s=JSON.parse(saved); setSession(s.session); setProfile(s.profile); } catch(e){ localStorage.removeItem("as_session"); } }
  },[]);
 
  async function signIn() {
    setError(""); setLoading(true);
    try {
      const res = await authSignIn(email, password);
      if(res.error){ setError(res.error.message); setLoading(false); return; }
      const uid = res.user?.id;
      const profs = await db("GET","profiles",null,"id=eq."+uid);
      if(!profs||profs.length===0){ setError("Profile not found. Contact support."); setLoading(false); return; }
      const sess = {token:res.access_token,uid};
      setSession(sess); setProfile(profs[0]);
      localStorage.setItem("as_session", JSON.stringify({session:sess, profile:profs[0]}));
    } catch(e){ setError("Sign in failed. Check your details."); }
    setLoading(false);
  }
  async function signUp() {
    setError(""); setLoading(true);
    try {
      const codes = await db("GET","invite_codes",null,"code=eq."+inviteCode.toUpperCase().trim()+"&used=eq.false");
      if(!codes||codes.length===0){ setError("Invalid or already used invite code."); setLoading(false); return; }
      const res = await authSignUp(signupEmail, signupPassword);
      if(res.error){ setError(res.error.message); setLoading(false); return; }
      const uid = res.user?.id||res.id;
      if(!uid){ setError("Could not create account."); setLoading(false); return; }
      await db("POST","profiles",{id:uid,role:"client",business_name:signupBusiness,contact_name:signupContact,email:signupEmail,color:COLORS[Math.floor(Math.random()*COLORS.length)],avatar:signupBusiness.slice(0,2).toUpperCase()});
      await db("PATCH","invite_codes",{used:true},"id=eq."+codes[0].id);
      setError("Account created! Please sign in."); setScreen("login"); setLoginType("client"); setEmail(signupEmail);
    } catch(e){ setError("Sign up failed: "+e.message); }
    setLoading(false);
  }
  function signOut(){ localStorage.removeItem("as_session"); setSession(null); setProfile(null); setScreen("login"); setLoginType(null); setEmail(""); setPassword(""); }
 
  if(session&&profile){
    if(profile.role==="team") return <TeamApp profile={profile} onSignOut={signOut} />;
    return <ClientApp profile={profile} onSignOut={signOut} />;
  }
 
  return (
    <div style={{fontFamily:ST,background:"#0a0a12",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600&display=swap" />
      <style>{"*{box-sizing:border-box;margin:0;padding:0} @keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{width:"100%",maxWidth:420,padding:20}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,borderRadius:18,marginBottom:16,background:"linear-gradient(135deg,#7c3aed,#2563eb)",boxShadow:"0 8px 32px rgba(124,58,237,0.4)",fontFamily:CD,fontWeight:700,fontSize:18,color:"#fff"}}>AS</div>
          <h1 style={{fontFamily:CD,fontSize:26,fontWeight:700,background:"linear-gradient(135deg,#a78bfa,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Affordable Socials</h1>
          <p style={{color:"#4b5563",fontSize:14,marginTop:6}}>Client Management Portal</p>
        </div>
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:20,padding:28}}>
          {!loginType && (
            <div>
              <p style={{color:"#94a3b8",fontSize:14,textAlign:"center",marginBottom:20}}>Sign in as</p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <button onClick={()=>setLoginType("team")} style={{padding:"14px 20px",borderRadius:12,border:"1px solid #2d2d4e",background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))",color:"#e2e8f0",fontFamily:ST,fontSize:15,fontWeight:600,cursor:"pointer"}}>Affordable Socials Team</button>
                <button onClick={()=>setLoginType("client")} style={{padding:"14px 20px",borderRadius:12,border:"1px solid #2d2d4e",background:"transparent",color:"#94a3b8",fontFamily:ST,fontSize:15,fontWeight:500,cursor:"pointer"}}>I am a Client</button>
              </div>
            </div>
          )}
          {loginType && screen==="login" && (
            <div>
              <button onClick={()=>{ setLoginType(null); setError(""); }} style={{background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",marginBottom:16}}>Back</button>
              <div style={{marginBottom:14}}><label style={lab}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="your@email.com" /></div>
              <div style={{marginBottom:18}}><label style={lab}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&signIn()} style={inp} placeholder="Password" /></div>
              {error && <p style={{color:error.includes("created")?"#10b981":"#f87171",fontSize:13,marginBottom:12}}>{error}</p>}
              <button onClick={signIn} disabled={loading} style={{...pbtn,width:"100%",opacity:loading?0.6:1}}>{loading?"Signing in...":"Sign In"}</button>
              {loginType==="client" && <button onClick={()=>{ setScreen("signup"); setError(""); }} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer"}}>New client? Sign up with invite code</button>}
            </div>
          )}
          {loginType==="client" && screen==="signup" && (
            <div>
              <button onClick={()=>{ setScreen("login"); setError(""); }} style={{background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",marginBottom:16}}>Back to sign in</button>
              <h3 style={{fontFamily:CD,fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:16}}>Create your account</h3>
              {[["Business Name","text",signupBusiness,setSignupBusiness],["Your Name","text",signupContact,setSignupContact],["Email","email",signupEmail,setSignupEmail],["Password","password",signupPassword,setSignupPassword],["Invite Code","text",inviteCode,setInviteCode]].map(([label,type,val,setter])=>(
                <div key={label} style={{marginBottom:14}}><label style={lab}>{label}</label><input type={type} value={val} onChange={e=>setter(e.target.value)} style={inp} placeholder={label} /></div>
              ))}
              {error && <p style={{color:error.includes("created")?"#10b981":"#f87171",fontSize:13,marginBottom:12}}>{error}</p>}
              <button onClick={signUp} disabled={loading} style={{...pbtn,width:"100%",opacity:loading?0.6:1}}>{loading?"Creating account...":"Create Account"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
