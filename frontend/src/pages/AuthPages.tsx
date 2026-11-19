import React, { useId, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(320px,42%)_1fr]">
    <aside className="hidden min-h-screen flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
      <Link to="/login" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-brand-600"><Sparkles size={19} /></span><span><b className="block text-sm">Agentic Sales</b><small className="text-xs text-slate-400">Revenue workspace</small></span></Link>
      <div className="max-w-md"><p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-300">One workspace. Clear ownership.</p><h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">A calmer way to move customer work forward.</h1><p className="mt-5 text-sm leading-6 text-slate-400">Sign in to access the records and tools assigned to your workspace role.</p></div>
      <p className="text-xs text-slate-500">Secure workspace access</p>
    </aside>
    <section className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]"><Link to="/login" className="mb-10 flex items-center gap-2 text-sm font-semibold text-slate-900 lg:hidden"><Sparkles size={18} className="text-brand-700" /> Agentic Sales</Link>
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-brand-700">Workspace access</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  </main>;
}

function AuthMessage({ error, success }: { error: string; success: string }) {
  return <>{error && <p role="alert" className="mb-4 border-l-2 border-rose-600 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}{success && <p role="status" className="mb-4 border-l-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>}</>;
}

function Field({ label, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: typeof Mail }) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  return <div className="mb-4"><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label><span className="relative block"><Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input {...props} id={id} type={isPassword && showPassword ? 'text' : props.type} className={`input pl-10 ${isPassword ? 'pr-11' : ''}`} /><span className="absolute right-1 top-1/2 -translate-y-1/2">{isPassword && <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="rounded p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}</span></span></div>;
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return <button disabled={busy} className="btn-primary mt-2 w-full justify-center">{busy ? <LoaderCircle size={16} className="animate-spin"/> : children}</button>;
}

export function LoginPage() {
  const { user, loading } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (!loading && user) return <Navigate to="/dashboard" replace/>;
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError('');
    if (!supabase) { setError('Authentication is not configured for this workspace.'); setBusy(false); return; }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message); else navigate('/dashboard'); setBusy(false);
  };
  return <AuthShell title="Welcome back" subtitle="Sign in using your workspace account."><AuthMessage error={error} success=""/><form onSubmit={submit}>
    <Field label="Work email" icon={Mail} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
    <Field label="Password" icon={LockKeyhole} type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>
    <div className="mb-4 flex justify-end"><Link className="text-xs font-semibold text-brand-700 hover:text-brand-900" to="/forgot-password">Forgot password?</Link></div>
    <Submit busy={busy}>Sign in <ArrowRight size={16}/></Submit>
  </form><p className="mt-7 text-center text-sm text-slate-600">New to this workspace? <Link to="/signup" className="font-semibold text-brand-700">Create account</Link></p>
  </AuthShell>;
}

export function SignupPage() {
  const { user, loading } = useAuth(); const navigate=useNavigate();
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
  if (!loading && user) return <Navigate to="/dashboard" replace/>;
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');setSuccess('');
    if(!supabase){setError('Authentication is not configured for this workspace.');setBusy(false);return;}
    const {data,error:authError}=await supabase.auth.signUp({email,password,options:{data:{display_name:name}}});
    if(authError)setError(authError.message);else if(data.session)navigate('/dashboard');else setSuccess('Check your email to confirm your account, then sign in.');setBusy(false);
  };
  return <AuthShell title="Create your account" subtitle="Create a workspace account. Your access starts with the least-privileged role; an administrator can update it."><AuthMessage error={error} success={success}/><form onSubmit={submit}>
    <Field label="Full name" icon={UserRound} autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
    <Field label="Work email" icon={Mail} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
    <Field label="Password" icon={LockKeyhole} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/>
    <Submit busy={busy}>Create account <ArrowRight size={16}/></Submit>
  </form><p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-brand-700">Sign in</Link></p></AuthShell>;
}

export function ForgotPasswordPage() {
  const [email,setEmail]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');setSuccess('');
    if(!supabase){setError('Authentication is not configured for this workspace.');setBusy(false);return;}
    const {error:authError}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});
    if(authError)setError(authError.message);else setSuccess('If an account exists for that address, password reset instructions have been sent.');setBusy(false);
  };
  return <AuthShell title="Reset your password" subtitle="Enter your work email and we’ll send password reset instructions."><AuthMessage error={error} success={success}/><form onSubmit={submit}>
    <Field label="Work email" icon={Mail} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
    <Submit busy={busy}><KeyRound size={16}/> Send reset link</Submit>
  </form><p className="mt-7 text-center text-sm"><Link to="/login" className="font-semibold text-brand-700">Back to sign in</Link></p></AuthShell>;
}

export function ResetPasswordPage() {
  const navigate=useNavigate();const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');setSuccess('');
    if(!supabase){setError('Authentication is not configured for this workspace.');setBusy(false);return;}
    const {error:authError}=await supabase.auth.updateUser({password});
    if(authError)setError(authError.message);else{setSuccess('Password updated. You can now sign in.');await supabase.auth.signOut();window.setTimeout(()=>navigate('/login'),900);}setBusy(false);
  };
  return <AuthShell title="Choose a new password" subtitle="Use a password of at least eight characters."><AuthMessage error={error} success={success}/><form onSubmit={submit}>
    <Field label="New password" icon={LockKeyhole} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/>
    <Submit busy={busy}>Update password <ArrowRight size={16}/></Submit>
  </form></AuthShell>;
}
