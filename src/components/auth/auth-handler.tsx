
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * An invisible component that handles auth-related redirection logic.
 * It listens for auth state changes and redirects users based on their role.
 */
export function AuthHandler() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  // Get the user's profile from Firestore
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    const isAuthPage = pathname === '/login';
    const isLandingPage = pathname === '/';
    
    // Wait until we have all the user information.
    if (isUserLoading || (user && isUserDocLoading)) {
      return;
    }

    if (user && userData) {
        // If the user is logged in and on the login/landing page, redirect them to their dashboard.
        if (isAuthPage || isLandingPage) {
            const { role } = userData;
            if (role === 'teacher') {
                router.replace('/teacher/dashboard');
            } else if (role === 'student') {
                router.replace('/student/dashboard');
            }
        }
    } else if (!user && !isAuthPage && !isLandingPage) {
        // If the user is not logged in and not on a public page, send them to login.
        router.replace('/login');
    }

  }, [user, userData, isUserLoading, isUserDocLoading, pathname, router]);

  // This component does not render anything.
  return null;
}
