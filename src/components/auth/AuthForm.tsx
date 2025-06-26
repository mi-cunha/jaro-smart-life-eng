
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthTabs } from './AuthTabs';
import { SignUpForm } from './SignUpForm';
import { SignInForm } from './SignInForm';

export function AuthForm() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectPath = (subscribed: boolean) => {
    // Clear any old stored plans to start fresh
    localStorage.removeItem('selectedPlan');

    if (subscribed === true) {
      console.log('✅ User is subscribed, redirecting to dashboard');
      return '/dashboard';
    } else {
      console.log('❌ User is not subscribed, redirecting to home for quiz');
      return '/';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('🚀 Starting sign in process for:', formData.email);
    const result = await signIn(formData.email, formData.password);
    if (!result.error) {
      console.log('🎯 Sign in result:', {
        subscribed: result.subscribed
      });
      const redirectPath = getRedirectPath(result.subscribed);
      navigate(redirectPath);
    } else {
      console.error('❌ Sign in failed:', result.error);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting sign up for:', formData.email);
    const { error } = await signUp(formData.email, formData.password, formData.name);
    if (!error) {
      console.log('Sign up successful, redirecting to home for quiz');
      navigate('/');
      setFormData({
        email: '',
        password: '',
        name: ''
      });
    } else {
      console.error('Sign up error:', error);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    await resetPassword(email);
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const signUpForm = (
    <SignUpForm
      formData={formData}
      isLoading={isLoading}
      onSubmit={handleSignUp}
      onInputChange={handleInputChange}
    />
  );

  const signInForm = (
    <SignInForm
      formData={formData}
      isLoading={isLoading}
      onSubmit={handleSignIn}
      onInputChange={handleInputChange}
      onForgotPassword={handleForgotPassword}
    />
  );

  return <AuthTabs signUpForm={signUpForm} signInForm={signInForm} />;
}
