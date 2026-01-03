
"use client";

import {
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  Loader2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { useFirebase, useDoc } from "@/firebase";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { doc } from "firebase/firestore";


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    // After user object is loaded, check their role from the user document
    if (user && !isUserDocLoading && userData) {
      if (userData.role !== 'student') {
        // If not a student, redirect to the appropriate dashboard
        router.push(`/${userData.role}/dashboard`);
      }
    }
  }, [user, isUserLoading, userData, isUserDocLoading, router]);

  // While loading authentication state or user role, show a loader.
  if (isUserLoading || isUserDocLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }
  
  // If we are on a path that is not for students, show a loader until redirection is complete.
  if(userData && userData.role !== 'student') {
     return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarRail />
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold font-headline tracking-tighter text-primary">
              RSU iLEARN
            </h2>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/student/dashboard"
                asChild
                isActive
                tooltip="Home"
              >
                <Link href="/student/dashboard">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" asChild tooltip="My Courses">
                <Link href="#">
                  <BookOpen />
                  <span>My Courses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" asChild tooltip="Calendar">
                <Link href="#">
                  <Calendar />
                  <span>Calendar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" asChild tooltip="Grades">
                <Link href="#">
                  <GraduationCap />
                  <span>Grades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
            </div>
            <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
