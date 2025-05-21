
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-9xl font-bold text-lingo-red">404</h1>
      <div className="text-6xl font-bold mb-4">Oops!</div>
      <p className="text-xl text-muted-foreground mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => navigate("/")}
          className="bg-lingo-red hover:bg-lingo-red/90"
        >
          Go Home
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
