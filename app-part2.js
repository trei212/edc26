/* ─── SEARCH BAR ─────────────────────────────────────────────────────── */
function SearchBar({value,onChange,onSelect,allSets}){
  const[open,setOpen]=React.useState(false);
  const suggestions=React.useMemo(()=>{
    if(!value.trim()||value.length<2)return[];
    const q=value.toLowerCase();
    const seen=new Set();
    return allSets.filter(s=>s.artist.toLowerCase().includes(q)||STAGE_CFG[s.stage]?.label.toLowerCase().includes(q)||s.g.toLowerCase().includes(q)).filter(s=>{if(seen.has(s.artist))return false;seen.add(s.artist);return true;}).slice(0,6);
  },[value,allSets]);
  React.useEffect(()=>{setOpen(suggestions.length>0);},[suggestions]);
  return(
    <div style={{position:'relative',zIndex:50}}>
      <div style={{position:'relative'}}>
        <img src={ACT_IC('action-search')} alt="" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:16,height:16,mixBlendMode:'screen',opacity:.55,pointerEvents:'none'}}/>
        <input value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setOpen(suggestions.length>0)} onBlur={()=>setTimeout(()=>setOpen(false),150)} placeholder="SEARCH ARTISTS, STAGES, GENRES…"
          style={{width:'100%',background:'#000',border:'2px solid rgba(255,255,255,.18)',borderRadius:12,padding:'10px 36px 10px 34px',color:'#fff',fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif',textTransform:'uppercase',letterSpacing:'.04em'}}/>
        {value&&<button onClick={()=>{onChange('');setOpen(false);}} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:18,opacity:.4,padding:4,color:'#fff',background:'none',border:'none',cursor:'pointer'}}>×</button>}
      </div>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'#000',border:'2px solid rgba(255,255,255,.18)',borderRadius:12,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.8)'}}>
          {suggestions.map(s=>{const sc=STAGE_CFG[s.stage];return(
            <div key={s.id} onMouseDown={()=>{onSelect(s);setOpen(false);}} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.08)'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <img src={EMB(sc.key)} alt="" style={{width:36,height:26,objectFit:'contain',flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textTransform:'uppercase'}}>{s.artist}</div>
                <div style={{display:'flex',gap:6,alignItems:'center',marginTop:2}}>
                  <span style={{fontFamily:'DM Sans,sans-serif',fontSize:9,color:GENRES[s.g]?.color||'#888',fontWeight:700,textTransform:'uppercase'}}>{s.g}</span>
                </div>
              </div>
              <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.3)',flexShrink:0}}>{fmtT(s.s)}</span>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

/* ─── LINEUP SCREEN ──────────────────────────────────────────────────── */
function LineupScreen({selected,toggleSet,recon,sharedIds}){
  const[view,setView]=React.useState('byday');
  const[day,setDay]=React.useState(1);
  const[search,setSearch]=React.useState('');
  const[genreFilter,setGenreFilter]=React.useState('ALL');
  const now=useClock();const phase=getFestPhase(now);const nowDay=phase.phase==='live'?phase.day:null;
  const allMainSets=React.useMemo(()=>SCHEDULE.filter(s=>MAIN_STAGES.includes(s.stage)),[]);
  const filtered=React.useMemo(()=>{
    let sets=allMainSets;
    if(search.trim()){const q=search.toLowerCase();sets=sets.filter(s=>s.artist.toLowerCase().includes(q)||STAGE_CFG[s.stage]?.label.toLowerCase().includes(q)||s.g.toLowerCase().includes(q));}
    if(genreFilter!=='ALL')sets=sets.filter(s=>s.g===genreFilter);
    return sets;
  },[search,genreFilter,allMainSets]);
  const displaySets=React.useMemo(()=>{
    if(view==='alpha')return[...filtered].sort((a,b)=>a.artist.localeCompare(b.artist));
    if(view==='grid')return filtered;
    return filtered.filter(s=>s.day===day).sort((a,b)=>toM(a.s)-toM(b.s));
  },[filtered,view,day]);
  if(view==='grid')return<GridView selected={selected} toggleSet={toggleSet} recon={recon} sharedIds={sharedIds} onBack={()=>setView('byday')} allMainSets={allMainSets}/>;
  const headerImg=view==='alpha'?H('header-schedule.webp'):H('header-byday.webp');
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={headerImg} height={120} title="LINEUP" copy={COPY.schedule}/>
        <div style={{padding:'10px 16px 0',background:'#000'}}>
          <div style={{marginBottom:10}}><SearchBar value={search} onChange={setSearch} onSelect={s=>{setSearch('');setView('byday');setDay(s.day);}} allSets={allMainSets}/></div>
          <div style={{display:'flex',gap:6,marginBottom:10,alignItems:'center'}}>
            {[['byday','BY DAY'],['alpha','A–Z'],['grid','GRID']].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:'7px 14px',borderRadius:20,fontWeight:700,fontSize:10,fontFamily:'Sora,sans-serif',letterSpacing:'.05em',background:view===v?STAGE_CFG.kineticFIELD.p:'#000',color:view===v?'#000':'rgba(255,255,255,.45)',border:`2px solid ${view===v?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.2)'}`,cursor:'pointer'}}>{l}</button>
            ))}
            {view==='byday'&&(
              <div style={{display:'flex',gap:4,marginLeft:'auto'}}>
                {[['FRI',1],['SAT',2],['SUN',3]].map(([l,d])=>(
                  <button key={d} onClick={()=>setDay(d)} style={{padding:'5px 11px',borderRadius:16,fontWeight:700,fontSize:10,fontFamily:'Sora,sans-serif',background:'#000',color:day===d?'#fff':'rgba(255,255,255,.3)',border:`2px solid ${day===d?'rgba(255,255,255,.5)':'rgba(255,255,255,.18)'}`,position:'relative',cursor:'pointer'}}>
                    {l}{nowDay===d&&<span style={{position:'absolute',top:-2,right:-2,width:6,height:6,borderRadius:'50%',background:'#ff2d78'}}/>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:10}}>
            {['ALL',...Object.keys(GENRES)].map(g=>{const act=genreFilter===g;const color=GENRES[g]?.color||STAGE_CFG.kineticFIELD.p;return(
              <button key={g} onClick={()=>setGenreFilter(g)} style={{flexShrink:0,padding:'4px 11px',borderRadius:20,fontSize:9,fontWeight:700,fontFamily:'DM Sans,sans-serif',letterSpacing:'.05em',textTransform:'uppercase',background:'#000',border:`2px solid ${act?color:'rgba(255,255,255,.16)'}`,color:act?color:'rgba(255,255,255,.32)',display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}>
                {GENRES[g]&&<span style={{width:6,height:6,borderRadius:'50%',background:color,display:'inline-block'}}/>}{g}
              </button>
            );})}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'6px 16px 104px',background:'#000'}}>
        {displaySets.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'rgba(255,255,255,.2)',fontSize:13,fontStyle:'italic'}}>{search||genreFilter!=='ALL'?'No artists match.':'Nothing here.'}</div>}
        {displaySets.map(s=><SetCard key={s.id} set={s} selected={selected} onToggle={toggleSet} recon={recon} sharedIds={sharedIds}/>)}
      </div>
    </div>
  );
}

