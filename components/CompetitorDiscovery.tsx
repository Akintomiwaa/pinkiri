"use client";
import {useEffect,useRef,useState} from 'react';
import type {Report} from '../lib/research-types';
import {LoaderCircle,RefreshCw} from 'lucide-react';
export default function CompetitorDiscovery({report,url,onChange}:{report:Report;url:string;onChange:(value:NonNullable<Report['discovery']>)=>void}){
 const started=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function discover(){setBusy(true);setError('');try{const response=await fetch('/api/competitors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,name:report.brand.name,summary:report.brand.summary,audience:report.brand.audience,region:report.targetMarket})});const d=await response.json() as NonNullable<Report['discovery']>&{error?:string};if(!response.ok)throw Error(d.error||'Discovery failed.');onChange(d);}catch(e){setError(e instanceof Error?e.message:'Discovery failed.')}finally{setBusy(false)}}
 useEffect(()=>{if(!started.current&&!report.discovery){started.current=true;void discover()}},[]);
 return <div className="cw-discovered">{busy&&<p role="status"><LoaderCircle size={12} className="spin"/> Finding and verifying competitors…</p>}{error&&<p role="alert" className="cw-small">{error}</p>}{report.discovery?.competitors.map(c=><details key={c.url}><summary>{c.name} <small>{c.fit}</small></summary><p>{c.reason}</p><p>Difference: {c.difference}</p><a href={c.url} target="_blank" rel="noreferrer">Read product source ↗</a></details>)}{report.discovery&&!report.discovery.competitors.length&&<p>No verified competitor found in this search.</p>}{report.discovery?.gaps.map(g=><p className="cw-small" key={g}>{g}</p>)}{report.discovery&&<p className="cw-small">Discovered {new Date(report.discovery.searchedAt).toLocaleDateString()} · Fit is an AI assessment of reviewed product pages.</p>}{!busy&&<button onClick={discover}><RefreshCw size={12}/>{report.discovery?'Check competitors again':'Discover competitors'}</button>}</div>
}
