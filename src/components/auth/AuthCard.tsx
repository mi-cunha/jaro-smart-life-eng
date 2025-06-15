
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan');

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-dark-bg border-white/10 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/03a9ce16-4e5b-468b-9a10-7d8b302f54f5.png" 
                alt="JaroSmart Logo" 
                className="h-16 w-auto object-contain" 
              />
            </div>
            <CardTitle className="text-white text-xl sm:text-2xl">
              Welcome to JaroSmart
            </CardTitle>
            <p className="text-white/60 text-sm sm:text-base">
              Your intelligent nutrition and wellness platform
            </p>
            {planFromUrl && (
              <div className="bg-neon-green/20 text-neon-green px-3 py-2 rounded-lg text-sm">
                Selected Plan: <strong>{planFromUrl}</strong>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="text-white/60 hover:text-white text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
