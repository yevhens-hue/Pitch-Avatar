import { NextRequest, NextResponse } from 'next/server';
import { getEnrollmentByLinkId } from '@/app/actions/enrollments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;

  const enrollment = await getEnrollmentByLinkId(linkId);

  if (!enrollment) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  if (enrollment.status === 'Expired') {
    return NextResponse.redirect(new URL('/enrollments/expired', request.url));
  }

  const searchParams = new URLSearchParams({
    enrollmentId: enrollment.enrollmentId,
    ...(enrollment.listenerId ? { listenerId: enrollment.listenerId } : {}),
  });

  return NextResponse.redirect(
    new URL(`/coach/${enrollment.projectId}?${searchParams.toString()}`, request.url)
  );
}
