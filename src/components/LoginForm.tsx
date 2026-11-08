import { FormEvent, useState } from 'react';

interface LoginFormProps {
  /** Should handle its own errors and report them through `error`. */
  onSubmit: (username: string, password: string) => Promise<void> | void;
  error?: string | null;
}

/** Credentials form for POST /auth. */
export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = username.trim() !== '' && password !== '' && !submitting;

  return (
    <form className="login-form" onSubmit={handleSubmit} aria-label="Log in">
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <button type="submit" disabled={!canSubmit}>
        {submitting ? 'Logging in…' : 'Log in'}
      </button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
