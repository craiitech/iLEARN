
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { GraduationCap, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

const GoogleIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-2"
  >
    <title>Google</title>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.88 1.62-4.59 0-8.32-3.57-8.32-7.92s3.73-7.92 8.32-7.92c2.21 0 4.09.81 5.61 2.29l2.2-2.2C18.02 3.24 15.48 2 12.48 2 7.03 2 3 6.03 3 11s4.03 9 9.48 9c2.82 0 5.17-1 7.09-2.92 2.02-2.02 2.64-5.02 2.64-7.92v-3.28h-9.72z"
      fill="currentColor"
    />
  </svg>
);

export default function UnifiedLoginPage() {
  const { toast } = useToast();
  const { auth } = useFirebase();
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const handleAuthError = (error: any) => {
    const firebaseError = error as FirebaseError;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    // Handle specific, known authentication errors with user-friendly messages.
    if (firebaseError.code) {
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage =
            'The sign-in pop-up was closed before completing. Please try again.';
          break;
        case 'auth/cancelled-popup-request':
            // This can happen if the user opens multiple popups. We can ignore it or show a gentle message.
            return; // Often best to just ignore this one.
        default:
          errorMessage = `An authentication error occurred. Please try again. (Code: ${firebaseError.code})`;
          break;
      }
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: errorMessage,
    });
  };

  async function onGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await initiateGoogleSignIn(auth);
      // The redirect is handled by the layout components, so we don't need a success toast here.
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-headline">RSU iLEARN</CardTitle>
          <CardDescription>
            Sign in or create your account with Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={onGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
