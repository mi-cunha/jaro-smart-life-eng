
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthTabsProps {
  signUpForm: React.ReactNode;
  signInForm: React.ReactNode;
}

export function AuthTabs({ signUpForm, signInForm }: AuthTabsProps) {
  return (
    <Tabs defaultValue="signup" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-white/10 h-12 p-1">
        <TabsTrigger 
          value="login" 
          className="h-9 flex items-center justify-center data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base px-4 py-1 transition-all duration-200 rounded-md border-0 mx-0.5"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="signup" 
          className="h-9 flex items-center justify-center data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base px-4 py-1 transition-all duration-200 rounded-md border-0 mx-0.5"
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
