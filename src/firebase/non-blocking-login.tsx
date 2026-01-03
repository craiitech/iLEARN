
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  FirebaseApp,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


async function createUserProfile(app: FirebaseApp, user: User, role: 'teacher' | 'student') {
    const db = getFirestore(app);
    const userRef = doc(db, 'users', user.uid);
    // Check if the document already exists
    const docSnap = await getDoc(userRef);
    
    // Only create a new profile if one doesn't exist
    if (!docSnap.exists()) {
        await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
        });
    }
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, role: 'teacher' | 'student'): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  await createUserProfile(authInstance.app, userCredential.user, role);
  return userCredential;
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export async function initiateGoogleSignIn(authInstance: Auth, role: 'teacher' | 'student'): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(authInstance, provider);
  await createUserProfile(authInstance.app, result.user, role);
  return result;
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}