/* ─── GRID VIEW ──────────────────────────────────────────────────────── */
function GridView({selected,toggleSet,recon,sharedIds,onBack,allMainSets}){
  const[day,setDay]=React.useState(1);const now=useClock();const phase=getFestPhase(now);
  const ROW_H=70,LCOL=70,HOUR_W=84;const FEST_START=17*60,FEST_END=29*60+30;const TOTAL=FEST_END-FEST_START;
  const hours=Array.from({length:13},(_,i)=>17+i);
  const daySets=React.useMemo(()=>SCHEDULE.filter(s=>s.day===day&&MAIN_STAGES.includes(s.stage)),[day]);
  let nowX=null;
  if(phase.phase==='live'&&phase.day===day){const elapsed=(now-phase.dayStart.getTime())/60000;nowX=((17*60+elapsed-FEST_START)/TOTAL)*(hours.length*HOUR_W);}
  const TOTAL_W=hours.length*HOUR_W;
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={H('header-grid.webp')} height={110} title="GRID" copy={COPY.grid}
          extra={<div style={{display:'flex',gap:6,alignItems:'center'}}>
            <button onClick={onBack} style={{fontSize:12,padding:'5px 10px',border:'2px solid rgba(255,255,255,.2)',borderRadius:8,color:'rgba(255,255,255,.5)',background:'#000',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700}}>← LINEUP</button>
            {[['FRI',1],['SAT',2],['SUN',3]].map(([l,d])=>(
              <button key={d} onClick={()=>setDay(d)} style={{padding:'5px 14px',borderRadius:16,fontWeight:700,fontSize:10,fontFamily:'Sora,sans-serif',background:day===d?STAGE_CFG.kineticFIELD.p:'#000',color:day===d?'#000':'rgba(255,255,255,.4)',border:`2px solid ${day===d?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.2)'}`,cursor:'pointer'}}>{l}</button>
            ))}
          </div>}
        />
      </div>
      <div style={{flex:1,overflow:'auto',background:'#000'}}>
        <div style={{minWidth:LCOL+TOTAL_W+20}}>
          {/* Time header */}
          <div style={{display:'flex',position:'sticky',top:0,zIndex:30,background:'#000',borderBottom:'2px solid rgba(255,255,255,.14)'}}>
            <div style={{width:LCOL,flexShrink:0,borderRight:'2px solid rgba(255,255,255,.1)'}}/>
            {hours.map(h=>(
              <div key={h} style={{width:HOUR_W,flexShrink:0,padding:'8px 0',textAlign:'center',borderRight:'1px solid rgba(255,255,255,.08)'}}>
                <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.5)',fontWeight:700}}>{h>=24?(h-24)+':00':h+':00'}</span>
              </div>
            ))}
          </div>
          {/* Stage rows */}
          {MAIN_STAGES.map(sg=>{
            const sc=STAGE_CFG[sg];const stageSets=daySets.filter(s=>s.stage===sg);
            return(
              <div key={sg} style={{display:'flex',borderBottom:'2px solid rgba(255,255,255,.1)',minHeight:ROW_H}}>
                <div style={{width:LCOL,flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:'6px 4px',borderRight:'2px solid rgba(255,255,255,.1)',background:'#000',position:'sticky',left:0,zIndex:10}}>
                  <img src={EMB(sc.key)} alt={sc.label} style={{width:52,height:38,objectFit:'contain'}}/>
                </div>
                <div style={{position:'relative',flex:1,minHeight:ROW_H,background:'#000'}}>
                  {hours.map(h=><div key={h} style={{position:'absolute',left:((h*60-FEST_START)/TOTAL)*TOTAL_W,top:0,bottom:0,width:1,background:'rgba(255,255,255,.07)'}}/>)}
                  {nowX!==null&&<div style={{position:'absolute',left:nowX,top:0,bottom:0,width:2,background:'#ff2d78',zIndex:20}}/>}
                  {stageSets.map(s=>{
                    const isSel=selected.includes(s.id);const isShared=sharedIds?.includes(s.id);const rec=recon[s.id]||s;
                    const left=((toM(s.s)-FEST_START)/TOTAL)*TOTAL_W;const width=Math.max(((toM(s.e)-toM(s.s))/TOTAL)*TOTAL_W-2,28);
                    return(
                      <div key={s.id} onClick={()=>toggleSet(s.id)} style={{position:'absolute',left,width,top:5,bottom:5,background:isSel?sc.p:`${sc.p}22`,border:`2px solid ${isSel?sc.p:sc.p+'55'}`,borderRadius:7,padding:'4px 6px',overflow:'hidden',cursor:'pointer',transition:'all .14s'}}>
                        <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:7.5,color:isSel?'#000':'rgba(255,255,255,.8)',lineHeight:1.2,textTransform:'uppercase'}}>
                          {s.artist.replace(/\s+B2B\s+/g,' B2B ').split(' B2B ').map((p,i,a)=>(
                            <span key={i} style={{display:'block'}}>{p}{i<a.length-1&&<span style={{fontSize:5.5,opacity:.6,marginLeft:2}}>B2B</span>}</span>
                          ))}
                        </div>
                        {isSel&&width>60&&<div style={{fontFamily:'Space Mono,monospace',fontSize:5.5,color:'rgba(0,0,0,.7)',marginTop:2}}>{fmtT(rec.cs)}–{fmtT(rec.ce)}</div>}
                        {isShared&&!isSel&&<div style={{position:'absolute',top:3,right:3,width:5,height:5,borderRadius:'50%',background:sc.p}}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── CATCH BAR COMPONENT (for export) ──────────────────────────────── */
function CatchBar({set,rec,color,secColor,width=120}){
  const totalMins=toM(set.e)-toM(set.s);const catchMins=toM(rec.ce)-toM(rec.cs);const isFull=catchMins>=totalMins-1;
  if(isFull)return(
    <div style={{textAlign:'right'}}>
      <div style={{width,height:8,borderRadius:4,background:color,margin:'0 0 4px auto'}}/>
      <div style={{fontFamily:'Space Mono,monospace',fontSize:8,color,letterSpacing:'.1em',textTransform:'uppercase'}}>FULL SET</div>
    </div>
  );
  const catchLeft=((toM(rec.cs)-toM(set.s))/totalMins)*width;const catchW=Math.max(6,(catchMins/totalMins)*width);
  return(
    <div style={{textAlign:'right'}}>
      <div style={{width,height:8,borderRadius:4,background:'rgba(255,255,255,.14)',position:'relative',margin:'0 0 4px auto',overflow:'hidden',border:'1px solid rgba(255,255,255,.2)'}}>
        <div style={{position:'absolute',left:Math.max(0,catchLeft),width:Math.min(catchW,width-catchLeft),height:'100%',background:color,borderRadius:4}}/>
      </div>
      <div style={{fontFamily:'Space Mono,monospace',fontSize:7.5,color:secColor||color,letterSpacing:'.05em'}}>{fmtT(rec.cs)} – {fmtT(rec.ce)}</div>
    </div>
  );
}

/* ─── EXPORT TEMPLATES ───────────────────────────────────────────────── */
// Wire art SVG for canvas rendering (simplified)
function drawWireArt(ctx,W,H,alpha=0.35){
  ctx.save();ctx.globalAlpha=alpha;
  // Ground roll
  ctx.strokeStyle='#fc3cbf';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,H*.82);ctx.bezierCurveTo(W*.25,H*.78,W*.5,H*.84,W*.75,H*.79);ctx.bezierCurveTo(W*.88,H*.76,W*.95,H*.8,W,H*.8);ctx.stroke();
  // Lotus center
  const lx=W/2,ly=H*.72;ctx.strokeStyle='#ec4ca4';ctx.lineWidth=1.2;
  for(let i=0;i<7;i++){const a=(i/7)*Math.PI;const r1=W*.08,r2=W*.13;ctx.beginPath();ctx.moveTo(lx+r1*Math.cos(Math.PI+a),ly-r1*Math.sin(a));ctx.quadraticCurveTo(lx,ly-W*.1,lx+r1*Math.cos(a),ly-r1*Math.sin(a));ctx.stroke();}
  ctx.strokeStyle='#0bf5f8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(lx,ly,W*.04,Math.PI,0);ctx.stroke();
  // Ferris wheel right
  const fx=W*.8,fy=H*.35,fr=W*.1;ctx.strokeStyle='#2582f6';ctx.lineWidth=1;ctx.beginPath();ctx.arc(fx,fy,fr,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+fr*Math.cos(a),fy+fr*Math.sin(a));ctx.stroke();}
  // Tower left
  ctx.strokeStyle='#2b96ef';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(W*.18,H*.85);ctx.lineTo(W*.2,H*.15);ctx.stroke();ctx.beginPath();ctx.ellipse(W*.2,H*.28,W*.025,H*.02,0,0,Math.PI*2);ctx.stroke();
  // Pyramids
  ctx.strokeStyle='#fc3cbf';ctx.lineWidth=1;[{x:W*.32,w:W*.06},{x:W*.4,w:W*.04}].forEach(p=>{ctx.beginPath();ctx.moveTo(p.x-p.w,H*.85);ctx.lineTo(p.x,H*.6);ctx.lineTo(p.x+p.w,H*.85);ctx.stroke();});
  // Owl face center top
  const ox=W*.5,oy=H*.12;ctx.strokeStyle='#fc3cbf';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(ox,oy,W*.04,W*.05,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#0bf5f8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox-W*.015,oy-W*.01,W*.012,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(ox+W*.015,oy-W*.01,W*.012,0,Math.PI*2);ctx.stroke();
  // Stars
  [[.1,.08],[.3,.05],[.65,.06],[.85,.1],[.45,.03],[.7,.15],[.2,.2]].forEach(([sx,sy])=>{ctx.fillStyle='#fc3cbf';ctx.beginPath();ctx.arc(W*sx,H*sy,2,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}

async function renderPoster(canvas,selSets,recon,day,markers){
  const W=canvas.width,H=canvas.height;const ctx=canvas.getContext('2d');
  await document.fonts.ready;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  drawWireArt(ctx,W,H,.28);
  // Overlay
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.4,'rgba(0,0,0,.25)');g.addColorStop(.7,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,.85)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const pad=W*.055;let y=H*.07;
  // EDC wordmark
  ctx.font=`900 ${W*.14}px Orbitron,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('edc',W/2,y+W*.1);y+=W*.115;
  ctx.font=`300 ${W*.025}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.35)';ctx.letterSpacing=`${W*.014}px`;ctx.fillText(`LAS VEGAS 2026 · ${DAYS_LABEL[day-1].toUpperCase()}`,W/2,y);ctx.letterSpacing='0px';y+=H*.022;
  // Divider
  const dg=ctx.createLinearGradient(pad,0,W-pad,0);dg.addColorStop(0,'transparent');dg.addColorStop(.5,'rgba(255,255,255,.3)');dg.addColorStop(1,'transparent');
  ctx.strokeStyle=dg;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();y+=H*.025;
  // Sort items
  const allItems=[...markers.filter(m=>!m.day||m.day===day).map(m=>({type:'marker',data:m})),...selSets.map(s=>({type:'set',data:s}))].sort((a,b)=>{const ta=a.type==='marker'?toM(a.data.time||'19:00'):toM(a.data.s);const tb=b.type==='marker'?toM(b.data.time||'19:00'):toM(b.data.s);return ta-tb;});
  // Billing sizes — bigger for earlier/headliner slots
  const sz=[W*.06,W*.052,W*.046,W*.042,W*.038,W*.035,W*.032];
  let setIdx=0;
  for(const item of allItems){
    if(y>H*.9)break;
    if(item.type==='marker'){
      const mc=item.data.color||'#FFD700';const mg=ctx.createLinearGradient(pad,0,W-pad,0);mg.addColorStop(0,'transparent');mg.addColorStop(.5,mc+'66');mg.addColorStop(1,'transparent');
      ctx.strokeStyle=mg;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,y+6);ctx.lineTo(W-pad,y+6);ctx.stroke();
      ctx.font=`700 ${W*.022}px Space Mono,monospace`;ctx.fillStyle=mc;ctx.textAlign='center';ctx.fillText(`${item.data.label||''}${item.data.time?' · '+fmtT(item.data.time):''}`,W/2,y+18);
      y+=H*.04;continue;
    }
    const s=item.data;const sc=STAGE_CFG[s.stage];const rec=recon[s.id]||s;const gc=GENRES[s.g]||GENRES['Electronic'];
    const artSz=sz[Math.min(setIdx,sz.length-1)];const lineH=artSz*1.1;
    // Left bar
    ctx.fillStyle=sc.p;ctx.fillRect(pad,y,W*.008,lineH);
    // Genre dot
    ctx.fillStyle=gc.color;ctx.beginPath();ctx.arc(pad+W*.02,y+lineH*.25,W*.008,0,Math.PI*2);ctx.fill();
    // Artist name LEFT
    ctx.font=`800 ${artSz}px Sora,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='left';
    let aText=s.artist;const maxW=(W-pad*2)*.62;while(ctx.measureText(aText).width>maxW&&aText.length>4)aText=aText.slice(0,-1);if(aText!==s.artist)aText+='…';
    ctx.fillText(aText,pad+W*.035,y+lineH*.6);
    // Genre text
    ctx.font=`700 ${W*.02}px DM Sans,sans-serif`;ctx.fillStyle=gc.color;ctx.fillText(s.g.toUpperCase(),pad+W*.035,y+lineH*.95);
    // Catch bar RIGHT
    const totalM=toM(s.e)-toM(s.s);const catchM=toM(rec.ce)-toM(rec.cs);const isFull=catchM>=totalM-1;
    const barW=W*.25;const barX=W-pad-barW;const barH=W*.012;const barY=y+lineH*.35;
    ctx.fillStyle='rgba(255,255,255,.14)';roundRect(ctx,barX,barY,barW,barH,barH/2);ctx.fill();
    if(isFull){ctx.fillStyle=sc.p;roundRect(ctx,barX,barY,barW,barH,barH/2);ctx.fill();}
    else{const cL=((toM(rec.cs)-toM(s.s))/totalM)*barW;const cW=Math.max(6,(catchM/totalM)*barW);ctx.fillStyle=sc.p;roundRect(ctx,barX+cL,barY,cW,barH,barH/2);ctx.fill();}
    ctx.font=`400 ${W*.016}px Space Mono,monospace`;ctx.fillStyle=isFull?sc.p:sc.s;ctx.textAlign='right';
    ctx.fillText(isFull?'FULL SET':`${fmtT(rec.cs)} – ${fmtT(rec.ce)}`,W-pad,y+lineH*.82);
    y+=lineH+H*.018;setIdx++;
  }
  // Footer
  ctx.font=`300 ${W*.018}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.18)';ctx.textAlign='center';ctx.fillText('MY EDC LV 2026 · UNDER THE ELECTRIC SKY',W/2,H*.965);
}

async function renderTicket(canvas,selSets,recon,day,markers){
  const W=canvas.width,H=canvas.height;const ctx=canvas.getContext('2d');
  await document.fonts.ready;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  drawWireArt(ctx,W,H,.18);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const pad=W*.055;let y=H*.06;
  ctx.font=`900 ${W*.12}px Orbitron,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('edc',W/2,y+W*.085);y+=W*.1;
  ctx.font=`300 ${W*.022}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillText(`LAS VEGAS 2026 · ${DAYS_LABEL[day-1].toUpperCase()}`,W/2,y);y+=H*.02;
  // Admit badge
  ctx.fillStyle=STAGE_CFG.kineticFIELD.p;roundRect(ctx,W/2-W*.12,y,W*.24,H*.032,H*.008);ctx.fill();
  ctx.font=`700 ${W*.022}px Space Mono,monospace`;ctx.fillStyle='#000';ctx.textAlign='center';ctx.fillText('ADMIT ONE',W/2,y+H*.022);y+=H*.048;
  // Dashed line
  ctx.setLineDash([6,4]);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();ctx.setLineDash([]);y+=H*.02;
  // Ticket rows
  const allItems=[...markers.filter(m=>!m.day||m.day===day).map(m=>({type:'marker',data:m})),...selSets.map(s=>({type:'set',data:s}))].sort((a,b)=>{const ta=a.type==='marker'?toM(a.data.time||'19:00'):toM(a.data.s);const tb=b.type==='marker'?toM(b.data.time||'19:00'):toM(b.data.s);return ta-tb;});
  const rowH=H*.095;
  for(const item of allItems){
    if(y+rowH>H*.87)break;
    if(item.type==='marker'){
      const mc=item.data.color||'#FFD700';ctx.strokeStyle=mc+'55';ctx.setLineDash([4,3]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,y+rowH/2);ctx.lineTo(W-pad,y+rowH/2);ctx.stroke();ctx.setLineDash([]);
      ctx.font=`700 ${W*.02}px Space Mono,monospace`;ctx.fillStyle=mc;ctx.textAlign='center';ctx.fillText(item.data.label||'',W/2,y+rowH/2+6);y+=rowH*.6;continue;
    }
    const s=item.data;const sc=STAGE_CFG[s.stage];const rec=recon[s.id]||s;const gc=GENRES[s.g]||GENRES['Electronic'];
    // Row bg alternate
    ctx.fillStyle=`${sc.p}0a`;ctx.fillRect(pad,y,W-pad*2,rowH);
    // Left border bar
    ctx.fillStyle=sc.p;ctx.fillRect(pad,y,W*.008,rowH);
    // Artist
    ctx.font=`800 ${W*.038}px Sora,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='left';
    let aText=s.artist;while(ctx.measureText(aText).width>W*.54&&aText.length>4)aText=aText.slice(0,-1);if(aText!==s.artist)aText+='…';
    ctx.fillText(aText,pad+W*.025,y+rowH*.44);
    // Genre + time
    ctx.font=`700 ${W*.02}px DM Sans,sans-serif`;ctx.fillStyle=gc.color;ctx.fillText(s.g.toUpperCase(),pad+W*.025,y+rowH*.76);
    ctx.font=`400 ${W*.018}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillText(fmtT(s.s),pad+W*.025+ctx.measureText(s.g.toUpperCase()).width+W*.03,y+rowH*.76);
    // Catch bar right
    const barW=W*.26;const totalM=toM(s.e)-toM(s.s);const catchM=toM(rec.ce)-toM(rec.cs);const isFull=catchM>=totalM-1;
    const bx=W-pad-barW,by=y+rowH*.3,bh=W*.011;
    ctx.fillStyle='rgba(255,255,255,.14)';roundRect(ctx,bx,by,barW,bh,bh/2);ctx.fill();
    if(isFull){ctx.fillStyle=sc.p;roundRect(ctx,bx,by,barW,bh,bh/2);ctx.fill();}
    else{const cL=((toM(rec.cs)-toM(s.s))/totalM)*barW;const cW=Math.max(6,(catchM/totalM)*barW);ctx.fillStyle=sc.p;roundRect(ctx,bx+Math.max(0,cL),by,Math.min(cW,barW-cL),bh,bh/2);ctx.fill();}
    ctx.font=`700 ${W*.016}px Space Mono,monospace`;ctx.fillStyle=isFull?sc.p:sc.s;ctx.textAlign='right';ctx.fillText(isFull?'FULL SET':`${fmtT(rec.cs)}–${fmtT(rec.ce)}`,W-pad,y+rowH*.76);
    // Dashed row divider
    ctx.setLineDash([5,4]);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,y+rowH);ctx.lineTo(W-pad,y+rowH);ctx.stroke();ctx.setLineDash([]);
    y+=rowH;
  }
  // Barcode
  y=H*.88;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(pad,y,W-pad*2,H*.075);
  const barStart=pad+W*.04;for(let i=0;i<36;i++){const bw=i%3===0?3:1.5;ctx.fillStyle=`rgba(255,255,255,${i%5===0?.8:.3})`;ctx.fillRect(barStart+i*8,y+H*.01,bw,H*.045);}
  ctx.font=`400 ${W*.018}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.25)';ctx.textAlign='right';ctx.fillText('EDC2026 · UNDER THE ELECTRIC SKY',W-pad,y+H*.058);
}

async function renderTimetable(canvas,selSets,recon,day){
  const W=canvas.width,H=canvas.height;const ctx=canvas.getContext('2d');
  await document.fonts.ready;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  drawWireArt(ctx,W,H,.15);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const pad=W*.05;let y=H*.06;
  ctx.font=`900 ${W*.1}px Orbitron,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('edc',pad,y+W*.07);
  ctx.font=`300 ${W*.022}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillText(`LV 2026 · ${DAYS_LABEL[day-1].toUpperCase()}`,pad,y+W*.1);
  ctx.font=`700 ${W*.02}px Sora,sans-serif`;ctx.fillStyle='rgba(255,255,255,.28)';ctx.letterSpacing=`${W*.01}px`;ctx.fillText('MY SCHEDULE',pad,y+W*.125);ctx.letterSpacing='0px';
  y+=H*.18;
  // Build stage list from selected sets
  const stages=[...new Set(selSets.map(s=>s.stage))];
  if(stages.length===0){ctx.font=`300 ${W*.035}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.2)';ctx.textAlign='center';ctx.fillText('No sets selected',W/2,H/2);return;}
  const LCOL=W*.18;const TW=W-pad*2-LCOL;const TSTART=-60,TEND=360;const TOTAL=TEND-TSTART;
  const ROW_H=(H*.7)/stages.length;const ROW_PAD=4;
  // Time axis
  const timeLabels=[{t:-60,l:'11P'},{t:0,l:'12A'},{t:60,l:'1A'},{t:120,l:'2A'},{t:180,l:'3A'},{t:240,l:'4A'},{t:300,l:'5A'}];
  ctx.font=`400 ${W*.016}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.28)';ctx.textAlign='center';
  timeLabels.forEach(({t,l})=>{const x=pad+LCOL+((t-TSTART)/TOTAL)*TW;ctx.fillText(l,x,y-6);});
  stages.forEach((sg,ri)=>{
    const sc=STAGE_CFG[sg];const stageSets=selSets.filter(s=>s.stage===sg);const rowY=y+ri*ROW_H;
    // Stage label
    ctx.font=`700 ${W*.018}px DM Sans,sans-serif`;ctx.fillStyle=sc.p;ctx.textAlign='right';ctx.fillText(sc.label.split(' ')[0].toUpperCase(),pad+LCOL-8,rowY+ROW_H/2+5);
    // Row bg
    ctx.fillStyle='rgba(255,255,255,.04)';ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;roundRect(ctx,pad+LCOL,rowY+ROW_PAD,TW,ROW_H-ROW_PAD*2,4);ctx.fill();ctx.stroke();
    // Hour lines
    timeLabels.forEach(({t})=>{const x=pad+LCOL+((t-TSTART)/TOTAL)*TW;ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,rowY+ROW_PAD);ctx.lineTo(x,rowY+ROW_H-ROW_PAD);ctx.stroke();});
    // Set blocks
    stageSets.forEach(s=>{
      const rec=recon[s.id]||s;const sm=Math.max(TSTART,toM(s.s)),em=Math.min(TEND,toM(s.e));if(em<=TSTART||sm>=TEND)return;
      const bx=pad+LCOL+((sm-TSTART)/TOTAL)*TW;const bw=Math.max(8,((em-sm)/TOTAL)*TW);
      // Dim full set bg
      ctx.fillStyle=`${sc.p}22`;roundRect(ctx,bx,rowY+ROW_PAD+2,bw,ROW_H-ROW_PAD*2-4,3);ctx.fill();
      // Bright catch portion
      const cm=Math.max(sm,toM(rec.cs));const ce=Math.min(em,toM(rec.ce));
      if(ce>cm){const cx=pad+LCOL+((cm-TSTART)/TOTAL)*TW;const cw=Math.max(4,((ce-cm)/TOTAL)*TW);ctx.fillStyle=sc.p;roundRect(ctx,cx,rowY+ROW_PAD+2,cw,ROW_H-ROW_PAD*2-4,3);ctx.fill();}
      // Label
      if(bw>50){ctx.font=`800 ${W*.014}px Sora,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(s.artist.split(' ')[0].toUpperCase().slice(0,8),bx+4,rowY+ROW_H/2+4);}
    });
  });
  // Legend
  const ly=H*.92;ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(pad,ly,W-pad*2,H*.065);
  [{label:'FULL SET',col:STAGE_CFG.kineticFIELD.p},{label:'CATCHING',col:STAGE_CFG.kineticFIELD.s,partial:true}].forEach(({label,col,partial},i)=>{
    const lx=pad+W*.06+i*W*.38;ctx.fillStyle=partial?`${col}33`:col;roundRect(ctx,lx,ly+H*.018,W*.05,H*.025,3);ctx.fill();if(partial){ctx.fillStyle=col;roundRect(ctx,lx,ly+H*.018,W*.025,H*.025,3);ctx.fill();}
    ctx.font=`600 ${W*.018}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.3)';ctx.textAlign='left';ctx.fillText(label,lx+W*.055,ly+H*.033);
  });
  ctx.font=`300 ${W*.016}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.18)';ctx.textAlign='center';ctx.fillText('MY EDC LV 2026 · UNDER THE ELECTRIC SKY',W/2,H*.97);
}

