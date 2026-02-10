import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

type LocationState = {
  from?: {
    pathname: string;
  };
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await apiClient.login(email, password, fullName);

      toast({
        title: data.message.includes('created') ? 'Account Created!' : 'Welcome back!',
        description: data.message
      });

      // Reload to refresh auth context
      window.location.href = redirectTo;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in or create an account automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (Optional for Login)</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
                <p className="text-xs text-muted-foreground">Required if creating a new account</p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
