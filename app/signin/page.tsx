import {redirect} from 'next/navigation';

export default async function SignInPage({searchParams}:{searchParams:Promise<{return_to?:string}>}){
  const params=await searchParams;
  const returnTo=params.return_to?.startsWith('/')&&!params.return_to.startsWith('//')
    ?params.return_to
    :'/dashboard';
  redirect(`/auth/callback?return_to=${encodeURIComponent(returnTo)}`);
}
