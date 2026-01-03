
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { GraduationCap, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
  role: z.enum(['teacher', 'student'], { required_error: 'You must select a role.'}),
});

type UserAuthForm = z.infer<typeof formSchema>;

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.88 1.62-4.59 0-8.32-3.57-8.32-7.92s3.73-7.92 8.32-7.92c2.21 0 4.09.81 5.61 2.29l2.2-2.2C18.02 3.24 15.48 2 12.48 2 7.03 2 3 6.03 3 11s4.03 9 9.48 9c2.82 0 5.17-1 7.09-2.92 2.02-2.02 2.64-5.02 2.64-7.92v-3.28h-9.72z" fill="currentColor"/>
    </svg>
);


export default function UnifiedLoginPage() {
  const { toast } = useToast();
  const { auth } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const form = useForm<UserAuthForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  const handleAuthError = (error: any) => {
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
          case 'auth/popup-closed-by-user':
             errorMessage = 'The sign-in pop-up was closed before completing. Please try again.';
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
  }

  async function onSubmit(values: UserAuthForm) {
    setIsLoading(true);

    try {
      if (isSigningUp) {
        await initiateEmailSignUp(auth, values.email, values.password, values.role);
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
    } catch (error) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
        await initiateGoogleSignIn(auth);
        toast({
            title: 'Google Sign-In Successful',
            description: 'Welcome! Redirecting...',
        });
    } catch(error) {
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
            {isSigningUp ? 'Create your account to get started.' : 'Sign in to your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
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
                              placeholder="name@school.edu"
                              {...field}
                              disabled={isLoading || isGoogleLoading}
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
                              disabled={isLoading || isGoogleLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />

                  {isSigningUp && (
                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>I am a...</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="teacher" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Teacher
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="student" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Student
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}

                  <div className="space-y-2 pt-2">
                      <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading || isGoogleLoading}
                          onClick={() => form.trigger(['email', 'password'])}
                      >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isSigningUp ? 'Create Account' : 'Sign In'}
                      </Button>
                      <Button
                          type="button"
                          variant="link"
                          className="w-full"
                          onClick={() => setIsSigningUp(!isSigningUp)}
                      >
                          {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                      </Button>
                  </div>
                </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
