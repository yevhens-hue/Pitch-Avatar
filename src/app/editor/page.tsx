"use client";

import Head from 'next/head';
import ProjectEditor from '../../components/ProjectEditor/ProjectEditor';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function EditorContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId') || undefined;

  return <ProjectEditor projectId={projectId} />;
}

export default function EditorPage() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}} className="animate-fade-in">
      <Head>
        <title>Editor | Pitch Avatar</title>
      </Head>

      <main style={{flex: 1, position: 'relative'}}>
        <Suspense fallback={<div>Loading Editor...</div>}>
          <EditorContent />
        </Suspense>
      </main>
    </div>
  );
}