async function renderNightArc(canvas,selSets,recon,day){
  const W=canvas.width,H=canvas.height;const ctx=canvas.getContext('2d');
  await document.fonts.ready;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  drawWireArt(ctx,W,H,.12);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.font=`900 ${W*.12}px Orbitron,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('edc',W/2,H*.1);
  ctx.font=`300 ${W*.022}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.32)';ctx.fillText(`LAS VEGAS 2026 · ${DAYS_LABEL[day-1].toUpperCase()} · MY NIGHT`,W/2,H*.145);
  const CX=W/2,CY=H*.62;const RI=W*.28,RO=W*.42;
  const T_START=-120,T_END=360,T_TOTAL=T_END-T_START;
  const tToA=t=>Math.PI-(((Math.max(T_START,Math.min(T_END,t))-T_START)/T_TOTAL)*Math.PI);
  const polar=(a,r)=>({x:CX+r*Math.cos(a),y:CY-r*Math.sin(a)});
  function arcSegment(ctx,sa,ea,r1,r2){ctx.beginPath();const s1=polar(sa,r1),e1=polar(ea,r1),s2=polar(ea,r2),e2=polar(sa,r2);const big=Math.abs(sa-ea)>Math.PI?1:0;ctx.moveTo(s1.x,s1.y);ctx.arc(CX,CY,r1,Math.PI-sa+Math.PI/2,Math.PI-ea+Math.PI/2,false);ctx.lineTo(s2.x,s2.y);ctx.arc(CX,CY,r2,Math.PI-ea+Math.PI/2,Math.PI-sa+Math.PI/2,true);ctx.closePath();}
  // Track
  ctx.fillStyle='rgba(255,255,255,.05)';ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(CX,CY,RI,Math.PI,0,false);ctx.arc(CX,CY,RO,0,Math.PI,true);ctx.closePath();ctx.fill();ctx.stroke();
  // Hour ticks
  const tickHours=[-2,-1,0,1,2,3,4,5,6];tickHours.forEach(h=>{const t=h*60;if(t<T_START||t>T_END)return;const a=tToA(t);const p1=polar(a,RO+6),p2=polar(a,RO+16),pt=polar(a,RO+26);const label=((h+24)%24);const lstr=label===0?'12A':label<12?label+'A':label===12?'12P':(label-12)+'P';ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();ctx.font=`400 ${W*.018}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.28)';ctx.textAlign='center';ctx.fillText(lstr,pt.x,pt.y+5);});
  // Set arcs
  selSets.forEach(s=>{
    const sc=STAGE_CFG[s.stage];const rec=recon[s.id]||s;const gc=GENRES[s.g]||GENRES['Electronic'];
    const sa=tToA(toM(s.s)),ea=tToA(toM(s.e));const ca=tToA(toM(rec.cs)),cae=tToA(toM(rec.ce));
    // Full set dim
    ctx.fillStyle=`${sc.p}22`;ctx.strokeStyle=`${sc.p}44`;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(CX,CY,RI+2,Math.PI-sa,Math.PI-ea,sa>ea);ctx.arc(CX,CY,RO-2,Math.PI-ea,Math.PI-sa,ea<sa);ctx.closePath();ctx.fill();ctx.stroke();
    // Catch bright
    ctx.fillStyle=`${sc.p}cc`;ctx.strokeStyle=sc.p;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(CX,CY,RI+5,Math.PI-ca,Math.PI-cae,ca>cae);ctx.arc(CX,CY,RO-5,Math.PI-cae,Math.PI-ca,cae<ca);ctx.closePath();ctx.fill();ctx.stroke();
    // Label at midpoint
    const midA=(sa+ea)/2;const midR=RO+38;const mp=polar(midA,midR);
    ctx.font=`800 ${W*.016}px Sora,sans-serif`;ctx.fillStyle=sc.p;ctx.textAlign='middle'==='middle'?'center':'center';ctx.textAlign='center';
    ctx.fillText(s.artist.split(' ')[0].toUpperCase().slice(0,7),mp.x,mp.y+5);
  });
  // Set list below arc
  let listY=H*.78;ctx.font=`700 ${W*.02}px DM Sans,sans-serif`;ctx.fillStyle='rgba(255,255,255,.2)';ctx.textAlign='center';ctx.fillText(`${selSets.length} SET${selSets.length!==1?'S':''} · ${DAYS_LABEL[day-1].toUpperCase()}`,W/2,listY);listY+=H*.025;
  selSets.slice(0,5).forEach(s=>{
    const sc=STAGE_CFG[s.stage];const rec=recon[s.id]||s;const totalM=toM(s.e)-toM(s.s);const catchM=toM(rec.ce)-toM(rec.cs);const isFull=catchM>=totalM-1;
    const pad=W*.05;const barW=W*.18;
    ctx.fillStyle=sc.p;ctx.beginPath();ctx.arc(pad+8,listY+7,5,0,Math.PI*2);ctx.fill();
    ctx.font=`800 ${W*.022}px Sora,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='left';
    let aText=s.artist;while(ctx.measureText(aText).width>W*.55&&aText.length>4)aText=aText.slice(0,-1);if(aText!==s.artist)aText+='…';
    ctx.fillText(aText,pad+18,listY+10);
    // Mini bar right
    const bx=W-pad-barW;ctx.fillStyle='rgba(255,255,255,.12)';roundRect(ctx,bx,listY+2,barW,7,3.5);ctx.fill();
    if(isFull){ctx.fillStyle=sc.p;roundRect(ctx,bx,listY+2,barW,7,3.5);ctx.fill();}
    else{const cL=((toM(rec.cs)-toM(s.s))/totalM)*barW;const cW=Math.max(4,(catchM/totalM)*barW);ctx.fillStyle=sc.p;roundRect(ctx,bx+Math.max(0,cL),listY+2,Math.min(cW,barW),7,3.5);ctx.fill();}
    listY+=H*.032;
  });
  ctx.font=`300 ${W*.016}px Space Mono,monospace`;ctx.fillStyle='rgba(255,255,255,.18)';ctx.textAlign='center';ctx.fillText('MY EDC LV 2026 · UNDER THE ELECTRIC SKY',W/2,H*.97);
}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

