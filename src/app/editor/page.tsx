"use client";

import Head from 'next/head';
import ProjectEditor from '../../components/ProjectEditor/ProjectEditor';

import { useRouter } from 'next/navigation';

export default function EditorPage() {
  const router = useRouter();
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}} className="animate-fade-in">
      <Head>
        <title>Editor | Pitch Avatar</title>
      </Head>
      
      <header style={{padding: '1rem 2rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontWeight: 600, fontSize: '1.2rem'}}>Pitch Avatar Editor</div>
        <div style={{display: 'flex', gap: '1rem'}}>
           <button onClick={() => router.push('/play')} style={{padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer'}}>Preview</button>
           <button style={{padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>Share project</button>
        </div>
      </header>

      <main style={{flex: 1, position: 'relative'}}>
        <ProjectEditor />
      </main>
    </div>
  );
}
