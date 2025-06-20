'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function JourneysLegacyRedirect() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);
  
  return null; // This won't render as we're redirecting
}
