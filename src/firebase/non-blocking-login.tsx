
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


async function createUserProfile(user: User, role: 'teacher' | 'student') {
    const db = getFirestore(user.provider.app);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role,
    });
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, role: 'teacher' | 'student'): Promise<void> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  await createUserProfile(userCredential.user, role);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {});
}

/** Initiate Google sign-in (non-blocking). */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(authInstance, provider);
  
  // For Google sign-in, we don't know the role.
  // A real app would have a post-registration step to select a role.
  // For now, we'll default to 'student' as a placeholder.
  await createUserProfile(result.user, 'student');
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {});
}
