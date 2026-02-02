import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract oobCode from URL query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const oobCode = queryParams.get("oobCode");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: "Email Sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      toast({
        title: "Invalid Link",
        description: "The password reset link is invalid or missing the code.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password.",
      });
      setLocation("/login");
    } catch (error) {
      console.error(error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. The link may have expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-foreground">Reset Password</h2>
            <p className="mt-2 text-slate-600 dark:text-muted-foreground">
              {isSubmitted ? "Check your inbox" : "Enter your email to receive reset instructions"}
            </p>
          </div>

          <Card className="shadow-xl border-border/40">
            {isSubmitted ? (
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/login")}>
                  Return to Login
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
                  Try another email
                </Button>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>Forgot Password</CardTitle>
                  <CardDescription>We'll send you a link to reset your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="agent@agency.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-foreground">Reset Password</h2>
          <p className="mt-2 text-slate-600 dark:text-muted-foreground">Enter your new password below</p>
        </div>

        <Card className="shadow-xl border-border/40">
          <CardHeader>
            <CardTitle>New Password</CardTitle>
            <CardDescription>Please choose a strong password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}