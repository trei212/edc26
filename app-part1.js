/* ─── APP STATE ─────────────────────────────────────────────────────── */
function useApp(){
  const sharedOnLoad=React.useMemo(()=>parseSharedHash(),[]);
  const[selected,setSelected]=React.useState(()=>LS.get('sel',[]));
  const[crew,setCrew]=React.useState(()=>LS.get('crew',[]));
  const[markers,setMarkers]=React.useState(()=>LS.get('markers',[]));
  const[mapPins,setMapPins]=React.useState(()=>LS.get('mapPins',[]));
  const[sharedIds,setSharedIds]=React.useState(sharedOnLoad);
  const[weather,setWeather]=React.useState(()=>LS.get('weather',null));
  React.useEffect(()=>{LS.set('sel',selected);},[selected]);
  React.useEffect(()=>{LS.set('crew',crew);},[crew]);
  React.useEffect(()=>{LS.set('markers',markers);},[markers]);
  React.useEffect(()=>{LS.set('mapPins',mapPins);},[mapPins]);
  React.useEffect(()=>{if(sharedOnLoad)return;history.replaceState(null,'',encodeShare(selected)||window.location.pathname);},[selected,sharedOnLoad]);
  React.useEffect(()=>{
    async function fw(){try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.2716&longitude=-115.0116&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles');const d=await r.json();const code=d.current.weather_code,temp=Math.round(d.current.temperature_2m);const cond=code<=1?'Clear':code<=3?'Cloudy':code<=67?'Rain':'Storm';const w={temp,cond,updated:Date.now()};setWeather(w);LS.set('weather',w);}catch{}}
    const c=LS.get('weather',null);if(!c||Date.now()-c.updated>1800000)fw();
  },[]);
  const recon=React.useMemo(()=>reconflict(selected),[selected]);
  const toggleSet=React.useCallback((id)=>{hap();setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);},[]);
  return{selected,toggleSet,recon,crew,setCrew,markers,setMarkers,mapPins,setMapPins,sharedIds,setSharedIds,weather};
}
function useClock(){const[now,setNow]=React.useState(Date.now());React.useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);return now;}

/* ─── ARTIST NAME ───────────────────────────────────────────────────── */
function ArtistName({name,size=16,color='#fff'}){
  const parts=name.split(/\s+(B2B)\s+/);
  if(parts.length===1)return<div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:size,color,letterSpacing:'-.02em',lineHeight:1.05,textTransform:'uppercase'}}>{name}</div>;
  const segs=[];for(let i=0;i<parts.length;i++){if(parts[i]==='B2B')continue;segs.push({name:parts[i],hasB2B:i<parts.length-2&&parts[i+1]==='B2B'});}
  return<div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:size,color,letterSpacing:'-.02em',lineHeight:1.1,textTransform:'uppercase'}}>{segs.map((seg,i)=><div key={i} style={{display:'block'}}>{seg.name}{seg.hasB2B&&<span style={{fontSize:size*.5,fontWeight:600,opacity:.45,letterSpacing:'.06em',marginLeft:4}}>B2B</span>}</div>)}</div>;
}

/* ─── WEATHER PILL ──────────────────────────────────────────────────── */
function WeatherPill({weather}){
  if(!weather)return null;
  const icons={'Clear':'☀️','Cloudy':'☁️','Rain':'🌧️','Storm':'⛈️'};
  return<div style={{display:'inline-flex',alignItems:'center',gap:5,background:'#000',border:'2px solid rgba(255,255,255,.2)',borderRadius:20,padding:'4px 10px'}}><span style={{fontSize:11}}>{icons[weather.cond]||'🌡️'}</span><span style={{fontFamily:'Space Mono,monospace',fontSize:11,color:'#fff',fontWeight:700}}>{weather.temp}°F</span></div>;
}

