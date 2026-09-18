import {redirect} from 'next/navigation';
import {safeNext} from '../lib/auth/paths.mjs';
export default async function PausedAuthPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const query=await searchParams;return <Resume next={safeNext(typeof query.next==='string'?query.next:'/')}/>;}
function Resume({next}:{next:string}){redirect(next);return null;}
