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
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch { setError('Identifiants incorrects. Veuillez réessayer.') }
    finally { setLoading(false) }
  }

  const inp = { width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'10px 12px', color:'var(--text)', fontSize:'13.5px', outline:'none', fontFamily:'Inter,sans-serif', transition:'border-color 0.15s' }

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'var(--bg)', display:'flex' }}>

      {/* Formulaire gauche */}
      <div style={{ width:'400px', minWidth:'400px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'48px 36px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'48px' }}>
          <img src="/logo_ispm.png" alt="ISPM" style={{ width:'34px', height:'34px', objectFit:'contain' }} />
          <div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'var(--text)' }}>SmartMail AI</div>
            <div style={{ fontSize:'10px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>ISPM · IGGLIA 5</div>
          </div>
        </div>

        <h1 style={{ fontSize:'22px', fontWeight:'700', color:'var(--text)', marginBottom:'6px' }}>Connexion</h1>
        <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'28px', lineHeight:'1.6' }}>Accédez à votre espace de gestion d'emails.</p>

        {error && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', padding:'10px 12px', color:'var(--danger)', fontSize:'12.5px', marginBottom:'18px' }}>
            <AlertCircle size={14} style={{ marginTop:'1px', flexShrink:0 }} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'500', color:'var(--text2)', marginBottom:'5px' }}>Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={inp}
              onFocus={e => e.target.style.borderColor='var(--blue)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'500', color:'var(--text2)', marginBottom:'5px' }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inp}
              onFocus={e => e.target.style.borderColor='var(--blue)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
          <button type="submit" disabled={loading} style={{ background: loading ? '#93c5fd' : 'var(--blue)', color:'#fff', border:'none', borderRadius:'6px', padding:'11px 16px', fontSize:'13.5px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer', marginTop:'4px', fontFamily:'Inter,sans-serif' }}>
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ marginTop:'22px', fontSize:'12.5px', color:'var(--text3)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:'var(--blue)', textDecoration:'none', fontWeight:'500' }}>Créer un compte</Link>
        </p>
      </div>

      {/* Panneau droit — prend tout l'espace */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize:'22px 22px', opacity:0.7 }} />
        <div style={{ position:'relative', maxWidth:'520px', width:'100%', textAlign:'center' }}>
          <div style={{ display:'inline-block', background:'var(--blue-light)', border:'1px solid var(--blue-border)', borderRadius:'20px', padding:'4px 14px', fontSize:'11px', color:'var(--blue)', fontWeight:'600', marginBottom:'22px' }}>
            Système intelligent de gestion d'emails
          </div>
          <h2 style={{ fontSize:'30px', fontWeight:'700', color:'var(--text)', marginBottom:'14px', lineHeight:'1.3' }}>
            Gérez vos emails avec l'intelligence artificielle
          </h2>
          <p style={{ fontSize:'14px', color:'var(--text2)', lineHeight:'1.8', marginBottom:'36px' }}>
            SmartMail AI analyse automatiquement vos emails, détecte les actions à réaliser et assure un suivi intelligent de vos échanges professionnels.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
            {[{label:'Analyse IA',value:'Automatique'},{label:'Tâches',value:'Auto-créées'},{label:'Relances',value:'Planifiées'}].map((s,i) => (
              <div key={i} style={{ background:'var(--surface)', padding:'18px 12px', textAlign:'center' }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'var(--blue)', marginBottom:'4px' }}>{s.value}</div>
                <div style={{ fontSize:'11px', color:'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}