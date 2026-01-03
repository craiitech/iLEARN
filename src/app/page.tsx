
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images';
import { GraduationCap, ArrowRight, Bot, PenTool, GanttChartSquare, Users, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shrink-0">
        <a className="flex items-center gap-2" href="#">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-semibold text-foreground">
            RSU iLEARN
          </span>
        </a>
        <nav className="ml-auto flex gap-2 sm:gap-4">
          <Button asChild variant="ghost">
            <a href="/login">Login</a>
          </Button>
           <Button asChild>
             <a href="/login">Sign Up <ArrowRight className="ml-2 h-4 w-4"/></a>
           </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {heroImage && (
                <Image
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  data-ai-hint={heroImage.imageHint}
                  height={heroImage.height}
                  src={heroImage.imageUrl}
                  width={heroImage.width}
                />
              )}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Modern LMS for a Connected Campus
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline your teaching workflow, engage students, and foster a collaborative learning environment with RSU iLEARN.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Button asChild size="lg">
                     <a href="/login">Get Started for Free</a>
                   </Button>
                   <Button asChild variant="outline" size="lg">
                     <a href="#features">Learn More</a>
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Everything You Need to Teach and Learn</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From AI-powered quiz creation to a high-density SpeedGrader, RSU iLEARN is packed with features designed for modern education.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <GanttChartSquare className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">Teacher Command Center</h3>
                </div>
                <p className="text-sm text-muted-foreground">Your centralized dashboard for managing courses, assignments, quizzes, and announcements with ease.</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">Automated Quiz Engine</h3>
                </div>
                <p className="text-sm text-muted-foreground">Generate engaging quizzes with our GenAI assistant and enjoy automated grading and score calculation.</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <PenTool className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">SpeedGrader with Split-Pane</h3>
                </div>
                <p className="text-sm text-muted-foreground">A high-density interface to preview submissions, grade with interactive rubrics, and provide rapid feedback.</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">Secure Student Portal</h3>
                </div>
                <p className="text-sm text-muted-foreground">Students can easily view assignments, track their progress, and submit work through a secure portal.</p>
              </div>
              <div className="grid gap-2">
                 <div className="flex items-center gap-3">
                    <PenTool className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">Interactive Rubrics</h3>
                </div>
                <p className="text-sm text-muted-foreground">Build and use interactive rubrics that automatically calculate scores, ensuring consistent and transparent grading.</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary"/>
                    <h3 className="text-lg font-bold font-headline">Role-Based Access</h3>
                </div>
                <p className="text-sm text-muted-foreground">Seamless Google Sign-in with automatic redirection for teachers and students to their respective dashboards.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 RSU iLEARN LMS. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}
