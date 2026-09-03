import {env} from 'cloudflare:workers';
import {NextRequest,NextResponse} from 'next/server';
import {getChatGPTUser} from '../../chatgpt-auth';

type PublishBody={
  sleeperLeagueId:string;leagueName:string;season:string|number;teamCount:number;
  rosterId:number;title:string;format:string;scoring:string;buyIn:number;usualBuyIn:number;
  bylawsMode:'url'|'text';bylaws:string;description:string;draftCapital:string;
  lineup:Array<{pos:string;name:string;team:string;sleeperId?:string}>;
};

export async function GET(request:NextRequest){
  const id=request.nextUrl.searchParams.get('id');
  const statement=env.DB.prepare(`SELECT o.id,o.title,o.roster_summary rosterSummary,l.name league,
    l.format,l.scoring,l.entry_fee_cents buyIn,l.usual_entry_fee_cents usualBuyIn,u.display_name commissioner,
    l.team_count teamCount,l.season,l.description,l.bylaws_url bylawsUrl,l.bylaws_text bylawsText,o.draft_capital draftCapital,
    (SELECT COUNT(*) FROM listing_messages m WHERE m.opening_id=o.id) chat
    FROM openings o JOIN leagues l ON l.id=o.league_id JOIN users u ON u.id=l.owner_user_id
    WHERE o.status='open' ${id?'AND o.id=?':''} ORDER BY o.created_at DESC`);
  const rows=await (id?statement.bind(id):statement).all<Record<string,unknown>>();
  const listings=rows.results.map(row=>{
    let summary:{lineup?:unknown[];type?:string;ppr?:string;tep?:string;verified?:boolean}={};
    try{summary=JSON.parse(String(row.rosterSummary||'{}'))}catch{}
    return {id:row.id,league:row.league,commissioner:row.commissioner,format:row.format,
      ppr:summary.ppr||row.scoring,tep:summary.tep||'No TEP',type:summary.type||'Dynasty',
      buyIn:Number(row.buyIn||0)/100,usual:Number(row.usualBuyIn||row.buyIn||0)/100,
      lineup:Array.isArray(summary.lineup)?summary.lineup:[],chat:Number(row.chat||0),verified:Boolean(summary.verified),
      title:row.title,teamCount:Number(row.teamCount||0),season:Number(row.season||0),description:row.description,
      bylawsUrl:row.bylawsUrl,bylawsText:row.bylawsText,draftCapital:row.draftCapital};
  });
  if(id&&!listings[0])return NextResponse.json({error:'Listing not found.'},{status:404});
  return NextResponse.json(id?{listing:listings[0]}:{listings});
}

export async function POST(request:NextRequest){
  const user=await getChatGPTUser();
  if(!user)return NextResponse.json({error:'Sign in to publish.'},{status:401});
  const body=await request.json() as PublishBody;
  if(!body.sleeperLeagueId||!body.leagueName||!body.rosterId||!body.title?.trim())
    return NextResponse.json({error:'League, roster, and title are required.'},{status:400});
  const now=Date.now(),leagueId=`sleeper:${body.sleeperLeagueId}`,openingId=`LX-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const ppr=/0\.5/.test(body.scoring)?'0.5 PPR':/PPR|1/.test(body.scoring)?'1.0 PPR':'Standard';
  const tepMatch=body.scoring.match(/(?:TEP|TE premium)\s*([0-9.]+)/i);
  const summary=JSON.stringify({lineup:body.lineup||[],type:'Dynasty',ppr,tep:tepMatch?`${tepMatch[1]} TEP`:'No TEP',verified:true});
  const handle=(user.email.split('@')[0].replace(/[^a-z0-9_]/gi,'').slice(0,24)||'manager')+'_'+user.userId.slice(-5);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO users(id,email,display_name,handle,bio,role,created_at) VALUES(?,?,?,?,?,'manager',?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name")
      .bind(user.userId,user.email,user.displayName,handle,'',now),
    env.DB.prepare(`INSERT INTO leagues(id,owner_user_id,sleeper_league_id,name,season,format,team_count,scoring,entry_fee_cents,usual_entry_fee_cents,dues_status,bylaws_url,bylaws_text,description,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,'unknown',?,?,?,?,?) ON CONFLICT(sleeper_league_id) DO UPDATE SET owner_user_id=excluded.owner_user_id,name=excluded.name,season=excluded.season,format=excluded.format,team_count=excluded.team_count,scoring=excluded.scoring,entry_fee_cents=excluded.entry_fee_cents,usual_entry_fee_cents=excluded.usual_entry_fee_cents,bylaws_url=excluded.bylaws_url,bylaws_text=excluded.bylaws_text,description=excluded.description,updated_at=excluded.updated_at`)
      .bind(leagueId,user.userId,body.sleeperLeagueId,body.leagueName,Number(body.season)||new Date().getFullYear(),body.format||'1QB',Number(body.teamCount)||12,body.scoring||'PPR',Math.max(0,Math.round(Number(body.buyIn||0)*100)),Math.max(Number(body.usualBuyIn||0),Number(body.buyIn||0))*100,body.bylawsMode==='url'?body.bylaws:null,body.bylawsMode==='text'?body.bylaws:'',body.description||'',now,now),
    env.DB.prepare(`INSERT INTO openings(id,league_id,title,roster_id,roster_summary,draft_capital,record,status,requirements,featured,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'open','',0,?,?)`)
      .bind(openingId,leagueId,body.title.trim(),body.rosterId,summary,body.draftCapital||'','',now,now),
  ]);
  return NextResponse.json({ok:true,id:openingId,url:`/league/${openingId}`},{status:201});
}
