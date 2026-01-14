import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic-less, just redirect to dashboard
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Start Your Journey</h2>
          <p className="mt-2 text-slate-600">Join 5,000+ agents using InsureFlow</p>
        </div>

        <Card className="shadow-xl border-border/40">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Smith" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="agent@agency.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full h-11">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
