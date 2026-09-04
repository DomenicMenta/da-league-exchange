'use client';
import {useEffect,useState} from 'react';import './header.css';import './header-polish.css';
type Me={signedIn:boolean;displayName?:string;email?:string};
export default function AppHeader({active='market'}:{active?:string}){const [me,setMe]=useState<Me>({signedIn:false});useEffect(()=>{fetch('/api/me').then(r=>r.json()).then(setMe).catch(()=>{})},[]);const initials=(me.displayName||me.email||'DA').split(/\s|@/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();return <>
<div className="app-ticker">
<span>
<i/> DA DYNASTY LEAGUE EXCHANGE</span>
<span>DYNASTY&apos;S OPEN MARKET</span>
<span>POWERED BY SLEEPER</span>
</div>
<header className="app-header">
<a className="brand product-brand" href="/" aria-label="Go to the landing page">
<img src="/da-logo.png" alt="DA Dynasty"/>
<span>
<strong>DYNASTY LEAGUE</strong> EXCHANGE</span>
</a>
<nav aria-label="Primary navigation">
<a className={active==='market'?'active':''} href="/marketplace">
<i>⌁</i> Exchange</a>
<a className={active==='dashboard'?'active':''} href="/dashboard">
<i>▦</i> Dashboard</a>
<a className={active==='messages'?'active':''} href="/messages">
<i>✉</i> Messages</a>
</nav>
<div>{me.signedIn?<details className="account-menu">
<summary aria-label="Open account menu">
<span>{initials}</span>
</summary>
<aside>
<div>
<b>{me.displayName||'My account'}</b>
<small>{me.email}</small>
</div>
<a href="/profile">My Profile</a>
<a href="/dashboard?tab=notifications">Notifications <i>0</i>
</a>
<a className="logout" href="/logout">Log out</a>
</aside>
</details>:<a className="signin-link" href="/signin?return_to=%2Fdashboard" target="_top">Sign in</a>}<a className="post-link" href="/list">List a team ↗</a>
</div>
</header>
</>}
