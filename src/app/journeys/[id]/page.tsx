'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function JourneyLegacyRedirect({
  params
}: {
  params: { id: string }
}) {
  const { id } = params;
  
  useEffect(() => {
    redirect(`/dashboard?journeyId=${id}`);
  }, [id]);
  
  return null; // This won't render as we're redirecting
}