/* ─── MY SETS + EXPORT SCREEN ────────────────────────────────────────── */
function MySetsScreen({selected,toggleSet,recon,sharedIds,markers}){
  const[showExport,setShowExport]=React.useState(false);
  if(showExport)return<ExportScreen selected={selected} recon={recon} sharedIds={sharedIds} markers={markers} onBack={()=>setShowExport(false)}/>;
  const selTotal=selected.length;const conflicts=Object.values(recon).filter(s=>s.conflict).length;const trimmed=Object.values(recon).filter(s=>s.trimmed).length;
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={H('header-export.webp')} height={120} title="MY SETS" copy={COPY.myList}
          extra={<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{fontSize:11,color:STAGE_CFG.kineticFIELD.p,fontWeight:700,background:'#000',border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,borderRadius:10,padding:'3px 10px',fontFamily:'Sora,sans-serif'}}>{selTotal} SETS</div>
              {conflicts>0&&<div style={{fontSize:10,color:'#ff5555',background:'#000',border:'2px solid #ff5555',borderRadius:10,padding:'3px 9px',fontFamily:'DM Sans,sans-serif',fontWeight:700,textTransform:'uppercase'}}>⚠ {conflicts} CONFLICT{conflicts>1?'S':''}</div>}
              {trimmed>0&&<div style={{fontSize:10,color:STAGE_CFG.kineticFIELD.s,background:'#000',border:`2px solid ${STAGE_CFG.kineticFIELD.s}`,borderRadius:10,padding:'3px 9px',fontFamily:'DM Sans,sans-serif',fontWeight:700,textTransform:'uppercase'}}>{trimmed} TRIMMED</div>}
            </div>
            <button onClick={()=>setShowExport(true)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,background:STAGE_CFG.kineticFIELD.p,color:'#000',fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:12,letterSpacing:'.05em',border:'none',cursor:'pointer',textTransform:'uppercase'}}>
              <img src={ACT_IC('action-download')} alt="" style={{width:14,height:14,filter:'invert(1)'}}/>EXPORT
            </button>
          </div>}
        />
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px 16px 104px',background:'#000'}}>
        {selTotal===0&&<div style={{textAlign:'center',padding:'50px 20px',color:'rgba(255,255,255,.2)'}}>
          <div style={{fontSize:32,marginBottom:12,opacity:.2}}>◈</div>
          <div style={{fontSize:14,fontStyle:'italic',marginBottom:6,fontFamily:'Sora,sans-serif',fontWeight:700,textTransform:'uppercase'}}>Nothing yet.</div>
          <div style={{fontSize:12}}>Head to Lineup to add sets</div>
        </div>}
        {[1,2,3].map(dn=>{
          const dSets=SCHEDULE.filter(s=>selected.includes(s.id)&&s.day===dn).sort((a,b)=>toM(a.s)-toM(b.s)).filter(s=>{const r=recon[s.id]||s;return toM(r.ce)>toM(r.cs);});
          if(!dSets.length)return null;
          return(
            <div key={dn} style={{marginBottom:20}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:14,marginBottom:12,color:'rgba(255,255,255,.65)',letterSpacing:'-.01em',textTransform:'uppercase',borderBottom:'2px solid rgba(255,255,255,.12)',paddingBottom:8}}>
                {DAYS_LABEL[dn-1].toUpperCase()} <span style={{fontSize:11,color:'rgba(255,255,255,.28)',fontWeight:400}}>MAY {14+dn}</span>
              </div>
              {dSets.map(s=><SetCard key={s.id} set={s} selected={selected} onToggle={toggleSet} recon={recon} sharedIds={sharedIds}/>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExportScreen({selected,recon,sharedIds,markers,onBack}){
  const[template,setTemplate]=React.useState('poster');
  const[day,setDay]=React.useState(1);
  const[exporting,setExporting]=React.useState(false);
  const canvasRef=React.useRef();
  const RATIOS={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080],'19.5:9':[1920,882]};
  const[ratio,setRatio]=React.useState('9:16');

  const selSets=React.useMemo(()=>
    SCHEDULE.filter(s=>selected.includes(s.id)&&s.day===day&&MAIN_STAGES.includes(s.stage))
      .sort((a,b)=>toM(a.s)-toM(b.s))
      .filter(s=>{const r=recon[s.id]||s;return toM(r.ce)>toM(r.cs);})
  ,[selected,day,recon]);

  const dayMarkers=React.useMemo(()=>markers.filter(m=>!m.day||m.day===day),[markers,day]);

  async function doExport(){
    setExporting(true);
    try{
      const[W,H]=RATIOS[ratio]||[1080,1920];
      const canvas=canvasRef.current;canvas.width=W;canvas.height=H;
      if(template==='poster')await renderPoster(canvas,selSets,recon,day,dayMarkers);
      else if(template==='ticket')await renderTicket(canvas,selSets,recon,day,dayMarkers);
      else if(template==='timetable')await renderTimetable(canvas,selSets,recon,day);
      else await renderNightArc(canvas,selSets,recon,day);
      canvas.toBlob(blob=>{
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],'edc-schedule.png',{type:'image/png'})]})){
          navigator.share({files:[new File([blob],'edc-schedule.png',{type:'image/png'})],title:'My EDC 2026'}).catch(()=>{});
        }else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`edc-2026-${['fri','sat','sun'][day-1]}-${template}.png`;a.click();}
        setExporting(false);
      },'image/png');
    }catch(e){console.error(e);setExporting(false);}
  }

  const TEMPLATES=[{id:'poster',label:'POSTER'},{id:'ticket',label:'TICKET'},{id:'timetable',label:'TIMETABLE'},{id:'arc',label:'NIGHT ARC'}];

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <canvas ref={canvasRef} style={{display:'none'}}/>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={H('header-export.webp')} height={100}
          extra={<div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={onBack} style={{fontSize:18,padding:'3px 6px',color:'rgba(255,255,255,.5)',background:'none',border:'none',cursor:'pointer'}}>←</button>
            <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:22,letterSpacing:'-.02em',textTransform:'uppercase'}}>EXPORT</div>
          </div>}
        />
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px 104px',background:'#000'}}>
        {/* Day */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.3)',letterSpacing:'.16em',textTransform:'uppercase',marginBottom:8,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>DAY</div>
          <div style={{display:'flex',gap:6}}>
            {[['FRIDAY',1],['SATURDAY',2],['SUNDAY',3]].map(([l,d])=>(
              <button key={d} onClick={()=>setDay(d)} style={{padding:'8px 12px',borderRadius:10,fontWeight:700,fontSize:11,fontFamily:'Sora,sans-serif',background:day===d?STAGE_CFG.kineticFIELD.p:'#000',color:day===d?'#000':'rgba(255,255,255,.35)',border:`2px solid ${day===d?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.2)'}`,cursor:'pointer',textTransform:'uppercase'}}>{l}</button>
            ))}
          </div>
        </div>
        {/* Template pills */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.3)',letterSpacing:'.16em',textTransform:'uppercase',marginBottom:8,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>TEMPLATE</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {TEMPLATES.map(t=>(
              <button key={t.id} onClick={()=>setTemplate(t.id)} style={{padding:'8px 16px',borderRadius:20,fontWeight:700,fontSize:11,fontFamily:'Sora,sans-serif',background:template===t.id?STAGE_CFG.kineticFIELD.p:'#000',color:template===t.id?'#000':'rgba(255,255,255,.45)',border:`2px solid ${template===t.id?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.2)'}`,cursor:'pointer',letterSpacing:'.05em'}}>{t.label}</button>
            ))}
          </div>
        </div>
        {/* Ratio */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.3)',letterSpacing:'.16em',textTransform:'uppercase',marginBottom:8,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>RATIO</div>
          <div style={{display:'flex',gap:6}}>
            {['9:16','4:5','1:1','19.5:9'].map(r=>(
              <button key={r} onClick={()=>setRatio(r)} style={{padding:'7px 12px',borderRadius:9,border:`2px solid ${ratio===r?'rgba(255,255,255,.5)':'rgba(255,255,255,.16)'}`,background:'#000',color:ratio===r?'#fff':'rgba(255,255,255,.3)',fontFamily:'Space Mono,monospace',fontSize:10,cursor:'pointer'}}>{r}</button>
            ))}
          </div>
        </div>
        {/* Sets count */}
        {selSets.length===0&&<div style={{background:'#000',border:'2px solid rgba(255,85,85,.3)',borderRadius:12,padding:'12px 16px',marginBottom:16,color:'rgba(255,85,85,.8)',fontSize:12,fontFamily:'DM Sans,sans-serif',fontWeight:600,textTransform:'uppercase'}}>⚠ No sets selected for {DAYS_LABEL[day-1]}</div>}
        {selSets.length>0&&<div style={{background:'#000',border:'2px solid rgba(255,255,255,.12)',borderRadius:12,padding:'12px 16px',marginBottom:16,color:'rgba(255,255,255,.5)',fontSize:12,fontFamily:'DM Sans,sans-serif'}}>
          <span style={{fontFamily:'Sora,sans-serif',fontWeight:800,color:'#fff',fontSize:14}}>{selSets.length}</span> sets · {DAYS_LABEL[day-1]} · {template.charAt(0).toUpperCase()+template.slice(1)} layout
        </div>}
        {/* Share */}
        <div style={{marginBottom:16,background:'#000',border:'2px solid rgba(255,255,255,.14)',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontWeight:700,fontSize:12,marginBottom:2,fontFamily:'Sora,sans-serif',textTransform:'uppercase'}}>Share Schedule</div><div style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>Encodes your full selection as a link</div></div>
          <button onClick={()=>{const url=window.location.origin+window.location.pathname+encodeShare(selected);if(navigator.share)navigator.share({url,title:'My EDC 2026 lineup'}).catch(()=>{});else navigator.clipboard.writeText(url).then(()=>alert('Copied!')).catch(()=>{});}}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,background:'#000',border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,cursor:'pointer',flexShrink:0}}>
            <img src={ACT_IC('action-share')} alt="" style={{width:14,height:14,mixBlendMode:'screen'}}/>
            <span style={{fontSize:11,color:STAGE_CFG.kineticFIELD.p,fontWeight:700,fontFamily:'Sora,sans-serif',textTransform:'uppercase'}}>Share</span>
          </button>
        </div>
        {/* Export button */}
        <button onClick={doExport} disabled={exporting||selSets.length===0} style={{width:'100%',padding:'17px',borderRadius:14,background:exporting||selSets.length===0?'rgba(255,255,255,.06)':STAGE_CFG.kineticFIELD.p,color:exporting||selSets.length===0?'rgba(255,255,255,.3)':'#000',fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:14,letterSpacing:'.05em',border:'none',cursor:exporting||selSets.length===0?'not-allowed':'pointer',textTransform:'uppercase',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all .2s'}}>
          <img src={ACT_IC('action-download')} alt="" style={{width:18,height:18,filter:exporting||selSets.length===0?'none':'invert(1)',opacity:exporting||selSets.length===0?.3:1}}/>
          {exporting?'RENDERING…':'SAVE WALLPAPER'}
        </button>
      </div>
    </div>
  );
}

