'use client';
import {useState} from 'react';
export default function SignOutButton(){const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const r=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error();window.location.assign('/login?message=signed-out');}catch{setError('Could not sign out. Try again.');setBusy(false);}}}>{busy?'Signing out…':'Sign out'}</button>{error&&<span role="alert">{error}</span>}</>;}
