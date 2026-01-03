"use client";

import {
  Book,
  FileCheck,
  GraduationCap,
  Home,
  MessageSquare,
  Settings,
  Library,
  Loader2,
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
import { usePathname, useRouter } from "next/navigation";
import { doc } from "firebase/firestore";


export default function TeacherLayout({
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
    // Wait until loading is complete before doing anything.
    if (isLoading) {
      return;
    }

    // If there's no user, redirect to login from any teacher page.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If user data is loaded and the role is not 'teacher', redirect them.
    if (userData && userData.role !== 'teacher') {
       // Redirect to the correct dashboard based on their actual role.
      router.replace(userData.role === 'student' ? '/student/dashboard' : '/login');
      return;
    }
    
  }, [user, userData, isLoading, router]);

  // While loading authentication state or user role, show a full-page loader.
  // This is the gatekeeper for the entire teacher section.
  if (isLoading || !userData) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }
  
  // If the user is authorized, render the layout
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
                href="/teacher/dashboard"
                asChild
                tooltip="Home"
              >
                <Link href="/teacher/dashboard">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="/teacher/courses" asChild tooltip="Courses" isActive>
                <Link href="/teacher/courses">
                  <Library />
                  <span>Courses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/teacher/quizzes" asChild tooltip="Quizzes">
                <Link href="/teacher/quizzes">
                  <FileCheck />
                  <span>Quizzes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/teacher/grading" asChild tooltip="Grading">
                <Link href="/teacher/grading">
                  <GraduationCap />
                  <span>Grading</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" asChild tooltip="Announcements">
                <Link href="#">
                  <MessageSquare />
                  <span>Announcements</span>
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
            {isUserLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserNav />}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
