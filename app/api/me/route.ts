import {NextResponse} from 'next/server';import {getChatGPTUser} from '../../chatgpt-auth';
export async function GET(){const user=await getChatGPTUser();return NextResponse.json(user?{signedIn:true,displayName:user.fullName||user.displayName,email:user.email}:{signedIn:false})}
