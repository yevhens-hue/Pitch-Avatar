"use client";

import Head from 'next/head';
import AnalyticsDashboard from '../../components/Analytics/AnalyticsDashboard';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const router = useRouter();
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}} className="animate-fade-in">
      <Head>
        <title>Analytics | Pitch Avatar</title>
      </Head>
      
      <header style={{padding: '1rem 2rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontWeight: 600, fontSize: '1.2rem'}}>Pitch Avatar Dashboard</div>
        <button onClick={() => router.push('/')} style={{padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer'}}>Back to Home</button>
      </header>

      <main style={{flex: 1}}>
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
