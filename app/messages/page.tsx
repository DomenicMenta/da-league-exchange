import AppHeader from '../components/AppHeader';import {requireChatGPTUser} from '../chatgpt-auth';import MessagesInbox from './MessagesInbox';import './messages.css';
export const dynamic='force-dynamic';
export default async function Messages(){await requireChatGPTUser('/messages');return <main className="app-page"><AppHeader active="messages"/><MessagesInbox/></main>}
