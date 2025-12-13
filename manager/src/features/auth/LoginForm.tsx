'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import styles from './auth.module.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface LoginFormProps {
  isSignUp?: boolean;
}

export function LoginForm({ isSignUp = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form data
      const formData = loginSchema.parse({ email, password });

      if (isSignUp) {
        // Sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setError(null);
        // Redirect to login page after successful signup
        router.push('/login?message=Check your email to confirm your account');
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.issues[0];
        setError(firstError?.message || 'Validation error');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={styles.input}
          disabled={loading}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.togglePassword}
            disabled={loading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="submit"
        className={styles.button}
        disabled={loading}
      >
        {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
      </button>

      <div className={styles.footer}>
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <a href="/login" className={styles.link}>
              Sign In
            </a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <a href="/signup" className={styles.link}>
              Sign Up
            </a>
          </>
        )}
      </div>
    </form>
  );
}
