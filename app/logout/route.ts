import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { sha256 } from '../chatgpt-auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('da_session')?.value;
  if (token) await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await sha256(token)).run();
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('da_session', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
