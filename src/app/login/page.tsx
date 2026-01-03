
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function AuthForm({ role }: { role: 'student' | 'teacher' }) {
    const { toast } = useToast();
    const { auth } = useFirebase();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleAuthError = (error: any) => {
        const firebaseError = error as FirebaseError;
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (firebaseError.code) {
        switch (firebaseError.code) {
            case 'auth/popup-closed-by-user':
            errorMessage =
                'The sign-in pop-up was closed before completing. Please try again.';
            break;
            case 'auth/cancelled-popup-request':
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
        setIsLoading(true);
        try {
            await initiateGoogleSignIn(auth, role);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={isLoading}
            >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <GoogleIcon />
            )}
            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
        </Button>
    )
}

export default function UnifiedLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-headline">RSU iLEARN</CardTitle>
          <CardDescription>
            Sign in to your Student or Teacher account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                </TabsList>
                <TabsContent value="student" className="pt-4">
                    <p className="text-center text-sm text-muted-foreground mb-4">
                        Sign in with your university-provided Google account.
                    </p>
                    <AuthForm role="student" />
                </TabsContent>
                <TabsContent value="teacher" className="pt-4">
                     <p className="text-center text-sm text-muted-foreground mb-4">
                        Faculty members sign in here.
                    </p>
                    <AuthForm role="teacher" />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