/* ─── SCREEN HEADER ─────────────────────────────────────────────────── */
function ScreenHeader({img,height=150,title,copy,extra}){
  return(
    <div style={{flexShrink:0}}>
      <div style={{position:'relative',overflow:'hidden',height}}>
        <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center bottom',display:'block'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:44,background:'linear-gradient(to bottom,transparent,#000)'}}/>
      </div>
      <div style={{background:'#000',padding:'12px 20px 10px',borderBottom:'2px solid rgba(255,255,255,.14)'}}>
        {title&&<div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:26,letterSpacing:'-.02em',color:'#fff',lineHeight:1,marginBottom:copy?5:extra?8:0,textTransform:'uppercase'}}>{title}</div>}
        {copy&&<div style={{fontSize:12,color:'rgba(255,255,255,.35)',fontStyle:'italic',fontWeight:300,marginBottom:extra?8:0}}>{copy}</div>}
        {extra}
      </div>
    </div>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────────────────────── */
function BottomNav({tab,setTab,phase}){
  const isLive=phase==='live';
  const TABS=[{id:'home',icon:isLive?NAV_IC('nav-live'):NAV_IC('nav-home'),label:'HOME'},{id:'lineup',icon:NAV_IC('nav-schedule'),label:'LINEUP'},{id:'mylist',icon:NAV_IC('nav-countdown'),label:'MY SETS'},{id:'map',icon:NAV_IC('nav-map'),label:'MAP'},{id:'crew',icon:NAV_IC('nav-kit'),label:'CREW'}];
  return(
    <nav style={{position:'absolute',bottom:0,left:0,right:0,zIndex:100,background:'#000',borderTop:'2px solid rgba(255,255,255,.16)',display:'flex',paddingBottom:'env(safe-area-inset-bottom,16px)'}}>
      {TABS.map(t=>{const act=tab===t.id;return(
        <button key={t.id} onClick={()=>{hap(6);setTab(t.id);}} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,paddingTop:10,paddingBottom:4,background:'none',border:'none',cursor:'pointer'}}>
          <img src={t.icon} alt="" style={{width:24,height:24,objectFit:'contain',mixBlendMode:'screen',opacity:act?1:.3,filter:act?'brightness(1.5)':'brightness(.5)',transition:'all .15s'}}/>
          <span style={{fontSize:8,fontWeight:act?800:500,letterSpacing:'.08em',color:act?'#fff':'rgba(255,255,255,.25)',fontFamily:'Sora,sans-serif',transition:'all .15s'}}>{t.label}</span>
        </button>
      );})}
    </nav>
  );
}

