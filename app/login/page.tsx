import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[70vw] h-[70vw] bg-primary/15 rounded-full blur-[160px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-primary/8 rounded-full blur-[120px]" />
      </div>
      
      <Card className="w-full max-w-[420px] glass border-border/30 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10">
        <CardHeader className="space-y-4 text-center pb-2 pt-8">
          <Logo hotelName="Hargeisa Grand Hotel" iconSize="lg" showText={false} className="mx-auto mb-1" />
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-primary/70">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in to the Hotel Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {searchParams?.message && (
            <div className="bg-destructive/10 text-destructive text-sm p-3.5 rounded-xl mb-5 flex items-center justify-center border border-destructive/20">
              {searchParams.message}
            </div>
          )}
          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80 leading-none">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80 leading-none">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-muted/30 border-border/50"
              />
            </div>
            <Button type="submit" size="lg" className="w-full mt-1 font-semibold text-base">
              Sign In
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
            Hargeisa Grand Hotel · Management System v2.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
