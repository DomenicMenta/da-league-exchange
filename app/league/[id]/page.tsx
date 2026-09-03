'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import {sampleListings} from '../../marketplace/MarketplaceClient';
import './detail.css';
type Player={pos:string;name:string;team:string;sleeperId?:string;starter?:boolean};
type Listing={id:string;title:string;league:string;commissioner:string;format:string;ppr:string;tep:string;type:string;buyIn:number;usual:number;lineup:Player[];roster?:Player[];verified:boolean;teamCount:number;season:number;description:string;bylawsUrl?:string;bylawsText?:string;draftCapital?:string};
export default function LeagueDetail(){
 const {id}=useParams<{id:string}>(),[listing,setListing]=useState<Listing|null>(null),[missing,setMissing]=useState(false),[applied,setApplied]=useState(false),[saved,setSaved]=useState(false),[saving,setSaving]=useState(false),[sending,setSending]=useState(false);
 useEffect(()=>{fetch(`/api/listings?id=${encodeURIComponent(id)}`).then(async r=>{if(!r.ok)throw new Error();return r.json()}).then(x=>setListing(x.listing)).catch(()=>{const sample=sampleListings.find(x=>x.id===id);if(sample)setListing({...sample,title:'Available franchise',teamCount:12,season:2026,description:'Contact the commissioner through the listing chat or submit an application to learn more about league activity, rules, and long-term expectations.'});else setMissing(true)})},[id]);
 useEffect(()=>{fetch(`/api/watchlist?openingId=${encodeURIComponent(id)}`).then(r=>r.json()).then(x=>setSaved(Boolean(x.saved))).catch(()=>{})},[id]);
 async function toggleSaved(){if(saving)return;setSaving(true);const r=await fetch('/api/watchlist',{method:saved?'DELETE':'POST',headers:{'content-type':'application/json'},body:JSON.stringify({openingId:id})});if(r.status===401){location.href=`/signin?return_to=${encodeURIComponent(location.pathname)}`;return}if(r.ok)setSaved(!saved);setSaving(false)}
 async function apply(e:FormEvent<HTMLFormElement>){e.preventDefault();setSending(true);const form=new FormData(e.currentTarget),r=await fetch('/api/applications',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({openingId:id,message:form.get('message')})});if(r.status===401){location.href=`/signin?return_to=${encodeURIComponent(location.pathname)}`;return}setApplied(r.ok);setSending(false)}
 if(missing)return <main className="app-page">
<AppHeader/>
<div className="detail-shell">
<div className="detail-block">
<h1>Listing unavailable</h1>
<p>This team is no longer open or could not be found.</p>
<a href="/marketplace">← Return to the Exchange</a>
</div>
</div>
</main>;
 if(!listing)return <main className="app-page">
<AppHeader/>
<div className="detail-shell">
<p>Loading full listing…</p>
</div>
</main>;
 const discount=listing.buyIn<listing.usual;
 return <main className="app-page">
<AppHeader/>
<div className="detail-shell">
<div className="breadcrumbs">
<a href="/marketplace">Marketplace</a>
<span>→</span>
<span>{listing.league}</span>
<span>→</span>
<b>{listing.title}</b>
</div>
<section className="detail-hero">
<div>{listing.verified&&<span className="verified">✓ VERIFIED SLEEPER LEAGUE</span>}<h1>{listing.title}</h1>
<p>{listing.league} · {listing.teamCount} Team {listing.format} · {listing.ppr} · {listing.tep}</p>
<div className="detail-tags">
<i>{listing.type}</i>
<i>ACTIVE LISTING</i>
<i>{listing.season} SEASON</i>
</div>
</div>
<div className="detail-price">
<span>{listing.season} BUY-IN</span>
<b className={discount?'discount':''}>${listing.buyIn}</b>{discount&&<small>Usually <s>${listing.usual}</s>
</small>}</div>
</section>
<div className="detail-layout">
<section className="detail-main">
<div className="detail-block roster-detail">
<div className="panel-title">
<div>
<span className="kicker">THE ASSET</span>
<h2>Full team</h2>
</div>
<small>{(listing.roster||listing.lineup).length} players · Imported from Sleeper</small>
</div>
<RosterSection title="STARTING LINEUP" players={(listing.roster||listing.lineup).filter(player=>player.starter!==false)}/>{(listing.roster||[]).some(player=>player.starter===false)&&<RosterSection title="BENCH & TAXI" players={(listing.roster||[]).filter(player=>player.starter===false)}/>} {listing.draftCapital&&<div className="capital">
<span>
<small>DRAFT CAPITAL</small>
<b>{listing.draftCapital}</b>
</span>
</div>}</div>
<div className="detail-block">
<span className="kicker">THE LEAGUE</span>
<h2>What makes this league special</h2>
<p>{listing.description||'The commissioner has not added a league description yet.'}</p>
<div className="fact-grid">
<span>
<small>FORMAT</small>
<b>{listing.format}</b>
</span>
<span>
<small>SCORING</small>
<b>{listing.ppr} · {listing.tep}</b>
</span>
<span>
<small>LEAGUE TYPE</small>
<b>{listing.type}</b>
</span>
<span>
<small>COMMISSIONER</small>
<b>{listing.commissioner}</b>
</span>
</div>{listing.bylawsUrl?<a className="bylaws" href={listing.bylawsUrl} target="_blank" rel="noreferrer">Read complete league bylaws ↗</a>:listing.bylawsText&&<div>
<h3>League bylaws</h3>
<p>{listing.bylawsText}</p>
</div>}</div>
</section>
<aside className="apply-card">
<div className="commish">
<b>{listing.commissioner.slice(0,2).toUpperCase()}</b>
<span>
<small>COMMISSIONER</small>
<strong>{listing.commissioner}</strong>
<em>Listing owner</em>
</span>
</div>
<p>Your Exchange profile is automatically included so the commissioner can review your manager history.</p>{applied?<div className="applied">
<b>✓</b>
<h3>Application sent</h3>
<p>Your profile and optional note are now available to the commissioner.</p>
<a href="/dashboard?tab=applications">Open dashboard →</a>
</div>:<form onSubmit={apply}>
<label>NOTE TO COMMISSIONER <small>OPTIONAL</small>
<textarea name="message" placeholder="Anything you want the commissioner to know..."/>
</label>
<button className="primary" disabled={sending}>{sending?'Sending profile…':'Apply with my profile →'}</button>
</form>}<button className="save" onClick={toggleSaved} disabled={saving}>{saving?'Saving…':saved?'★ Saved to watchlist':'☆ Save to watchlist'}</button>
<small className="apply-note">No application essay required.</small>
</aside>
</div>
</div>
</main>;
}
function RosterSection({title,players}:{title:string;players:Player[]}){return <section className="full-roster">
<h3>{title}<span>{players.length}</span>
</h3>
<div>{players.map((player,i)=>
<article key={`${player.sleeperId||player.name}-${i}`}>
<em className={`pos ${player.pos.toLowerCase()}`}>{player.pos}</em>
<span className="player-face">
<span>{player.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span>{player.sleeperId&&<img src={`https://sleepercdn.com/content/nfl/players/${player.sleeperId}.jpg`} alt="" loading="lazy" onError={e=>e.currentTarget.remove()}/>}</span>
<b>{player.name}</b>
<small>{player.team||'FA'}</small>
</article>)}</div>
</section>}
