import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: 'Error',
          description: 'No reset token found',
          variant: 'destructive',
        });
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${token}`);
        const result = await response.json();

        if (result.valid) {
          setTokenValid(true);
        } else {
          toast({
            title: 'Invalid Token',
            description: result.message || 'Reset token is invalid or has expired',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to verify token',
          variant: 'destructive',
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, toast]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      setSubmitted(true);
      toast({
        title: 'Success',
        description: 'Your password has been reset. You can now log in with your new password.',
      });

      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Lock className="w-6 h-6 text-slate-900 dark:text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Create New Password</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verifying ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Verifying reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                This password reset link is invalid or has expired.
              </p>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-slate-900 dark:text-white"
              >
                Request New Link
              </Button>
            </div>
          ) : submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 dark:text-slate-200">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  className="bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-900 dark:text-slate-200">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  className="bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-slate-900 dark:text-white"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

