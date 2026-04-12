"use client";

import Head from 'next/head';
import Player from '../../components/Player/Player';
import { useRouter } from 'next/navigation';

export default function PlayPage() {
  const router = useRouter();
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a'}} className="animate-fade-in">
      <Head>
        <title>Playing Preview | Pitch Avatar</title>
      </Head>
      
      <header style={{padding: '1rem 2rem', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontWeight: 600, fontSize: '1.2rem', color: 'white'}}>Pitch Avatar Presentation</div>
        <button onClick={() => router.back()} style={{padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer'}}>Exit Preview</button>
      </header>

      <main style={{flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Player />
      </main>
    </div>
  );
}
