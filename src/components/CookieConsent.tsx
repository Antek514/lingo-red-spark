import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = Cookies.get('cookie-consent');
    
    // Show the consent dialog if they haven't consented yet
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);
  
  const handleAccept = () => {
    // Set cookie consent for 1 year
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    setShowConsent(false);
  };
  
  const handleLearnMore = () => {
    // Keep the cookie dialog open but open the learn more page
    window.open('/privacy-policy', '_blank');
  };
  
  if (!showConsent) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <Card className="mx-auto max-w-3xl shadow-lg">
        <CardContent className="pt-6">
          <h4 className="text-lg font-semibold mb-2">We use cookies</h4>
          <p className="text-sm text-muted-foreground">
            We use cookies to improve your experience on SnapGo, provide key site features, 
            and track your progress in lessons. By continuing to use our website, 
            you agree to our use of cookies.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handleLearnMore}
          >
            Learn more
          </Button>
          <Button onClick={handleAccept}>
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
