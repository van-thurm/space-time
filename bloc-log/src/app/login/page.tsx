'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserProgramCount } from '@/lib/supabase/db';
import { BlockLogWordmark } from '@/components/ui/DieterIcons';

type LoginStep = 'email' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'email') emailInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step === 'code') codeInputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('enter a valid email');
      return;
    }
    setEmailError('');
    setError('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email });
      if (otpError) {
        if (otpError.message?.toLowerCase().includes('rate')) {
          setError('too many attempts — try again in a few minutes');
        } else {
          setError(otpError.message || "couldn't send code — try again");
        }
        setLoading(false);
        return;
      }
      setStep('code');
      setResendCooldown(60);
    } catch {
      setError("couldn't connect — check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(
    async (digits: string[]) => {
      const token = digits.join('');
      if (token.length !== 6) return;

      setError('');
      setLoading(true);

      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (verifyError) {
          if (verifyError.message?.toLowerCase().includes('expired')) {
            setError('code expired');
            await supabase.auth.signInWithOtp({ email });
            setResendCooldown(60);
          } else if (verifyError.message?.toLowerCase().includes('rate')) {
            setError('too many attempts — try again in a few minutes');
          } else {
            setError('incorrect code');
          }
          setCode(Array(6).fill(''));
          setTimeout(() => codeInputRefs.current[0]?.focus(), 50);
          setLoading(false);
          return;
        }

        setSuccess(true);
        const userId = data.user?.id;
        if (!userId) {
          router.push('/');
          return;
        }

        await new Promise((r) => setTimeout(r, 200));

        try {
          const count = await getUserProgramCount(supabase, userId);
          router.push(count > 0 ? '/' : '/programs');
        } catch {
          router.push('/');
        }
      } catch {
        setError("couldn't connect — check your connection and try again");
        setLoading(false);
      }
    },
    [email, supabase, router]
  );

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '')) {
      handleVerify(next);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    if (pasted.length === 6) {
      handleVerify(next);
    } else {
      codeInputRefs.current[pasted.length]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await supabase.auth.signInWithOtp({ email });
      setResendCooldown(60);
    } catch {
      setError("couldn't resend — try again");
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto text-success"
          >
            <path
              d="M12 24L20 32L36 16"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="flex justify-center">
          <BlockLogWordmark height={22} className="text-foreground" />
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <input
                ref={emailInputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onBlur={() => {
                  if (email && !isValidEmail(email)) setEmailError('enter a valid email');
                }}
                placeholder="email"
                className="w-full h-12 px-3 border border-border bg-background font-sans text-sm
                  placeholder:text-muted focus:border-foreground focus:outline-none"
              />
              {emailError && (
                <p className="font-sans text-xs text-danger">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 bg-foreground text-background font-sans text-sm font-medium
                hover:bg-foreground/90 transition-colors touch-manipulation
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'sending...' : 'continue'}
            </button>

            {error && (
              <p className="font-sans text-xs text-danger text-center">{error}</p>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-sans text-sm">check your email</h2>
              <p className="font-sans text-xs text-muted">{email}</p>
            </div>

            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeInputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="w-11 h-14 text-center border border-border bg-background font-sans text-lg
                    focus:border-foreground focus:outline-none"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <p className="font-sans text-xs text-danger text-center">{error}</p>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setStep('email');
                  setCode(Array(6).fill(''));
                  setError('');
                }}
                className="font-sans text-xs text-muted hover:text-foreground transition-colors touch-manipulation"
              >
                use a different email
              </button>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-sans text-xs text-muted hover:text-foreground transition-colors touch-manipulation
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `resend (${resendCooldown}s)` : 'resend code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
