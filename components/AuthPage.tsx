import AuthForm from './AuthForm';
import {authConfig,currentUser} from '../lib/auth/server';
import {safeNext} from '../lib/auth/paths.mjs';
import {redirect} from 'next/navigation';
const messages:Record<string,string>={'signed-out':'You have signed out.','password-updated':'Your password has been updated. Sign in with your new password.','invalid-link':'This sign-in link is invalid or expired. Try signing in again or request a new reset link.'};
export default async function AuthPage({mode,searchParams}:{mode:'login'|'signup'|'forgot'|'reset';searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,next=safeNext(typeof query.next==='string'?query.next:'/');
 return <AuthContent mode={mode} next={next} message={typeof query.message==='string'?messages[query.message]:undefined}/>;
}
async function AuthContent({mode,next,message}:{mode:'login'|'signup'|'forgot'|'reset';next:string;message?:string}){
 if(mode==='reset'&&!await currentUser())redirect('/forgot-password?message=invalid-link');
 const title={login:'Welcome back.',signup:'Your next chapter starts here.',forgot:'Let’s get you back in.',reset:'Choose a new password.'}[mode];
 const subtitle={login:'Sign in to your marketing workspace.',signup:'Create your Pinkiri account to begin.',forgot:'Enter your email and we’ll send a reset link.',reset:'Make it unique to your Pinkiri account.'}[mode];
 return <main className="pinkiri-auth"><a className="pa-brand" href="/"><img src="/favicon.svg" alt=""/>Pinkiri</a><div className="pa-layout"><section className="pa-story"><span className="pa-eyebrow">YOUR AI CMO</span><h1>Listen closely.<br/>Find your<br/><em>next move.</em></h1><p>Turn customer conversations into a clearer direction for your product, marketing and content.</p><span className="pa-footnote">Research. Strategy. Content. One workspace.</span></section><section className="pa-card"><h2>{title}</h2><p className="pa-subtitle">{subtitle}</p><AuthForm mode={mode} next={next} configured={!!authConfig()} message={message}/></section></div><footer>Pinkiri · Built around your customers.</footer></main>;
}
