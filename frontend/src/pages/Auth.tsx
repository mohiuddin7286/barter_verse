import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const signupForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message.includes('Invalid login') ? 'Invalid credentials.' : error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Success', description: 'Welcome back, trader!' });
        navigate('/');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Account Created', description: 'Please check your email to verify.' });
        signupForm.reset();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* Left Side: Form Area */}
      <div className="flex items-center justify-center p-8 bg-[#020617] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center space-y-2">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 mb-4">
                <span className="text-white font-bold text-2xl">B</span>
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to BarterVerse</h1>
             <p className="text-slate-400">Your gateway to decentralized trading.</p>
          </div>

          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 p-1 rounded-xl border border-white/5 mb-6">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          {...loginForm.register('email')}
                          className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:ring-emerald-500/50 rounded-xl h-11"
                          placeholder="name@example.com"
                        />
                      </div>
                      {loginForm.formState.errors.email && <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="password"
                          {...loginForm.register('password')}
                          className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:ring-emerald-500/50 rounded-xl h-11"
                          placeholder="••••••••"
                        />
                      </div>
                      {loginForm.formState.errors.password && <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full btn-primary h-11 text-base shadow-lg shadow-emerald-500/20" disabled={isLoading}>
                      {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          {...signupForm.register('email')}
                          className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:ring-emerald-500/50 rounded-xl h-11"
                          placeholder="name@example.com"
                        />
                      </div>
                      {signupForm.formState.errors.email && <p className="text-xs text-red-400">{signupForm.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="password"
                          {...signupForm.register('password')}
                          className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:ring-emerald-500/50 rounded-xl h-11"
                          placeholder="••••••••"
                        />
                      </div>
                      {signupForm.formState.errors.password && <p className="text-xs text-red-400">{signupForm.formState.errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full btn-primary h-11 text-base shadow-lg shadow-emerald-500/20" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'} <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-slate-500">
             Protected by enterprise-grade encryption.
          </div>
        </div>
      </div>

      {/* Right Side: Visual Showcase */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-900 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
          
          <div className="relative z-10 max-w-lg text-center space-y-6">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-300 mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified & Secure Platform</span>
             </div>
             <h2 className="text-5xl font-extrabold text-white leading-tight">
                Trade Smarter,<br />Not Harder.
             </h2>
             <p className="text-lg text-slate-300 leading-relaxed">
                Join thousands of users exchanging value without spending fiat currency. 
                Experience the freedom of a true barter economy powered by smart matching.
             </p>
          </div>
      </div>
    </div>
  );
}