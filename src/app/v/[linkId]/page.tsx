import { redirect, notFound } from 'next/navigation';
import { getEnrollmentByLinkId } from '@/app/actions/enrollments';

interface Props {
  params: Promise<{ linkId: string }>;
}

export default async function EnrollmentViewer({ params }: Props) {
  const { linkId } = await params;

  // getEnrollmentByLinkId searches by partial match on unique_url
  // The full url is like /v/enroll-XXXXXXXX-YYYYYYYY, so linkId = "enroll-XXXXXXXX-YYYYYYYY"
  const enrollment = await getEnrollmentByLinkId(linkId);

  if (!enrollment) {
    notFound();
  }

  if (enrollment.status === 'Expired') {
    redirect('/enrollments/expired');
  }

  // Redirect to the coach/train session, passing enrollmentId and listenerId for tracking
  const params_str = new URLSearchParams({
    enrollmentId: enrollment.enrollmentId,
    ...(enrollment.listenerId ? { listenerId: enrollment.listenerId } : {}),
  }).toString();

  redirect(`/coach/${enrollment.projectId}?${params_str}`);
}
