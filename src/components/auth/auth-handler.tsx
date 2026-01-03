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

  // Fetch the user's role document from Firestore.
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const isLoading = isUserLoading || isUserDocLoading;
  
  // Use a ref to track if a redirect has already been initiated.
  const redirectInitiated = useRef(false);

  useEffect(() => {
    // Don't do anything until all user and role data has finished loading.
    if (isLoading) {
      return;
    }
    
    // If a redirect is already in progress, do nothing to prevent loops.
    if (redirectInitiated.current) {
        return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const userRole = userData?.role;
    const isStudentOnStudentPage = userRole === 'student' && pathname.startsWith('/student');
    const isTeacherOnTeacherPage = userRole === 'teacher' && pathname.startsWith('/teacher');

    // CASE 1: User is logged in.
    if (user && userRole) {
      // If the user is on a public page (like /login), redirect them to their dashboard.
      if (isPublicPath) {
        redirectInitiated.current = true;
        const targetDashboard = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        router.replace(targetDashboard);
        return;
      }
      
      // If the user is on a page that doesn't match their role, redirect them.
      if (!isStudentOnStudentPage && !isTeacherOnTeacherPage) {
        redirectInitiated.current = true;
        const targetDashboard = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        router.replace(targetDashboard);
        return;
      }
    }
    
    // CASE 2: User is NOT logged in.
    if (!user) {
      // If they are on a protected page, redirect them to the login page.
      if (!isPublicPath) {
        redirectInitiated.current = true;
        router.replace('/login');
        return;
      }
    }

  }, [user, userData, isLoading, pathname, router, isUserDocLoading]);
  
  // This component renders nothing. It only handles effects.
  return null;
}
