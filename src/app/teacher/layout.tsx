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
import { useFirebase } from "@/firebase";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";


export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login.
    // We also make sure we are not already on the login page to avoid a redirect loop.
    if (!isUserLoading && !user && pathname !== '/teacher/login') {
      router.push('/teacher/login');
    }
    // If the user is logged in and tries to go to the login page, redirect to dashboard.
    if (!isUserLoading && user && pathname === '/teacher/login') {
      router.push('/teacher/dashboard');
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading authentication state, show a loader.
  // If there's no user and we are not on the login page, also show a loader
  // to prevent a flash of the old page content before redirection.
  if (isUserLoading || (!user && pathname !== '/teacher/login')) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  // If we are on the login page, render the children directly without the sidebar layout.
  if (pathname === '/teacher/login') {
    return <>{children}</>;
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
              <SidebarMenuButton href="/teacher/courses" asChild tooltip="Courses" >
                <Link href="/teacher/courses">
                  <Library />
                  <span>Courses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/teacher/blocks" asChild tooltip="Blocks" isActive>
                <Link href="/teacher/blocks">
                  <Book />
                  <span>Blocks</span>
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
