
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  formData: {
    email: string;
    password: string;
    name: string;
  };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string) => void;
  onForgotPassword: (email: string) => void;
}

export function SignInForm({ formData, isLoading, onSubmit, onInputChange, onForgotPassword }: SignInFormProps) {
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Please enter your email address first');
      return;
    }
    onForgotPassword(formData.email);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-sm">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="bg-dark-bg border-white/20 text-white h-10 text-base focus:border-neon-green"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white text-sm">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className="bg-dark-bg border-white/20 text-white h-10 text-base focus:border-neon-green"
          placeholder="Enter your password"
          required
        />
      </div>
      
      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-neon-green hover:text-neon-green/80 underline"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-neon-green text-black hover:bg-neon-green/90 h-10 text-base font-medium mt-4"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sign In
      </Button>
    </form>
  );
}
