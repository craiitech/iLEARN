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
import { useRouter } from "next/navigation";
import { doc } from "firebase/firestore";


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const isLoading = isUserLoading || isUserDocLoading;

  useEffect(() => {
    // Wait until all loading is finished.
    if (isLoading) {
      return;
    }

    // If there's no user object, they are not logged in.
    // Redirect to the login page.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If there is a user, but we have their role data, and it's NOT student,
    // redirect them to their correct dashboard.
    if (userData && userData.role !== 'student') {
      router.replace(userData.role === 'teacher' ? '/teacher/dashboard' : '/login');
      return;
    }

  }, [user, userData, isLoading, router]);

  // While loading authentication state or user role, show a full-page loader.
  // This is the gatekeeper for the entire student section.
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }
  
  // Only render the layout if the user is a student.
  // This prevents flashing the layout for users who will be redirected.
  if (userData?.role === 'student') {
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

  // If the logic somehow falls through (e.g., user exists but role is missing),
  // show a loader while the redirect is in progress.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}