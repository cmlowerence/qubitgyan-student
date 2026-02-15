'use client';

import { useEffect } from 'react';
import { pingGamification } from '@/lib/learning';
import { useAuth } from '@/context/auth-context';

export function useGamificationHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    // If the user isn't logged in, don't ping.
    if (!user) return;

    // Fire immediately on load (counts as 1 minute of activity just for showing up)
    pingGamification(1);

    // Set up the interval to fire every 5 minutes (300,000 milliseconds)
    const intervalId = setInterval(() => {
      // We only want to ping if the tab is actually active/visible to the user
      if (document.visibilityState === 'visible') {
        pingGamification(5);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);
}