import Link from 'next/link';

export default function SignInPage({searchParams}:{searchParams:Promise<{return_to?:string}>}){
  return <SignIn searchParams={searchParams}/>;
}

async function SignIn({searchParams}:{searchParams:Promise<{return_to?:string}>}){
  const params=await searchParams;
  const returnTo=params.return_to?.startsWith('/')?params.return_to:'/dashboard';
  return <main className="signin-page">
    <Link className="signin-brand" href="/"><img src="/da-logo.png" alt="DA"/><span><strong>DYNASTY LEAGUE</strong> EXCHANGE</span></Link>
    <section className="signin-panel">
      <span className="signin-kicker">SECURE MANAGER ACCESS</span>
      <h1>Enter the exchange.</h1>
      <p>Use your email to sign in or create an account. We’ll send a one-time verification code—no password required.</p>
      <form action="/auth/callback" method="get">
        <input type="hidden" name="return_to" value={returnTo}/>
        <label htmlFor="email">EMAIL ADDRESS</label>
        <input id="email" name="login_hint" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus/>
        <button type="submit">Send my code <span>→</span></button>
      </form>
      <small>By continuing, you agree to the marketplace rules and privacy policy.</small>
    </section>
    <Link className="signin-back" href="/marketplace">← Back to the open market</Link>
  </main>;
}
