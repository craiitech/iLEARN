'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { GraduationCap, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
});

type UserAuthForm = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { auth } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false); // To toggle between Sign In and Sign Up action

  const form = useForm<UserAuthForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: UserAuthForm) {
    setIsLoading(true);

    try {
      if (isSignUp) {
        await initiateEmailSignUp(auth, values.email, values.password);
        toast({
          title: 'Account Created!',
          description: 'You have been successfully registered. Redirecting...',
        });
      } else {
        await initiateEmailSignIn(auth, values.email, values.password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back! Redirecting...',
        });
      }
      // The layout effect will handle redirection on successful login
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use. Please sign in or use a different email.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please use at least 6 characters.';
            break;
          default:
            errorMessage = firebaseError.message;
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          <CardTitle className="text-2xl font-headline">Teacher Portal</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your teacher account to get started.' : 'Sign in to access your dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="teacher@school.edu"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2 pt-2">
                 <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => setIsSignUp(false)}
                 >
                    {isLoading && !isSignUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign in with Email
                </Button>
                <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => setIsSignUp(true)}
                >
                    {isLoading && isSignUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
