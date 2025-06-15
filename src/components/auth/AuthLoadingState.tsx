
import { Loader2 } from 'lucide-react';

interface AuthLoadingStateProps {
  type: 'loading' | 'redirecting';
}

export function AuthLoadingState({ type }: AuthLoadingStateProps) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
        <span className="text-white">
          {type === 'loading' ? 'Loading...' : 'Redirecting...'}
        </span>
      </div>
    </div>
  );
}
