import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '9px 14px',
    color: 'var(--text)',
    fontSize: '13.5px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
    }}>
      {/* Panneau gauche */}
      <div style={{
        width: '420px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 40px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
          <img src="/logo_ispm.png" alt="ISPM" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>SmartMail AI</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ISPM · IGGLIA 5</div>
          </div>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
            Connexion
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
            Accédez à votre assistant de gestion d'emails.
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            background: '#ef444415', border: '1px solid #ef444440',
            borderRadius: '4px', padding: '10px 12px',
            color: '#ef4444', fontSize: '12.5px', marginBottom: '20px',
          }}>
            <AlertCircle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--surface2)' : 'var(--green)',
              color: loading ? 'var(--text3)' : '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'all 0.15s',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '12.5px', color: 'var(--text3)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: '500' }}>
            Créer un compte
          </Link>
        </div>
      </div>

      {/* Panneau droit */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grille de fond */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, var(--bg) 80%)',
        }} />

        {/* Contenu central */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--green-muted)',
            border: '1px solid var(--green-border)',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '11px',
            color: 'var(--green)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
          }}>
            Système intelligent
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', lineHeight: '1.3' }}>
            Gérez vos emails avec l'intelligence artificielle
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', marginBottom: '40px' }}>
            SmartMail AI analyse automatiquement vos emails, détecte les actions à réaliser et assure un suivi intelligent de vos échanges.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1px', background: 'var(--border)' }}>
            {[
              { label: 'Analyse IA', value: 'Automatique' },
              { label: 'Tâches', value: 'Auto-détectées' },
              { label: 'Relances', value: 'Planifiées' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1,
                background: 'var(--surface)',
                padding: '20px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--green)', marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}