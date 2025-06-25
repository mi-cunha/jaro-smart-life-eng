
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedLogo } from "@/components/EnhancedLogo";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full space-y-6">
      {/* Logo Section */}
      <div className="text-center">
        <EnhancedLogo className="mx-auto mb-4" />
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Bem-vindo ao Jaro Smart
        </h1>
        <p className="text-white/70 text-sm lg:text-base">
          Sua jornada de bem-estar começa aqui
        </p>
      </div>

      {/* Auth Form Card */}
      <Card className="bg-dark-bg border-white/10 shadow-2xl">
        <CardContent className="p-6 lg:p-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
