
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  formData: {
    email: string;
    password: string;
    name: string;
  };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string) => void;
}

export function SignUpForm({ formData, isLoading, onSubmit, onInputChange }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white text-sm">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
          placeholder="Enter your full name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-white text-sm">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-white text-sm">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
          placeholder="Create a password (min. 6 characters)"
          required
          minLength={6}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-neon-green text-black hover:bg-neon-green/90 h-11 text-base font-medium"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create Account
      </Button>
    </form>
  );
}
