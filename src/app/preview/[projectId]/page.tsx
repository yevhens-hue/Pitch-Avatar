import React from 'react';
import PreviewTrainMode from '@/components/Preview/PreviewTrainMode';
import { getProjectById } from '@/app/actions/projects';

interface PreviewPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { projectId } = await params;

  const project = await getProjectById(projectId);
  
  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <h2>Project not found</h2>
        <p>The project you are looking for does not exist or you do not have access to it.</p>
      </div>
    );
  }

  // Normalise slides for preview
  const slides = (project.slides || []).map((s: any, index: number) => ({
    id: s.id || index + 1,
    text: s.text || s.script || s.content || '',
    title: s.title,
    thumbnailUrl: s.thumbnailUrl
  }));

  return (
    <PreviewTrainMode 
      projectId={project.id} 
      projectTitle={project.title || 'Untitled Project'} 
      slides={slides} 
    />
  );
}
