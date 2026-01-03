
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
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


async function createUserProfile(user: User, role: 'teacher' | 'student') {
    const db = getFirestore(user.provider.app);
    const userRef = doc(db, 'users', user.uid);
    // Check if the document already exists
    const docSnap = await getDoc(userRef);
    
    // Only create a new profile if one doesn't exist
    if (!docSnap.exists()) {
        await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: role,
        });
    }
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
  // We check for an existing profile before creating a new one with a default role.
  await createUserProfile(result.user, 'student');
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {});
}
