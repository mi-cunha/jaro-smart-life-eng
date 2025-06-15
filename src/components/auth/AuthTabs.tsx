
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthTabsProps {
  signUpForm: React.ReactNode;
  signInForm: React.ReactNode;
}

export function AuthTabs({ signUpForm, signInForm }: AuthTabsProps) {
  return (
    <Tabs defaultValue="signup" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-white/10 h-11">
        <TabsTrigger 
          value="login" 
          className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="signup" 
          className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>

      <TabsContent value="signup" className="space-y-4 mt-6">
        {signUpForm}
      </TabsContent>

      <TabsContent value="login" className="space-y-4 mt-6">
        {signInForm}
      </TabsContent>
    </Tabs>
  );
}
