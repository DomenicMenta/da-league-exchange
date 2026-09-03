import {env} from 'cloudflare:workers';import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function LeagueLayout({children,params}:{children:React.ReactNode;params:Promise<{id:string}>}){const [{id},user]=await Promise.all([params,getChatGPTUser()]);await env.DB.prepare('INSERT INTO listing_views(id,opening_id,viewer_user_id,viewed_at) VALUES(?,?,?,?)').bind(crypto.randomUUID(),id,user?.userId||null,Date.now()).run();return children}
