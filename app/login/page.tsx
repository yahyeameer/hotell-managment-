import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <Card className="w-full max-w-md glass border-border shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <Logo hotelName="Hargeisa Grand Hotel" iconSize="lg" showText={false} className="mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to the Hotel Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.message && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 flex items-center justify-center">
              {searchParams.message}
            </div>
          )}
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-muted/40 border-border focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-muted/40 border-border focus-visible:ring-primary/50"
              />
            </div>
            <Button type="submit" className="w-full mt-2 font-semibold">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
