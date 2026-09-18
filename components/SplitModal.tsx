'use client';
import {useEffect,useRef,type ReactNode} from 'react';
export default function SplitModal({title,children,aside,onClose}:{title:string;children:ReactNode;aside:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=ref.current;node?.showModal();return()=>node?.close()},[]);
 return <dialog ref={ref} className="pk-modal" aria-label={title} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}><div className="pk-modal-grid"><section className="pk-modal-form"><div className="pk-modal-brand"><img src="/favicon.svg" alt=""/>Pinkiri</div><h2>{title}</h2>{children}</section><aside className="pk-modal-aside">{aside}</aside></div><button type="button" className="pk-modal-close" aria-label="Close dialog" onClick={onClose}>×</button></dialog>;
}
