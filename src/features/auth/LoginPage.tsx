import React, { useState } from 'react';
import { Logo } from '@/shared/components/ui/Logo';

/**
 * LoginPage — Premium enterprise SSO login with logo-derived gradient design.
 * Brand colors: #0CD1C3 (teal) ↔ #B3F57B (lime-green) from TechnoRUCS logo.
 */
export function LoginPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleMSLogin = () => {
    setIsClicked(true);
    const tenant = import.meta.env.VITE_AZURE_TENANT_ID;
    const client = import.meta.env.VITE_AZURE_CLIENT_ID;
    const redirect = import.meta.env.VITE_AZURE_REDIRECT_URI || 'http://localhost:5173/redirect';

    const scope = 'openid profile email User.Read';
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${client}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&response_mode=query&scope=${encodeURIComponent(scope)}`;

    setTimeout(() => {
      window.location.href = authUrl;
    }, 300);
  };

  return (
    <div style={styles.wrapper}>
      <style>{keyframes}</style>

      {/* Animated Background Orbs — logo-derived hues */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* Animated grid pattern */}
      <div style={styles.gridPattern} />

      {/* Main Card */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          {/* Top glow line — teal → lime */}
          <div style={styles.glowLine} />

          {/* Logo — real TechnoRUCS logo */}
          <div style={styles.logoContainer}>
            <div style={styles.logoInner}>
              <div style={{ filter: 'drop-shadow(0 0 8px rgba(12, 209, 195, 0.3))' }}>
                <Logo className="h-[28px]" showText={false} />
              </div>
            </div>
            <div style={styles.logoRing} />
          </div>

          {/* Title */}
          <h1 style={styles.title}>PMS Portal</h1>
          <p style={styles.subtitle}>TechnoRUCS Enterprise Management</p>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>ENTERPRISE SSO</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Microsoft Sign-in Button */}
          <button
            onClick={handleMSLogin}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isClicked}
            style={{
              ...styles.button,
              ...(isHovered && !isClicked ? styles.buttonHover : {}),
              ...(isClicked ? styles.buttonClicked : {}),
            }}
          >
            {isClicked ? (
              <div style={styles.buttonSpinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
            )}
            <span style={styles.buttonText}>
              {isClicked ? 'Redirecting to Microsoft…' : 'Sign in with Microsoft'}
            </span>
          </button>

          {/* Security Badge */}
          <div style={styles.securityBadge}>
            <div style={styles.securityDot} />
            <span>256-bit encrypted · Enterprise SSO</span>
          </div>

          {/* Feature Pills */}
          <div style={styles.featurePills}>
            {['Project Tracking', 'Time Management', 'Team Reports'].map((label) => (
              <div key={label} style={styles.pill}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M8 1L10 5.5L15 6.2L11.5 9.5L12.4 14.5L8 12.2L3.6 14.5L4.5 9.5L1 6.2L6 5.5L8 1Z"
                    fill="url(#starGrad)"
                  />
                  <defs>
                    <linearGradient id="starGrad" x1="1" y1="8" x2="15" y2="8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0CD1C3" />
                      <stop offset="1" stopColor="#B3F57B" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          TechnoRUCS © 2026 · All Rights Reserved
        </p>
      </div>
    </div>
  );
}

/* ─── Keyframe Animations ─────────────────────── */
const keyframes = `
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -50px) scale(1.1); }
    50% { transform: translate(-20px, -80px) scale(0.95); }
    75% { transform: translate(50px, -30px) scale(1.05); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 30px) scale(1.08); }
    66% { transform: translate(20px, 60px) scale(0.92); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-60px, -40px) scale(1.15); }
  }
  @keyframes spin-slow {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes spin-ring {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/* ─── Brand Colors (from logo SVG) ───────────── */
const TEAL = '#0CD1C3';       // Logo gradient start
const LIME = '#B3F57B';       // Logo gradient end
const TEAL_RGB = '12, 209, 195';
const LIME_RGB = '179, 245, 123';

/* ─── Styles ─────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #020817 0%, #0a1628 40%, #071120 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  /* Animated orbs — teal + lime hues */
  orb1: {
    position: 'absolute',
    top: '10%',
    right: '15%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${TEAL_RGB}, 0.12) 0%, transparent 70%)`,
    filter: 'blur(60px)',
    animation: 'float1 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '5%',
    left: '10%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${LIME_RGB}, 0.10) 0%, transparent 70%)`,
    filter: 'blur(50px)',
    animation: 'float2 15s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${TEAL_RGB}, 0.06) 0%, rgba(${LIME_RGB}, 0.04) 50%, transparent 70%)`,
    filter: 'blur(40px)',
    animation: 'float3 10s ease-in-out infinite',
    pointerEvents: 'none',
  },

  /* Grid pattern overlay */
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },

  /* Card container */
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    padding: '0 24px',
    position: 'relative',
    zIndex: 10,
  },

  card: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: 28,
    padding: '48px 40px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: `
      0 0 0 1px rgba(148, 163, 184, 0.05),
      0 20px 50px rgba(0, 0, 0, 0.4),
      0 0 100px rgba(${TEAL_RGB}, 0.04)
    `,
  },

  /* Top glow line — teal → lime gradient */
  glowLine: {
    position: 'absolute' as const,
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    background: `linear-gradient(90deg, transparent, ${TEAL}, ${LIME}, transparent)`,
  },

  /* Logo */
  logoContainer: {
    width: 80,
    height: 80,
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
    border: `1px solid rgba(${TEAL_RGB}, 0.2)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    zIndex: 2,
    boxShadow: `0 0 30px rgba(${TEAL_RGB}, 0.1), 0 0 60px rgba(${LIME_RGB}, 0.05)`,
  },
  logoRing: {
    position: 'absolute' as const,
    inset: -4,
    borderRadius: 24,
    border: '2px solid transparent',
    borderTopColor: `rgba(${TEAL_RGB}, 0.35)`,
    borderRightColor: `rgba(${LIME_RGB}, 0.2)`,
    animation: 'spin-ring 4s linear infinite',
  },

  /* Typography */
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: 13,
    fontWeight: 500,
    margin: '6px 0 0',
    letterSpacing: '0.02em',
  },

  /* Divider */
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    margin: '32px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.12), transparent)',
  },
  dividerText: {
    color: 'rgba(148, 163, 184, 0.4)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
  },

  /* Button — teal → lime gradient */
  button: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    background: `linear-gradient(135deg, ${TEAL} 0%, #10B9A8 40%, ${LIME} 100%)`,
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: `0 4px 20px rgba(${TEAL_RGB}, 0.25), 0 0 0 1px rgba(${TEAL_RGB}, 0.1)`,
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 30px rgba(${TEAL_RGB}, 0.3), 0 4px 20px rgba(${LIME_RGB}, 0.15), 0 0 0 1px rgba(${TEAL_RGB}, 0.2)`,
  },
  buttonClicked: {
    transform: 'scale(0.98)',
    opacity: 0.9,
    cursor: 'not-allowed',
  },
  buttonText: {
    color: '#0a1628',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  buttonSpinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(10, 22, 40, 0.3)',
    borderTopColor: '#0a1628',
    borderRadius: '50%',
    animation: 'spin-ring 0.7s linear infinite',
  },

  /* Security badge */
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    color: 'rgba(148, 163, 184, 0.45)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: TEAL,
    animation: 'pulse-glow 2.5s ease-in-out infinite',
    boxShadow: `0 0 8px rgba(${TEAL_RGB}, 0.4)`,
  },

  /* Feature pills */
  featurePills: {
    display: 'flex',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 20,
    background: `rgba(${TEAL_RGB}, 0.06)`,
    border: `1px solid rgba(${TEAL_RGB}, 0.1)`,
    color: 'rgba(148, 163, 184, 0.6)',
    fontSize: 10,
    fontWeight: 500,
  },

  /* Footer */
  footer: {
    textAlign: 'center' as const,
    marginTop: 28,
    fontSize: 11,
    color: 'rgba(71, 85, 105, 0.6)',
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
};
