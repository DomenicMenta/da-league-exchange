import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { sha256 } from '../../chatgpt-auth';

const SESSION_SECONDS = 60 * 60 * 24 * 30;

function safeReturnTo(value: string | null): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/dashboard';
  try {
    const url = new URL(value, 'https://app.local');
    return url.origin === 'https://app.local' ? `${url.pathname}${url.search}` : '/dashboard';
  } catch {
    return '/dashboard';
  }
}

export async function GET(request: NextRequest) {
  const email = request.headers.get('cf-access-authenticated-user-email')?.trim().toLowerCase();
  if (!email) {
    return new NextResponse('Email verification is required to continue.', { status: 401 });
  }

  const now = Date.now();
  const userId = `email:${(await sha256(email)).slice(0, 32)}`;
  const displayName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const handle = email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 30) || 'manager';
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const tokenHash = await sha256(token);

  await env.DB.batch([
    env.DB.prepare("INSERT INTO users(id,email,display_name,handle,bio,role,created_at) VALUES(?,?,?,?,?,'manager',?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name")
      .bind(userId, email, displayName, `${handle}_${userId.slice(-5)}`, '', now),
    env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(now),
    env.DB.prepare('INSERT INTO auth_sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)')
      .bind(tokenHash, userId, now, now + SESSION_SECONDS * 1000),
  ]);

  const response = NextResponse.redirect(new URL(safeReturnTo(request.nextUrl.searchParams.get('return_to')), request.url));
  response.cookies.set('da_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS });
  return response;
}
