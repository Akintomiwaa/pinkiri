"use client";
import {useState,type ReactNode} from 'react';
import {ChevronDown,ChevronRight,Maximize2,Minimize2} from 'lucide-react';
export default function WorkspaceCard({title,children,defaultOpen=true,id}:{title:string;children:ReactNode;defaultOpen?:boolean;id?:string}){
 const [open,setOpen]=useState(defaultOpen),[expanded,setExpanded]=useState(false);
 return <article id={id} className={'cw-card cw-fold-card'+(expanded?' cw-expanded':'')} onKeyDown={e=>{if(e.key==='Escape')setExpanded(false)}}><div className="cw-fold-head"><button aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<ChevronDown size={13}/>:<ChevronRight size={13}/>}<span>{title}</span></button><button aria-label={(expanded?'Restore ':'Expand ')+title} onClick={()=>{setOpen(true);setExpanded(!expanded)}}>{expanded?<Minimize2 size={13}/>:<Maximize2 size={13}/>}</button></div>{open&&<div className="cw-fold-body">{children}</div>}</article>
}
