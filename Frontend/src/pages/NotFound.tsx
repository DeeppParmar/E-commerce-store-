import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Large 404 */}
        <h1 className="text-8xl md:text-9xl font-bold text-primary/20 mb-4 tabular-nums select-none">404</h1>

        <h2 className="text-2xl md:text-3xl font-bold mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild size="lg">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
