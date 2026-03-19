import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/context/AuthContext';

/**
 * MSCallbackPage — Handles the OAuth2 'code' exchange.
 * Shows a premium loading animation while exchanging code for JWT.
 */
export function MSCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      exchangeCode(code);
    } else {
      const errorDesc = searchParams.get('error_description');
      setError(errorDesc || 'No authorization code found in redirect URL.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exchangeCode = async (code: string) => {
    try {
      // Use the same redirect_uri that was used in the OAuth request
      const redirect_uri = import.meta.env.VITE_AZURE_REDIRECT_URI || 
        (window.location.origin + '/redirect');

      console.log('[SSO] Exchanging code for token...');
      console.log('[SSO] redirect_uri:', redirect_uri);

      const response = await api.post('/auth/redirect', {
        code,
        redirect_uri,
      });

      if (response.data?.access_token) {
        console.log('[SSO] Token exchange successful. Triggering app login...');
        await login(response.data.access_token);
        console.log('[SSO] App login complete. Navigating to dashboard...');
        navigate('/', { replace: true });
      } else {
        throw new Error('Invalid token response: access_token missing.');
      }
    } catch (err: any) {
      console.error('[SSO Callback Error]', err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : (err.message || 'Token exchange failed');
      setError(message);
    }
  };

  /* ─── Keyframe animations ─── */
  const keyframes = `
    @keyframes spin-dot {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(0, -8px); }
    }
  `;

  if (error) {
    return (
      <div style={styles.wrapper}>
        <style>{keyframes}</style>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={styles.errorTitle}>Authentication Failed</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={styles.retryButton}
          >
            ← Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <style>{keyframes}</style>
      <div style={styles.loadingContainer}>
        {/* Animated spinner */}
        <div style={styles.spinnerOuter}>
          <div style={styles.spinnerRing} />
          <div style={styles.spinnerPulse} />
          <div style={styles.spinnerDot} />
        </div>
        <h2 style={styles.loadingTitle}>Authenticating</h2>
        <p style={styles.loadingSubtitle}>Securely verifying your identity with Microsoft…</p>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #020817 0%, #0a1628 40%, #071120 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: 24,
  },

  /* Loading */
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 20,
    animation: 'float 3s ease-in-out infinite',
  },
  spinnerOuter: {
    width: 64,
    height: 64,
    position: 'relative' as const,
    marginBottom: 8,
  },
  spinnerRing: {
    position: 'absolute' as const,
    inset: 0,
    borderRadius: '50%',
    border: '3px solid rgba(20, 184, 166, 0.1)',
    borderTopColor: '#14b8a6',
    animation: 'spin-dot 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
  },
  spinnerPulse: {
    position: 'absolute' as const,
    inset: -8,
    borderRadius: '50%',
    border: '2px solid rgba(20, 184, 166, 0.2)',
    animation: 'pulse-ring 2s ease-in-out infinite',
  },
  spinnerDot: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    marginTop: -4,
    marginLeft: -4,
    borderRadius: '50%',
    background: '#14b8a6',
    boxShadow: '0 0 12px rgba(20, 184, 166, 0.5)',
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  loadingSubtitle: {
    color: 'rgba(148, 163, 184, 0.6)',
    fontSize: 13,
    margin: 0,
    textAlign: 'center' as const,
  },
  progressBar: {
    width: 200,
    height: 3,
    borderRadius: 4,
    background: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
    animation: 'shimmer 1.5s ease-in-out infinite alternate',
  },

  /* Error */
  errorCard: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: 24,
    padding: '48px 40px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 12px',
  },
  errorMessage: {
    color: 'rgba(148, 163, 184, 0.65)',
    fontSize: 13,
    margin: '0 0 28px',
    lineHeight: 1.6,
    maxWidth: 300,
  },
  retryButton: {
    background: 'transparent',
    border: '1px solid rgba(20, 184, 166, 0.2)',
    borderRadius: 12,
    color: '#14b8a6',
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
