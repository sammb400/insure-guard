import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ShieldCheck, LogIn } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic-less, just redirect to dashboard
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-foreground">Welcome Back</h2>
          <p className="mt-2 text-slate-600 dark:text-muted-foreground">Enter your credentials to access your portal</p>
        </div>

        <Card className="shadow-xl border-border/40">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>Use your agency email to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="agent@agency.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="ghost" className="p-0 h-auto text-xs" type="button">Forgot password?</Button>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full h-11">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
