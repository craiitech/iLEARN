'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

// Define paths that are public and don't require authentication.
const PUBLIC_PATHS = ['/', '/login'];

/**
 * A client component responsible for handling all authentication-based routing logic.
 * It ensures that users are correctly redirected based on their auth state and role.
 */
export function AuthHandler() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const redirectInitiated = useRef(false);

  // Fetch the user's role document from Firestore.
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const isLoading = isUserLoading || isUserDocLoading;

  useEffect(() => {
    // If we're already processing auth state or a redirect has started, do nothing.
    if (isLoading || redirectInitiated.current) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const userRole = userData?.role;

    // CASE 1: User is logged in.
    if (user && userRole) {
      redirectInitiated.current = true; // Mark that we are initiating a redirect.
      const targetDashboard = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      const isStudentOnStudentPage = userRole === 'student' && pathname.startsWith('/student');
      const isTeacherOnTeacherPage = userRole === 'teacher' && pathname.startsWith('/teacher');

      // If the user is on a public page (like /login), redirect them to their dashboard.
      if (isPublicPath) {
        router.replace(targetDashboard);
        return;
      }

      // If the user is on a page that doesn't match their role, redirect them.
      if (!isStudentOnStudentPage && !isTeacherOnTeacherPage) {
        router.replace(targetDashboard);
        return;
      }
      
      // If we've reached here, the user is on a valid page, so we can reset the flag.
      redirectInitiated.current = false;
    }

    // CASE 2: User is NOT logged in.
    if (!user) {
      // If they are on a protected page, redirect them to the login page.
      if (!isPublicPath) {
        redirectInitiated.current = true; // Mark that we are initiating a redirect.
        router.replace('/login');
        return;
      }
    }

  }, [user, userData, isLoading, pathname, router]);
  
  // This component renders nothing. It only handles effects.
  return null;
}
