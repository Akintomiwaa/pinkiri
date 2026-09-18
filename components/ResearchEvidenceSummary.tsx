import type {Report} from '../lib/research-types';
import WorkspaceCard from './WorkspaceCard';
export default function ResearchEvidenceSummary({report}:{report:Report}){
 const social=report.sources.filter(s=>s.kind==='social');
 const dated=social.filter(s=>s.publishedAt&&Number.isFinite(Date.parse(s.publishedAt)));
 const recent=dated.filter(s=>{const age=Date.parse(report.createdAt)-Date.parse(s.publishedAt!);return age>=0&&age<=30*86400000});
 const customer=report.signals.filter(s=>s.speaker==='customer/community');
 return <WorkspaceCard title="Evidence behind this report"><p>{social.length} social pages read · {recent.length} dated within 30 days of research · {social.length-dated.length} with unknown publication dates.</p><p>{customer.length} customer/community findings; {report.signals.length-customer.length} creator or unclear-speaker findings. These are findings, not a count of unique customers or a representative sentiment survey.</p><p>Customer/community sentiment: {['positive','negative','mixed','neutral','unclear'].map(t=>`${t}: ${customer.filter(s=>s.sentiment===t).length}`).join(' · ')}.</p><p>Trend direction is not measured. Recent search results show conversations to investigate; they do not establish that demand is increasing.</p><details><summary>Research coverage and limitations</summary>{report.coverage.filter(c=>c.platform!=='Reddit').map((c,i)=><p key={i}><strong>{c.platform}</strong> · {c.query}<br/>{c.read} pages read · {c.status}</p>)}<ul>{report.unknowns.map((u,i)=><li key={i}>{u}</li>)}</ul></details></WorkspaceCard>
}
