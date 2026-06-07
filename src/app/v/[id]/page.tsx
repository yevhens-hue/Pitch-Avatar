"use client";

import Head from 'next/head';
import Player from '../../../components/Player/Player';
import { useParams, useRouter } from 'next/navigation';

export default function PresentationViewer() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a'}} className="animate-fade-in">
      <Head>
        <title>Pitch Avatar Presentation</title>
      </Head>
      
      <header style={{padding: '1rem 2rem', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontWeight: 600, fontSize: '1.2rem', color: 'white'}}>Pitch Avatar Viewer</div>
        {/* Placeholder for future listener info or controls */}
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Enrollment ID: {id}
        </div>
      </header>

      <main style={{flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Player enrollmentLinkId={id} />
      </main>
    </div>
  );
}