/* ─── SET CARD ───────────────────────────────────────────────────────── */
function SetCard({set,selected,onToggle,recon,sharedIds}){
  const sc=STAGE_CFG[set.stage];
  const isSel=selected.includes(set.id);
  const rec=recon[set.id]||set;
  const isShared=sharedIds?.includes(set.id);
  const pip=isShared&&!isSel;
  const gc=GENRES[set.g]||GENRES['Electronic'];
  return(
    <div onClick={()=>onToggle(set.id)} style={{background:isSel?`${sc.p}14`:'#000',border:`2px solid ${isSel?sc.p:'rgba(255,255,255,.14)'}`,borderLeft:`4px solid ${isSel?sc.p:'rgba(255,255,255,.2)'}`,borderRadius:14,padding:'12px 14px',marginBottom:8,display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer',transition:'all .14s'}}>
      <div style={{width:62,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <img src={EMB(sc.key)} alt={sc.label} style={{width:62,height:46,objectFit:'contain',objectPosition:'center'}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:'Space Mono,monospace',fontSize:10,color:isSel?sc.s:'rgba(255,255,255,.4)',marginBottom:4}}>{fmtT(set.s)} – {fmtT(set.e)}</div>
        <ArtistName name={set.artist} size={isSel?15:14} color={isSel?'#fff':'rgba(255,255,255,.82)'}/>
        <div style={{fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:10,color:gc.color,textTransform:'uppercase',letterSpacing:'.08em',marginTop:4}}>{set.g}</div>
        {isSel&&(
          <div style={{marginTop:7,paddingTop:6,borderTop:`2px solid ${sc.p}33`}}>
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              <span style={{fontFamily:'Space Mono,monospace',fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:'.06em',textTransform:'uppercase'}}>CATCH</span>
              <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:sc.s,fontWeight:700}}>{fmtT(rec.cs)} – {fmtT(rec.ce)}</span>
              {rec.trimmed&&<span style={{fontSize:8,color:sc.s,background:`${sc.s}18`,border:`1px solid ${sc.s}44`,borderRadius:4,padding:'1px 6px',textTransform:'uppercase'}}>−{rec.trimMin}M</span>}
              {rec.conflict&&<span style={{fontSize:8,color:'#ff5555',background:'rgba(255,85,85,.15)',border:'1px solid rgba(255,85,85,.3)',borderRadius:4,padding:'1px 6px',textTransform:'uppercase'}}>⚠ CONFLICT</span>}
            </div>
          </div>
        )}
      </div>
      <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,marginTop:2,background:isSel?sc.p:pip?`${sc.p}22`:'rgba(255,255,255,.08)',border:`2px solid ${isSel?sc.p:pip?sc.p:'rgba(255,255,255,.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .14s'}}>
        {isSel&&<span style={{fontSize:13,color:'#000',fontWeight:900}}>✓</span>}
        {pip&&<span style={{width:8,height:8,borderRadius:'50%',background:sc.p,display:'block'}}/>}
      </div>
    </div>
  );
}

/* ─── HOME SCREENS ───────────────────────────────────────────────────── */
function HomeScreen({selected,toggleSet,recon,sharedIds,weather}){
  const now=useClock();const phase=getFestPhase(now);
  if(phase.phase==='pre')return<HomeCountdown now={now} selected={selected} weather={weather}/>;
  if(phase.phase==='live')return<HomeLive now={now} day={phase.day} dayStart={phase.dayStart} selected={selected} toggleSet={toggleSet} recon={recon} sharedIds={sharedIds} weather={weather}/>;
  if(phase.phase==='inter')return<HomeInter nextDay={phase.nextDay} nextStart={phase.nextStart} now={now}/>;
  return<HomePost selected={selected}/>;
}

function HomeCountdown({now,selected,weather}){
  const target=DAY_STARTS[0].getTime();const diff=Math.max(0,target-now);
  const dd=Math.floor(diff/86400000),hh=Math.floor((diff%86400000)/3600000),mm=Math.floor((diff%3600000)/60000),ss=Math.floor((diff%60000)/1000);
  const pad=n=>String(n).padStart(2,'0');const showCTA=diff<7*86400000;
  const UC=[STAGE_CFG.kineticFIELD.p,STAGE_CFG.circuitGROUNDS.p,STAGE_CFG.cosmicMEADOW.p,STAGE_CFG.bionicJungle.p];
  const units=dd>0?[{v:pad(dd),l:'DAYS',c:UC[0]},{v:pad(hh),l:'HRS',c:UC[1]},{v:pad(mm),l:'MIN',c:UC[2]},{v:pad(ss),l:'SEC',c:UC[3]}]:[{v:pad(hh),l:'HRS',c:UC[0]},{v:pad(mm),l:'MIN',c:UC[1]},{v:pad(ss),l:'SEC',c:UC[2]}];
  return(
    <div style={{flex:1,overflowY:'auto',paddingBottom:88,background:'#000'}}>
      <div style={{position:'relative',overflow:'hidden',height:250}}>
        <img src={H('header-home-pre.webp')} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center',display:'block'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:50,background:'linear-gradient(to bottom,transparent,#000)'}}/>
      </div>
      <div style={{background:'#000',padding:'10px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'2px solid rgba(255,255,255,.12)'}}>
        <div><img src={A('edc-logo.webp')} alt="EDC" style={{height:28,marginBottom:3}}/><div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'.24em',textTransform:'uppercase'}}>LAS VEGAS · MAY 15–17</div></div>
        <WeatherPill weather={weather}/>
      </div>
      <div style={{padding:'16px 20px 0'}}>
        <div style={{background:'#000',border:'2px solid rgba(255,255,255,.14)',borderRadius:20,padding:'20px 16px',marginBottom:18,textAlign:'center'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'.24em',textTransform:'uppercase',marginBottom:16}}>GATES OPEN IN</div>
          <div style={{display:'flex',justifyContent:'center',gap:dd>0?6:14}}>
            {units.map(({v,l,c},i)=>(
              <div key={l} style={{textAlign:'center',flex:1,maxWidth:76}}>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:dd>0?46:58,color:c,lineHeight:.92,letterSpacing:'-.03em'}}>{v}</div>
                <div style={{fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:8,color:'rgba(255,255,255,.28)',letterSpacing:'.18em',marginTop:7,textTransform:'uppercase'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center',marginBottom:18}}><div style={{fontStyle:'italic',color:'rgba(255,255,255,.28)',fontSize:13,fontWeight:300}}>{COPY.homePre}</div></div>
        {showCTA&&(
          <div style={{marginBottom:18}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.26)',letterSpacing:'.2em',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>{COPY.ctaPre}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[{img:H('header-byday.webp'),label:'PLAN YOUR NIGHT',sub:'BROWSE →',color:STAGE_CFG.kineticFIELD.p,tab:'lineup'},{img:H('header-export.webp'),label:'MY SETS',sub:'EXPORT →',color:STAGE_CFG.cosmicMEADOW.p,tab:'mylist'}].map(c=>(
                <div key={c.tab} style={{position:'relative',borderRadius:14,overflow:'hidden',cursor:'pointer',border:'2px solid rgba(255,255,255,.14)'}} onClick={()=>window.__setTab&&window.__setTab(c.tab)}>
                  <img src={c.img} alt="" style={{width:'100%',height:88,objectFit:'cover',display:'block'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent,rgba(0,0,0,.88))'}}/>
                  <div style={{position:'absolute',bottom:8,left:10,right:10}}>
                    <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:11,color:'#fff',textTransform:'uppercase'}}>{c.label}</div>
                    <div style={{fontSize:10,color:c.color,fontWeight:700,marginTop:2}}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selected.length>0&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:15,textTransform:'uppercase'}}>MY LINEUP</div>
              <div style={{fontSize:11,color:STAGE_CFG.kineticFIELD.p,fontWeight:700}}>{selected.length} SETS</div>
            </div>
            {[1,2,3].map(dn=>{
              const dSets=SCHEDULE.filter(s=>selected.includes(s.id)&&s.day===dn).sort((a,b)=>toM(a.s)-toM(b.s));
              if(!dSets.length)return null;
              return(
                <div key={dn} style={{marginBottom:14}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.22)',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:7,borderBottom:'2px solid rgba(255,255,255,.1)',paddingBottom:5}}>{DAYS_LABEL[dn-1].toUpperCase()}</div>
                  {dSets.slice(0,2).map(s=>{const sc=STAGE_CFG[s.stage];return(
                    <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                      <img src={EMB(sc.key)} alt="" style={{width:40,height:30,objectFit:'contain',flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}><ArtistName name={s.artist} size={11}/><div style={{fontFamily:'DM Sans,sans-serif',fontSize:9,color:GENRES[s.g]?.color||'#888',fontWeight:700,textTransform:'uppercase',marginTop:2}}>{s.g}</div></div>
                      <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.3)',flexShrink:0}}>{fmtT(s.s)}</span>
                    </div>
                  );})}
                  {dSets.length>2&&<div style={{fontSize:10,color:'rgba(255,255,255,.2)',textAlign:'center',paddingTop:6}}>+{dSets.length-2} MORE</div>}
                </div>
              );
            })}
          </div>
        )}
        {selected.length===0&&!showCTA&&<div style={{textAlign:'center',padding:'28px 0',color:'rgba(255,255,255,.2)',fontSize:13,fontStyle:'italic'}}>Head to Lineup to build your night →</div>}
      </div>
    </div>
  );
}

function HomeLive({now,day,dayStart,selected,toggleSet,recon,sharedIds,weather}){
  const[expandedId,setExpandedId]=React.useState(null);
  const[stageFilter,setStageFilter]=React.useState('ALL');
  const{playing,upcoming,festMin}=getLiveData(day,dayStart,selected,now);
  const myNow=playing.find(s=>selected.includes(s.id));
  const myNext=SCHEDULE.filter(s=>s.day===day&&selected.includes(s.id)&&toM(s.s)>festMin).sort((a,b)=>toM(a.s)-toM(b.s))[0]||null;
  const heroSet=myNow||(playing[0]||null);const heroSc=heroSet?STAGE_CFG[heroSet.stage]:STAGE_CFG.kineticFIELD;
  let pct=0,endsInSecs=0;
  if(heroSet){const sm=toM(heroSet.s),em=toM(heroSet.e);pct=Math.min(100,Math.max(0,Math.round((festMin-sm)/(em-sm)*100)));endsInSecs=Math.max(0,Math.round((em-festMin)*60));}
  const othersNow=playing.filter(s=>s.id!==heroSet?.id).filter(s=>stageFilter==='ALL'||STAGE_CFG[s.stage]?.short===stageFilter);
  const{val:endsVal,sub:endsSub}=fmtEndsIn(endsInSecs);
  let leaveBy=null;
  if(myNext&&myNow){const leaveMs=dayStart.getTime()+(toM(myNext.s)-5-17*60)*60000;const diffMs=Math.max(0,leaveMs-now);const lm=Math.floor(diffMs/60000),ls=Math.floor((diffMs%60000)/1000);leaveBy=diffMs<300000?`${lm}:${String(ls).padStart(2,'0')}`:`${lm}m`;}
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#000'}}>
      <div style={{position:'relative',flexShrink:0,height:220,background:'#000',overflow:'hidden'}}>
        {heroSet?<img src={BKD(heroSc.key)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center bottom',display:'block'}}/>:<img src={H('header-home-live.webp')} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:52,background:'linear-gradient(to bottom,transparent,#000)'}}/>
      </div>
      <div style={{background:'#000',padding:'10px 20px 14px',flexShrink:0,borderBottom:'2px solid rgba(255,255,255,.12)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#000',border:`2px solid ${heroSet?heroSc.p:'#ff2d78'}`,borderRadius:20,padding:'5px 13px'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:heroSet?heroSc.p:'#ff2d78'}} className="pulse"/>
              <span style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:11,color:heroSet?heroSc.p:'#ff2d78',letterSpacing:'.1em',textTransform:'uppercase'}}>LIVE</span>
            </div>
            <span style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'DM Sans,sans-serif'}}>{DAYS_SHORT[day-1]}</span>
          </div>
          <WeatherPill weather={weather}/>
        </div>
        {heroSet?(
          <>
            <ArtistName name={heroSet.artist} size={26} color='#fff'/>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:5,marginBottom:11}}>
              <span style={{fontFamily:'Space Mono,monospace',fontSize:10,color:'rgba(255,255,255,.38)'}}>{fmtT(heroSet.s)} – {fmtT(heroSet.e)}</span>
              <span style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'inline-block'}}/>
              <span style={{fontFamily:'DM Sans,sans-serif',fontSize:10,color:GENRES[heroSet.g]?.color||'#888',fontWeight:700,textTransform:'uppercase'}}>{heroSet.g}</span>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{flex:1}}>
                <div style={{height:6,borderRadius:3,background:'rgba(255,255,255,.14)',overflow:'hidden',border:'1px solid rgba(255,255,255,.18)'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:heroSc.p,borderRadius:3,transition:'width 1s linear'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  <span style={{fontFamily:'Space Mono,monospace',fontSize:8,color:'rgba(255,255,255,.28)'}}>{fmtT(heroSet.s)}</span>
                  <span style={{fontFamily:'Space Mono,monospace',fontSize:8,color:'rgba(255,255,255,.28)'}}>{fmtT(heroSet.e)}</span>
                </div>
              </div>
              <div style={{background:'#000',border:`2px solid ${heroSc.p}`,borderRadius:10,padding:'8px 12px',textAlign:'center',flexShrink:0,minWidth:82}}>
                <div style={{fontFamily:'DM Sans,sans-serif',fontSize:8,color:heroSc.p,letterSpacing:'.12em',marginBottom:2,fontWeight:700,textTransform:'uppercase'}}>ENDS IN</div>
                <div style={{fontFamily:'Space Mono,monospace',fontWeight:700,fontSize:17,color:'#fff',lineHeight:1}}>{endsVal}</div>
                <div style={{fontFamily:'DM Sans,sans-serif',fontSize:7,color:'rgba(255,255,255,.28)',letterSpacing:'.08em',marginTop:2,textTransform:'uppercase'}}>{endsSub}</div>
              </div>
            </div>
          </>
        ):(
          <div style={{paddingTop:6,paddingBottom:4}}>
            <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:30,color:'rgba(255,255,255,.14)',textTransform:'uppercase',marginBottom:6}}>LIVE</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.28)',fontStyle:'italic'}}>{COPY.homeLive}</div>
          </div>
        )}
      </div>
      <div style={{flex:1,overflowY:'auto',paddingBottom:88}}>
        {myNext&&(
          <div style={{margin:'12px 16px 0',background:'#000',border:'2px solid rgba(255,255,255,.14)',borderRadius:14,padding:'13px 14px'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.25)',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:10,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>UP NEXT · YOUR SCHEDULE</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <ArtistName name={myNext.artist} size={15}/>
                <div style={{display:'flex',gap:8,marginTop:5,alignItems:'center'}}>
                  <img src={EMB(STAGE_CFG[myNext.stage].key)} alt="" style={{width:38,height:28,objectFit:'contain'}}/>
                  <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.4)'}}>{fmtT(myNext.s)}</span>
                </div>
              </div>
              {leaveBy&&(
                <div style={{background:'#000',border:`2px solid ${STAGE_CFG.kineticFIELD.p}`,borderRadius:12,padding:'10px 14px',flexShrink:0,textAlign:'center'}}>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:22,color:STAGE_CFG.kineticFIELD.p,lineHeight:1}}>{leaveBy}</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,.28)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:3,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>LEAVE BY</div>
                </div>
              )}
            </div>
          </div>
        )}
        {playing.length>1&&(
          <div style={{display:'flex',gap:6,overflowX:'auto',padding:'12px 16px 0'}}>
            {['ALL',...playing.map(s=>STAGE_CFG[s.stage]?.short).filter((v,i,a)=>a.indexOf(v)===i)].map(f=>{
              const act=stageFilter===f;const stKey=Object.keys(STAGE_CFG).find(k=>STAGE_CFG[k].short===f);const color=stKey?STAGE_CFG[stKey].p:'#fc3cbf';
              return<button key={f} onClick={()=>setStageFilter(f)} style={{flexShrink:0,padding:'5px 13px',borderRadius:20,fontSize:10,fontWeight:700,fontFamily:'Sora,sans-serif',letterSpacing:'.05em',textTransform:'uppercase',background:'#000',border:`2px solid ${act?color:'rgba(255,255,255,.2)'}`,color:act?color:'rgba(255,255,255,.38)',cursor:'pointer'}}>{f==='ALL'?'ALL STAGES':f}</button>;
            })}
          </div>
        )}
        {othersNow.length>0&&<div style={{padding:'12px 16px 6px'}}><div style={{fontSize:9,color:'rgba(255,255,255,.25)',letterSpacing:'.18em',textTransform:'uppercase',fontFamily:'DM Sans,sans-serif',fontWeight:700}}>ALSO LIVE NOW</div></div>}
        {othersNow.length>0&&(
          <div style={{padding:'4px 16px',display:'flex',flexWrap:'wrap',gap:8}}>
            {othersNow.map(s=>{
              const sc2=STAGE_CFG[s.stage];const isExp=expandedId===s.id;
              const spct=Math.min(100,Math.max(0,Math.round((festMin-toM(s.s))/(toM(s.e)-toM(s.s))*100)));
              const secs=Math.max(0,Math.round((toM(s.e)-festMin)*60));const{val:sv}=fmtEndsIn(secs);
              if(isExp)return(
                <div key={s.id} onClick={()=>setExpandedId(null)} style={{width:'100%',background:'#000',border:`2px solid ${sc2.p}`,borderRadius:14,padding:'13px',cursor:'pointer'}}>
                  <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <img src={EMB(sc2.key)} alt="" style={{width:68,height:50,objectFit:'contain',flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:sc2.p}} className="pulse"/>
                        <span style={{fontSize:10,color:sc2.p,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Sora,sans-serif'}}>LIVE NOW</span>
                        <span style={{fontFamily:'DM Sans,sans-serif',fontSize:9,color:GENRES[s.g]?.color||'#888',fontWeight:700,textTransform:'uppercase'}}>{s.g}</span>
                      </div>
                      <ArtistName name={s.artist} size={17} color='#fff'/>
                      <div style={{display:'flex',justifyContent:'space-between',marginTop:7,marginBottom:5}}>
                        <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.38)'}}>{fmtT(s.s)}</span>
                        <span style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'rgba(255,255,255,.38)'}}>{fmtT(s.e)}</span>
                      </div>
                      <div style={{height:5,borderRadius:3,background:'rgba(255,255,255,.14)',overflow:'hidden',border:'1px solid rgba(255,255,255,.18)'}}>
                        <div style={{width:`${spct}%`,height:'100%',background:sc2.p,borderRadius:3}}/>
                      </div>
                    </div>
                    <div style={{flexShrink:0,background:'#000',border:`2px solid ${sc2.p}`,borderRadius:10,padding:'8px 10px',textAlign:'center',minWidth:76}}>
                      <div style={{fontFamily:'DM Sans,sans-serif',fontSize:7.5,color:sc2.p,letterSpacing:'.1em',marginBottom:3,fontWeight:700,textTransform:'uppercase'}}>ENDS IN</div>
                      <div style={{fontFamily:'Space Mono,monospace',fontWeight:700,fontSize:sv.length>5?14:18,color:'#fff',lineHeight:1}}>{sv}</div>
                    </div>
                  </div>
                </div>
              );
              return(
                <div key={s.id} onClick={()=>setExpandedId(s.id)} style={{flexShrink:0,width:118,background:'#000',border:`2px solid ${sc2.p}`,borderTop:`3px solid ${sc2.p}`,borderRadius:12,padding:'10px',cursor:'pointer',display:'flex',flexDirection:'column',gap:6}}>
                  <img src={EMB(sc2.key)} alt="" style={{width:'100%',height:34,objectFit:'contain'}}/>
                  <ArtistName name={s.artist} size={9.5} color='rgba(255,255,255,.88)'/>
                  <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,.14)',overflow:'hidden',border:'1px solid rgba(255,255,255,.16)'}}>
                    <div style={{width:`${spct}%`,height:'100%',background:sc2.p}}/>
                  </div>
                  <div style={{background:'#000',border:`2px solid ${sc2.p}`,borderRadius:7,padding:'4px 5px',textAlign:'center'}}>
                    <div style={{fontFamily:'DM Sans,sans-serif',fontSize:7,color:sc2.p,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:1}}>ENDS IN</div>
                    <div style={{fontFamily:'Space Mono,monospace',fontWeight:700,fontSize:11,color:'#fff',lineHeight:1}}>{sv}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {playing.length===0&&<div style={{padding:'32px 20px',textAlign:'center',color:'rgba(255,255,255,.2)',fontSize:13,fontStyle:'italic'}}>No sets playing right now</div>}
      </div>
    </div>
  );
}

function HomeInter({nextDay,nextStart,now}){
  const diff=Math.max(0,nextStart-now);const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);const pad=n=>String(n).padStart(2,'0');
  const colors=[STAGE_CFG.kineticFIELD.p,STAGE_CFG.circuitGROUNDS.p,STAGE_CFG.cosmicMEADOW.p];
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:88,background:'#000'}}>
      <div style={{position:'relative',height:180,overflow:'hidden',flexShrink:0}}><img src={H('header-home-live.webp')} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/><div style={{position:'absolute',bottom:0,left:0,right:0,height:50,background:'linear-gradient(to bottom,transparent,#000)'}}/></div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 20px'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:18,fontFamily:'DM Sans,sans-serif',fontWeight:700}}>{DAYS_LABEL[nextDay-2].toUpperCase()} STARTS IN</div>
        <div style={{display:'flex',gap:14}}>
          {[{v:pad(h),l:'HRS',c:colors[0]},{v:pad(m),l:'MIN',c:colors[1]},{v:pad(s),l:'SEC',c:colors[2]}].map(({v,l,c})=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:48,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:8,color:'rgba(255,255,255,.25)',letterSpacing:'.16em',marginTop:6,textTransform:'uppercase',fontWeight:700}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePost({selected}){
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:88,background:'#000'}}>
      <div style={{position:'relative',height:200,overflow:'hidden',flexShrink:0}}><img src={H('header-home-pre.webp')} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:.5,display:'block'}}/><div style={{position:'absolute',bottom:0,left:0,right:0,height:50,background:'linear-gradient(to bottom,transparent,#000)'}}/></div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px'}}>
        <div style={{fontFamily:'Sora,sans-serif',fontSize:22,fontWeight:800,marginBottom:10,color:'rgba(255,255,255,.45)',textAlign:'center',textTransform:'uppercase'}}>SEE YOU NEXT YEAR</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,.22)',textAlign:'center',marginBottom:6}}>EDC LAS VEGAS 2026 · {selected.length} SETS CAUGHT</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.15)',fontStyle:'italic'}}>what a night.</div>
      </div>
    </div>
  );
}
