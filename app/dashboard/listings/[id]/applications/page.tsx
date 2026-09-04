import AppHeader from '../../../../components/AppHeader';import {requireChatGPTUser} from '../../../../chatgpt-auth';import ApplicationReview from './ApplicationReview';import './review.css';
export const dynamic='force-dynamic';
export default async function ReviewPage(){await requireChatGPTUser('/dashboard');return <main className="app-page"><AppHeader active="dashboard"/><ApplicationReview/></main>}
