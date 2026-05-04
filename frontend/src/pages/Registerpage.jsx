import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import api from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', username: '', first_name: '',
    last_name: '', password: '', password2: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) { setError('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 8) { setError('Minimum 8 caractères requis.'); return }
    setLoading(true)
    try {
      await api.post('/auth/register/', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const d = err.response?.data
      if (d) { const f = Object.values(d)[0]; setError(Array.isArray(f) ? f[0] : f) }
      else setError('Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', background: '#f9fafb',
    border: '1px solid var(--border)', borderRadius: '6px',
    padding: '10px 12px', color: 'var(--text)', fontSize: '13px',
    outline: 'none', fontFamily: 'Inter,sans-serif',
    transition: 'border-color 0.15s', boxSizing: 'border-box'
  }
  const lbl = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    color: 'var(--text2)', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.05em'
  }
  const sc = form.password.length >= 8 ? 'var(--success)' : form.password.length >= 4 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <img src="/logo_ispm.png" alt="ISPM" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>SmartMail AI</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ISPM · IGGLIA 5</div>
          </div>
        </div>

        {/* Carte */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
          <h1 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>Créer un compte</h1>
          <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '22px' }}>
            Remplissez les informations ci-dessous pour commencer.
          </p>

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px', color: 'var(--success)', fontSize: '12.5px', marginBottom: '16px' }}>
              <CheckCircle size={14} /> Compte créé avec succès. Redirection...
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', color: 'var(--danger)', fontSize: '12.5px', marginBottom: '16px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>Prénom</label>
                <input name="first_name" value={form.first_name} onChange={handleChange}
                  placeholder="Jean" style={inp}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={lbl}>Nom</label>
                <input name="last_name" value={form.last_name} onChange={handleChange}
                  placeholder="Dupont" style={inp}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Nom d'utilisateur</label>
              <input name="username" value={form.username} onChange={handleChange}
                placeholder="jeandupont" required style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Adresse email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="vous@exemple.com" required style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="8 caractères minimum" required style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              {form.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: form.password.length >= i * 2 ? sc : 'var(--border)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: sc, fontWeight: '600' }}>
                    {form.password.length >= 8 ? 'Fort' : form.password.length >= 4 ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmer */}
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Confirmer le mot de passe</label>
              <input type="password" name="password2" value={form.password2} onChange={handleChange}
                placeholder="••••••••" required style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%', background: loading || success ? '#93c5fd' : 'var(--blue)',
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '11px 16px', fontSize: '13.5px', fontWeight: '600',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter,sans-serif'
              }}
            >
              {loading ? 'Création en cours...' : "S'inscrire"}
            </button>

          </form>
        </div>

        {/* Lien connexion */}
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: 'var(--text3)' }}>
          Vous avez déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: '500' }}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}