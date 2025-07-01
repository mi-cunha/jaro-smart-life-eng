import { Card, CardContent } from '@/components/ui/card';
import { JaroSmartLogo } from '@/components/JaroSmartLogo';
interface AuthCardProps {
  children: React.ReactNode;
}
export function AuthCard({
  children
}: AuthCardProps) {
  return <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-6">
        <div className="text-center">
          <JaroSmartLogo size="lg" className="mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/60 text-sm sm:text-base">Sign in to your account or create a new one</p>
        </div>
        
        <Card className="bg-dark-bg/90 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>;
}