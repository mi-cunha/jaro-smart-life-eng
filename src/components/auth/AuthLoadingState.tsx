
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AuthLoadingStateProps {
  type: 'loading' | 'redirecting';
}

export function AuthLoadingState({ type }: AuthLoadingStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <span className="text-white">
            {type === 'loading' ? 'Loading...' : 'Redirecting...'}
          </span>
        </div>
        
        {type === 'redirecting' && (
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Back to Login
          </Button>
        )}
      </div>
    </div>
  );
}