/* ─── MAP SCREEN ─────────────────────────────────────────────────────── */
function MapScreen({mapPins,setMapPins,markers,crew}){
  const[zoom,setZoom]=React.useState(1);const[pan,setPan]=React.useState({x:0,y:0});const[selPin,setSelPin]=React.useState(null);const[addMode,setAddMode]=React.useState(false);const[addForm,setAddForm]=React.useState({label:'',time:'',color:'#00d4ff',icon:'meetup'});const touchRef=React.useRef({});
  const PIN_ICONS={meetup:UTIL_IC('utility-meet-up-point'),totem:UTIL_IC('utility-totem'),water:UTIL_IC('utility-water'),restroom:UTIL_IC('utility-restroom'),food:UTIL_IC('utility-food-and-drink'),charging:UTIL_IC('utility-charging'),shuttle:UTIL_IC('utility-shuttle'),rideshare:UTIL_IC('utility-rideshare'),entrance:UTIL_IC('utility-entrance'),exit:UTIL_IC('utility-exit')};
  function onTS(e){if(e.touches.length===2){touchRef.current.pinching=true;touchRef.current.sd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);touchRef.current.sz=zoom;}else if(e.touches.length===1){touchRef.current.dragging=true;touchRef.current.sx=e.touches[0].clientX-pan.x;touchRef.current.sy=e.touches[0].clientY-pan.y;}}
  function onTM(e){if(touchRef.current.pinching&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setZoom(Math.min(4,Math.max(.5,touchRef.current.sz*d/touchRef.current.sd)));}else if(touchRef.current.dragging&&e.touches.length===1&&zoom>1){setPan({x:e.touches[0].clientX-touchRef.current.sx,y:e.touches[0].clientY-touchRef.current.sy});}}
  function onTE(){touchRef.current.pinching=false;touchRef.current.dragging=false;}
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={H('header-map.webp')} height={110} title="MAP" copy={COPY.map}
          extra={<div style={{display:'flex',gap:8}}>
            {zoom>1&&<button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{padding:'5px 10px',borderRadius:8,background:'#000',border:'2px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.5)',fontSize:11,cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700}}>RESET</button>}
            <button onClick={()=>setAddMode(!addMode)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:10,fontSize:11,fontWeight:700,fontFamily:'Sora,sans-serif',border:`2px solid ${addMode?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.2)'}`,background:'#000',color:addMode?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.5)',cursor:'pointer',textTransform:'uppercase'}}>
              <img src={addMode?ACT_IC('action-more'):ACT_IC('action-add')} alt="" style={{width:13,height:13,mixBlendMode:'screen'}}/>{addMode?'CANCEL':'+ PIN'}
            </button>
          </div>}
        />
        {addMode&&(
          <div style={{padding:'10px 16px 14px',background:'#000',borderBottom:'2px solid rgba(255,255,255,.12)'}}>
            <div style={{display:'flex',gap:5,overflowX:'auto',marginBottom:8}}>
              {Object.keys(PIN_ICONS).map(k=>(
                <button key={k} onClick={()=>setAddForm(f=>({...f,icon:k}))} style={{flexShrink:0,display:'flex',alignItems:'center',gap:4,padding:'4px 9px',borderRadius:10,border:`2px solid ${addForm.icon===k?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.16)'}`,background:'#000',fontSize:9,color:addForm.icon===k?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.35)',fontWeight:700,fontFamily:'DM Sans,sans-serif',textTransform:'uppercase',cursor:'pointer'}}>
                  <img src={PIN_ICONS[k]} alt="" style={{width:12,height:12,mixBlendMode:'screen'}}/>{k}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:7,alignItems:'center'}}>
              <input value={addForm.label} onChange={e=>setAddForm(f=>({...f,label:e.target.value}))} placeholder="LABEL" style={{flex:2,background:'#000',border:'2px solid rgba(255,255,255,.18)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:13,outline:'none',textTransform:'uppercase'}}/>
              <input value={addForm.time} onChange={e=>setAddForm(f=>({...f,time:e.target.value}))} placeholder="TIME" style={{flex:1,background:'#000',border:'2px solid rgba(255,255,255,.18)',borderRadius:8,padding:'8px 10px',color:'#fff',fontSize:13,outline:'none'}}/>
              <input type="color" value={addForm.color} onChange={e=>setAddForm(f=>({...f,color:e.target.value}))} style={{width:36,height:36,borderRadius:6,border:'2px solid rgba(255,255,255,.18)',background:'none',cursor:'pointer',padding:2}}/>
            </div>
            <div style={{fontSize:10,color:STAGE_CFG.kineticFIELD.p,marginTop:6,fontFamily:'DM Sans,sans-serif',fontStyle:'italic'}}>Tap the map to place your pin</div>
          </div>
        )}
      </div>
      <div style={{flex:1,position:'relative',overflow:'hidden',background:'#000',cursor:addMode?'crosshair':'grab'}}
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        onClick={e=>{if(!addMode)return;const r=e.currentTarget.getBoundingClientRect();const x=parseFloat(((e.clientX-r.left)/r.width*100).toFixed(1));const y=parseFloat(((e.clientY-r.top)/r.height*100).toFixed(1));setMapPins(p=>[...p,{id:Date.now(),x,y,...addForm}]);setAddMode(false);}}>
        <div style={{width:'100%',height:'100%',transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,transformOrigin:'center center',transition:'transform .05s',position:'relative'}}>
          <img src="assets/map.webp" alt="EDC Map" onError={e=>e.target.style.display='none'} style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:.1,pointerEvents:'none'}}>
            <img src={UTIL_IC('utility-stage')} alt="" style={{width:56,height:56,mixBlendMode:'screen',marginBottom:10}}/>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:13,letterSpacing:'.1em',color:'#fff',textTransform:'uppercase'}}>MAP COMING SOON</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:4}}>Add assets/map.webp to enable</div>
          </div>
          {MAIN_STAGES.map((sg,i)=>{const sc=STAGE_CFG[sg];const pos=[{x:50,y:52},{x:24,y:40},{x:51,y:28},{x:75,y:44},{x:72,y:68},{x:28,y:68},{x:76,y:28},{x:62,y:35},{x:38,y:35}][i]||{x:50,y:50};return(
            <div key={sg} onClick={e=>{e.stopPropagation();setSelPin({type:'stage',stage:sg,sc});}} style={{position:'absolute',left:`${pos.x}%`,top:`${pos.y}%`,transform:'translate(-50%,-50%)',cursor:'pointer',zIndex:10}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'#000',border:`2px solid ${sc.p}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={EMB(sc.key)} alt="" style={{width:28,height:22,objectFit:'contain'}}/>
              </div>
            </div>
          );})}
          {mapPins.map(pin=>(
            <div key={pin.id} onClick={e=>{e.stopPropagation();setSelPin({type:'pin',pin});}} style={{position:'absolute',left:`${pin.x}%`,top:`${pin.y}%`,transform:'translate(-50%,-100%)',cursor:'pointer',zIndex:15}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:'#000',border:`2px solid ${pin.color||'#00d4ff'}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 3px'}}>
                <img src={PIN_ICONS[pin.icon]||PIN_ICONS.meetup} alt="" style={{width:16,height:16,mixBlendMode:'screen'}}/>
              </div>
              <div style={{fontSize:7,color:pin.color||'#00d4ff',textAlign:'center',whiteSpace:'nowrap',fontWeight:700,textShadow:'0 1px 3px rgba(0,0,0,.9)',fontFamily:'DM Sans,sans-serif',textTransform:'uppercase'}}>{pin.label}</div>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',right:12,top:12,display:'flex',flexDirection:'column',gap:6,zIndex:20}}>
          {['+','−'].map(b=>(
            <button key={b} onClick={()=>setZoom(z=>Math.min(4,Math.max(.5,z+(b==='+'?.3:-.3))))} style={{width:34,height:34,borderRadius:8,background:'#000',border:'2px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.6)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{b}</button>
          ))}
        </div>
        {selPin&&(
          <div style={{position:'absolute',bottom:16,left:16,right:60,background:'#000',borderRadius:16,padding:'13px 15px',zIndex:30,border:`2px solid ${selPin.sc?.p||selPin.pin?.color||'rgba(255,255,255,.2)'}`}}>
            {selPin.type==='stage'&&<><img src={EMB(selPin.sc.key)} alt="" style={{height:36,objectFit:'contain',marginBottom:6}}/><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Tap a set in Lineup to select</div></>}
            {selPin.type==='pin'&&<>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}><img src={PIN_ICONS[selPin.pin.icon]||PIN_ICONS.meetup} alt="" style={{width:20,height:20,mixBlendMode:'screen'}}/><div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:14,color:selPin.pin.color||'#00d4ff',textTransform:'uppercase'}}>{selPin.pin.label}</div></div>
              {selPin.pin.time&&<div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:4,fontFamily:'Space Mono,monospace'}}>{selPin.pin.time}</div>}
              <button onClick={()=>{setMapPins(p=>p.filter(x=>x.id!==selPin.pin.id));setSelPin(null);}} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#ff5555',background:'#000',border:'2px solid rgba(255,85,85,.3)',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700,textTransform:'uppercase'}}>
                <img src={ACT_IC('action-delete')} alt="" style={{width:11,height:11,mixBlendMode:'screen'}}/>REMOVE
              </button>
            </>}
            <button onClick={()=>setSelPin(null)} style={{position:'absolute',top:10,right:12,fontSize:18,opacity:.3,padding:4,color:'#fff',background:'none',border:'none',cursor:'pointer'}}>×</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CREW SCREEN ────────────────────────────────────────────────────── */
function CrewScreen({crew,setCrew,markers,setMarkers}){
  const[editCrew,setEditCrew]=React.useState(null);const[editMark,setEditMark]=React.useState(null);
  const[cf,setCf]=React.useState({name:'',origin:'',rep:'',findUs:'',photo:''});const[mf,setMf]=React.useState({label:'',time:'',day:0,color:'#FFD700'});
  function saveCrew(){if(!cf.name.trim())return;if(editCrew==='new')setCrew(p=>[...p,{id:Date.now(),...cf}]);else setCrew(p=>p.map(c=>c.id===editCrew?{...c,...cf}:c));setEditCrew(null);}
  function saveMark(){if(!mf.label.trim())return;const mk={id:Date.now(),...mf};if(editMark==='new')setMarkers(p=>[...p,mk]);else setMarkers(p=>p.map(m=>m.id===editMark?{...m,...mf}:m));setEditMark(null);}
  function handlePhoto(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCf(c=>({...c,photo:ev.target.result}));r.readAsDataURL(f);}
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{flexShrink:0,background:'#000'}}>
        <ScreenHeader img={H('header-crew.webp')} height={120} title="CREW" copy={COPY.crew}
          extra={<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span/>
            {crew.length<3&&<button onClick={()=>{setCf({name:'',origin:'',rep:'',findUs:'',photo:''});setEditCrew('new');}} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:10,border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,background:'#000',color:STAGE_CFG.kineticFIELD.p,fontWeight:700,fontSize:11,fontFamily:'Sora,sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
              <img src={ACT_IC('action-add')} alt="" style={{width:13,height:13,mixBlendMode:'screen'}}/>ADD CREW
            </button>}
          </div>}
        />
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'10px 16px 104px',background:'#000'}}>
        {editCrew&&(
          <div style={{background:'#000',border:'2px solid rgba(255,255,255,.16)',borderRadius:18,padding:'16px',marginBottom:16}}>
            <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12,fontSize:13,textTransform:'uppercase'}}>{editCrew==='new'?'NEW CREW':'EDIT CREW'}</div>
            <div style={{display:'flex',gap:12,marginBottom:12,alignItems:'center'}}>
              <div style={{width:66,height:66,borderRadius:14,background:'#000',border:'2px dashed rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                {cf.photo?<img src={cf.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<img src={UTIL_IC('utility-totem')} alt="" style={{width:34,height:34,mixBlendMode:'screen',opacity:.5}}/>}
              </div>
              <label style={{padding:'7px 14px',borderRadius:8,background:'#000',border:'2px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.6)',fontSize:11,cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700,textTransform:'uppercase'}}>
                PHOTO <input type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
              </label>
            </div>
            {[['name','CREW NAME *'],['origin','FROM'],['rep','REP'],['findUs','FIND US']].map(([k,l])=>(
              <div key={k} style={{marginBottom:8}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginBottom:3,fontFamily:'DM Sans,sans-serif',fontWeight:700,letterSpacing:'.1em'}}>{l}</div>
                <input value={cf[k]} onChange={e=>setCf(c=>({...c,[k]:e.target.value}))} style={{width:'100%',background:'#000',border:'2px solid rgba(255,255,255,.18)',borderRadius:8,padding:'9px 12px',color:'#fff',fontSize:14,outline:'none',textTransform:'uppercase'}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button onClick={saveCrew} style={{flex:1,padding:'11px',borderRadius:10,background:STAGE_CFG.kineticFIELD.p,color:'#000',fontWeight:800,fontSize:13,fontFamily:'Sora,sans-serif',border:'none',cursor:'pointer',textTransform:'uppercase'}}>SAVE</button>
              <button onClick={()=>setEditCrew(null)} style={{padding:'11px 18px',borderRadius:10,background:'#000',border:'2px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.4)',fontSize:13,cursor:'pointer'}}>CANCEL</button>
            </div>
          </div>
        )}
        <div style={{fontSize:9,color:'rgba(255,255,255,.25)',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:8,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>TOTEMS ({crew.length}/3)</div>
        {crew.length===0&&!editCrew&&<div style={{textAlign:'center',padding:'20px',color:'rgba(255,255,255,.2)',fontSize:12,border:'2px dashed rgba(255,255,255,.1)',borderRadius:14,marginBottom:14}}>Add your crew to link them to map pins</div>}
        {crew.map(c=>(
          <div key={c.id} style={{background:'#000',border:'2px solid rgba(255,255,255,.14)',borderRadius:16,padding:'14px',marginBottom:10,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:62,height:62,borderRadius:14,background:'#000',border:'2px solid rgba(255,255,255,.16)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
              {c.photo?<img src={c.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<img src={UTIL_IC('utility-totem')} alt="" style={{width:34,height:34,mixBlendMode:'screen',opacity:.5}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:13,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textTransform:'uppercase'}}>{c.name}</div>
              {c.origin&&<div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:2}}>{c.origin}{c.rep&&` · ${c.rep}`}</div>}
              {c.findUs&&<div style={{fontSize:10,color:STAGE_CFG.kineticFIELD.p,marginTop:4,display:'flex',alignItems:'center',gap:4,textTransform:'uppercase',fontWeight:600}}>
                <img src={UTIL_IC('utility-meet-up-point')} alt="" style={{width:12,height:12,mixBlendMode:'screen'}}/>{c.findUs}
              </div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <button onClick={()=>{setCf({name:c.name,origin:c.origin||'',rep:c.rep||'',findUs:c.findUs||'',photo:c.photo||''});setEditCrew(c.id);}} style={{padding:'5px 8px',borderRadius:6,background:'#000',border:'2px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.4)',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',gap:3,fontFamily:'Sora,sans-serif',fontWeight:700}}>
                <img src={ACT_IC('action-edit')} alt="" style={{width:10,height:10,mixBlendMode:'screen'}}/>EDIT
              </button>
              <button onClick={()=>setCrew(p=>p.filter(x=>x.id!==c.id))} style={{padding:'5px 8px',borderRadius:6,background:'#000',border:'2px solid rgba(255,85,85,.3)',color:'#ff5555',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',gap:3,fontFamily:'Sora,sans-serif',fontWeight:700}}>
                <img src={ACT_IC('action-delete')} alt="" style={{width:10,height:10,mixBlendMode:'screen'}}/>×
              </button>
            </div>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'18px 0 8px'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.25)',letterSpacing:'.18em',textTransform:'uppercase',fontFamily:'DM Sans,sans-serif',fontWeight:700}}>MEETUP MARKERS</div>
          <button onClick={()=>{setMf({label:'',time:'',day:0,color:'#FFD700'});setEditMark('new');}} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:STAGE_CFG.kineticFIELD.p,background:'#000',border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,borderRadius:8,padding:'5px 12px',fontWeight:700,fontFamily:'Sora,sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
            <img src={ACT_IC('action-add')} alt="" style={{width:11,height:11,mixBlendMode:'screen'}}/>ADD
          </button>
        </div>
        {editMark&&(
          <div style={{background:'#000',border:'2px solid rgba(255,255,255,.14)',borderRadius:14,padding:'13px',marginBottom:12}}>
            {[['label','LABEL *'],['time','TIME (E.G. 23:00)']].map(([k,l])=>(
              <div key={k} style={{marginBottom:8}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginBottom:3,fontFamily:'DM Sans,sans-serif',fontWeight:700,letterSpacing:'.1em'}}>{l}</div>
                <input value={mf[k]} onChange={e=>setMf(f=>({...f,[k]:e.target.value}))} style={{width:'100%',background:'#000',border:'2px solid rgba(255,255,255,.16)',borderRadius:7,padding:'8px 10px',color:'#fff',fontSize:13,outline:'none',textTransform:'uppercase'}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
              <div><div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginBottom:3,fontFamily:'DM Sans,sans-serif',fontWeight:700,letterSpacing:'.1em'}}>COLOR</div><input type="color" value={mf.color} onChange={e=>setMf(f=>({...f,color:e.target.value}))} style={{width:42,height:33,borderRadius:6,border:'2px solid rgba(255,255,255,.16)',background:'none',cursor:'pointer',padding:2}}/></div>
              <div style={{flex:1}}><div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginBottom:3,fontFamily:'DM Sans,sans-serif',fontWeight:700,letterSpacing:'.1em'}}>DAY</div>
                <div style={{display:'flex',gap:4}}>
                  {[0,1,2,3].map(d=>(
                    <button key={d} onClick={()=>setMf(f=>({...f,day:d}))} style={{flex:1,padding:'6px 2px',borderRadius:6,background:mf.day===d?STAGE_CFG.kineticFIELD.p:'#000',color:mf.day===d?'#000':'rgba(255,255,255,.4)',fontSize:10,fontWeight:700,fontFamily:'Sora,sans-serif',border:`2px solid ${mf.day===d?STAGE_CFG.kineticFIELD.p:'rgba(255,255,255,.18)'}`,cursor:'pointer'}}>
                      {d===0?'ALL':['F','SA','SU'][d-1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={saveMark} style={{flex:1,padding:'10px',borderRadius:9,background:STAGE_CFG.kineticFIELD.p,color:'#000',fontWeight:800,fontSize:12,fontFamily:'Sora,sans-serif',border:'none',cursor:'pointer',textTransform:'uppercase'}}>SAVE</button>
              <button onClick={()=>setEditMark(null)} style={{padding:'10px 18px',borderRadius:9,background:'#000',border:'2px solid rgba(255,255,255,.16)',color:'rgba(255,255,255,.4)',fontSize:12,cursor:'pointer'}}>CANCEL</button>
            </div>
          </div>
        )}
        {markers.length===0&&!editMark&&<div style={{textAlign:'center',padding:'14px',color:'rgba(255,255,255,.15)',fontSize:11,border:'2px dashed rgba(255,255,255,.08)',borderRadius:12}}>No markers · They appear on schedule &amp; exports</div>}
        {markers.map(m=>(
          <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 0',borderBottom:'2px solid rgba(255,255,255,.08)'}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:m.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:12,fontFamily:'Sora,sans-serif',textTransform:'uppercase'}}>{m.label}</div>
              {m.time&&<div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:1,fontFamily:'Space Mono,monospace'}}>{fmtT(m.time)}{m.day>0?` · ${['FRI','SAT','SUN'][m.day-1]}`:' · ALL DAYS'}</div>}
            </div>
            <button onClick={()=>setMarkers(p=>p.filter(x=>x.id!==m.id))} style={{padding:'4px 7px',borderRadius:6,background:'#000',border:'2px solid rgba(255,85,85,.3)',color:'#ff5555',display:'flex',alignItems:'center',gap:3,fontSize:11,cursor:'pointer'}}>
              <img src={ACT_IC('action-delete')} alt="" style={{width:10,height:10,mixBlendMode:'screen'}}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── INSTALL PROMPT + AUDIT + SHARED BANNER ─────────────────────────── */
function InstallPrompt(){
  const[show,setShow]=React.useState(false);const[prompt,setPrompt]=React.useState(null);
  React.useEffect(()=>{const v=parseInt(LS.get('visits',0))+1;LS.set('visits',v);window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();setPrompt(e);if(v>=2&&!LS.get('installDismissed'))setShow(true);});});
  if(!show)return null;
  return(
    <div style={{position:'fixed',bottom:84,left:14,right:14,background:'#000',borderRadius:22,padding:'16px',border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,zIndex:200}}>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <img src={A('icon-192.webp')} alt="" style={{width:46,height:46,borderRadius:12,flexShrink:0}}/>
        <div><div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:14,marginBottom:2,textTransform:'uppercase'}}>Add to Home Screen</div><div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>Offline access. Signal's rough out there.</div></div>
        <button onClick={()=>{LS.set('installDismissed',1);setShow(false);}} style={{fontSize:22,opacity:.3,padding:4,color:'#fff',background:'none',border:'none',cursor:'pointer',marginLeft:'auto'}}>×</button>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={async()=>{if(prompt){await prompt.prompt();setShow(false);}}} style={{flex:1,padding:'11px',borderRadius:10,background:STAGE_CFG.kineticFIELD.p,color:'#000',fontWeight:800,fontSize:13,fontFamily:'Sora,sans-serif',border:'none',cursor:'pointer',textTransform:'uppercase'}}>INSTALL</button>
        <button onClick={()=>setShow(false)} style={{padding:'11px 16px',borderRadius:10,background:'#000',border:'2px solid rgba(255,255,255,.18)',color:'rgba(255,255,255,.35)',fontSize:13,cursor:'pointer'}}>LATER</button>
      </div>
    </div>
  );
}
function SharedBanner({sharedIds,onDismiss}){
  if(!sharedIds)return null;
  return(
    <div style={{position:'absolute',top:0,left:0,right:0,zIndex:90,background:'#000',borderBottom:`2px solid ${STAGE_CFG.stereoBLOOM.p}`,padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <img src={ACT_IC('action-share')} alt="" style={{width:14,height:14,mixBlendMode:'screen'}}/>
        <span style={{fontSize:11,color:STAGE_CFG.stereoBLOOM.p,fontWeight:700,fontFamily:'Sora,sans-serif',textTransform:'uppercase'}}>VIEWING SHARED LINEUP · {sharedIds.length} SETS</span>
      </div>
      <button onClick={onDismiss} style={{fontSize:11,color:'rgba(255,255,255,.4)',padding:'2px 8px',borderRadius:6,background:'#000',border:'2px solid rgba(255,255,255,.18)',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:700}}>DISMISS</button>
    </div>
  );
}
function AuditPanel({selected,recon,onClose}){
  const[r,setR]=React.useState(null);
  React.useEffect(()=>{
    const res={pwa:{manifest:!!document.querySelector('link[rel=manifest]'),sw:'serviceWorker' in navigator,swActive:false}};
    navigator.serviceWorker?.getRegistration().then(reg=>{res.pwa.swActive=!!reg?.active;setR({...res});});
    const seen=new Set(),dups=[];SCHEDULE.forEach(s=>{if(seen.has(s.id))dups.push(s.id);seen.add(s.id);});
    res.schedule={total:SCHEDULE.length,mainStage:SCHEDULE.filter(s=>MAIN_STAGES.includes(s.stage)).length,dups};
    const conflicts=[],trimmed=[];Object.values(recon).forEach(s=>{if(s.conflict)conflicts.push(s.artist);if(s.trimmed)trimmed.push(`${s.artist} −${s.trimMin}m`);});
    res.conflicts={count:conflicts.length,items:conflicts,trimmed};
    res.storage={selected:selected.length,lsKeys:Object.keys(localStorage).length};
    setR(res);
  },[]);
  return(
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:999,overflowY:'auto',padding:'60px 20px 40px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:16,color:STAGE_CFG.kineticFIELD.p,textTransform:'uppercase'}}>DEV AUDIT</div>
        <button onClick={onClose} style={{fontSize:22,opacity:.4,padding:4,color:'#fff',background:'none',border:'none',cursor:'pointer'}}>×</button>
      </div>
      {!r&&<div style={{color:'rgba(255,255,255,.4)'}}>Running…</div>}
      {r&&Object.entries(r).map(([k,v])=>(
        <div key={k} style={{marginBottom:14,background:'rgba(255,255,255,.04)',borderRadius:12,padding:'12px 14px'}}>
          <div style={{fontWeight:700,fontSize:11,color:STAGE_CFG.kineticFIELD.s,marginBottom:6,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'DM Sans,sans-serif'}}>{k}</div>
          <pre style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{JSON.stringify(v,null,2)}</pre>
        </div>
      ))}
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────── */
function App(){
  const[tab,setTab]=React.useState('home');const[auditOpen,setAuditOpen]=React.useState(false);
  const now=useClock();const phase=getFestPhase(now);
  const{selected,toggleSet,recon,crew,setCrew,markers,setMarkers,mapPins,setMapPins,sharedIds,setSharedIds,weather}=useApp();
  React.useEffect(()=>{window.__setTab=setTab;},[]);
  React.useEffect(()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});},[]);
  return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden',background:'#000'}}>
      <SharedBanner sharedIds={sharedIds} onDismiss={()=>setSharedIds(null)}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',marginTop:sharedIds?44:0,position:'relative'}}>
        <div className="anim-up" key={tab} style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {tab==='home'   &&<HomeScreen selected={selected} toggleSet={toggleSet} recon={recon} sharedIds={sharedIds} weather={weather}/>}
          {tab==='lineup' &&<LineupScreen selected={selected} toggleSet={toggleSet} recon={recon} sharedIds={sharedIds}/>}
          {tab==='mylist' &&<MySetsScreen selected={selected} toggleSet={toggleSet} recon={recon} sharedIds={sharedIds} markers={markers}/>}
          {tab==='map'    &&<MapScreen mapPins={mapPins} setMapPins={setMapPins} markers={markers} crew={crew}/>}
          {tab==='crew'   &&<CrewScreen crew={crew} setCrew={setCrew} markers={markers} setMarkers={setMarkers}/>}
        </div>
        <BottomNav tab={tab} setTab={setTab} phase={phase.phase}/>
      </div>
      <InstallPrompt/>
      {auditOpen&&<AuditPanel selected={selected} recon={recon} onClose={()=>setAuditOpen(false)}/>}
      <div onContextMenu={e=>{e.preventDefault();setAuditOpen(true);}} onTouchStart={(()=>{let t;return()=>{t=setTimeout(()=>setAuditOpen(true),800);}})()}
        onTouchEnd={()=>{}} style={{position:'absolute',bottom:3,right:7,fontSize:9,color:'rgba(255,255,255,.04)',zIndex:50,userSelect:'none'}}>v4.0.0</div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
