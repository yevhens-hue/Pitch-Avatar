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

      <main style={{flex: 1, position: 'relative'}}>
        <ProjectEditor />
      </main>
    </div>
  );
}
