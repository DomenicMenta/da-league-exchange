import AppHeader from '../components/AppHeader';import {requireChatGPTUser} from '../chatgpt-auth';import ProfileEditor from './ProfileEditor';import './profile.css';
export const dynamic='force-dynamic';
export default async function Profile(){await requireChatGPTUser('/profile');return <main className="app-page"><AppHeader active="profile"/><ProfileEditor/></main>}
