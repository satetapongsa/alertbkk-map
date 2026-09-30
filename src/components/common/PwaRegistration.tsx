'use client';

import { useEffect } from 'react';

export const PwaRegistration = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Service worker active
        })
        .catch(() => {
          // Registration ignored in development or unsupported contexts
        });
    }
  }, []);

  return null;
};
