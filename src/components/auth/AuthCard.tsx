import { Card, CardContent } from '@/components/ui/card';
import { JaroSmartLogo } from '@/components/JaroSmartLogo';
interface AuthCardProps {
  children: React.ReactNode;
}
export function AuthCard({
  children
}: AuthCardProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-sm space-y-4 mx-auto">
        <div className="text-center">
          <JaroSmartLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/60 text-sm">Sign in to your account or create a new one</p>
        </div>
        
        <Card className="bg-dark-bg/90 border-white/10 backdrop-blur-sm w-full">
          <CardContent className="p-4 sm:p-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}