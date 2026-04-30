import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import api from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', first_name: '', last_name: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) { setError('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    try {
      await api.post('/auth/register/', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data
      if (data) { const first = Object.values(data)[0]; setError(Array.isArray(first) ? first[0] : first) }
      else setError('Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  const inp = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'9px 14px', color:'var(--text)', fontSize:'13.5px', outline:'none', boxSizing:'border-box', fontFamily:'Sora,sans-serif' }
  const lbl = { display:'block', fontSize:'11px', color:'var(--text2)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }
  const strength = form.password.length >= 8 ? 'Fort' : form.password.length >= 4 ? 'Moyen' : 'Faible'
  const sc = form.password.length >= 8 ? 'var(--green)' : form.password.length >= 4 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px' }}>
      <div style={{ width:'100%', maxWidth:'460px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'40px' }}>
          <img src="/logo_ispm.png" alt="ISPM" style={{ width:'36px', height:'36px', objectFit:'contain' }} />
          <div>
            <div style={{ fontSize:'15px', fontWeight:'700', color:'var(--text)' }}>SmartMail AI</div>
            <div style={{ fontSize:'10px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>ISPM · IGGLIA 5</div>
          </div>
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'32px' }}>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)', marginBottom:'6px' }}>Créer un compte</h1>
          <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'28px' }}>Remplissez les informations ci-dessous pour commencer.</p>
          {success && <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#1db95420', border:'1px solid #1db95440', borderRadius:'4px', padding:'10px 12px', color:'var(--green)', fontSize:'13px', marginBottom:'20px' }}><CheckCircle size={14} />Compte créé. Redirection en cours...</div>}
          {error && <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', background:'#ef444415', border:'1px solid #ef444430', borderRadius:'4px', padding:'10px 12px', color:'#ef4444', fontSize:'12.5px', marginBottom:'20px' }}><AlertCircle size={14} style={{ marginTop:'1px', flexShrink:0 }} />{error}</div>}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div><label style={lbl}>Prénom</label><input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Jean" style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              <div><label style={lbl}>Nom</label><input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Dupont" style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
            </div>
            <div><label style={lbl}>Nom d'utilisateur</label><input name="username" value={form.username} onChange={handleChange} placeholder="jeandupont" required style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
            <div><label style={lbl}>Adresse email</label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" required style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
            <div>
              <label style={lbl}>Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="8 caractères minimum" required style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
              {form.password && <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'6px' }}><div style={{ display:'flex', gap:'3px', flex:1 }}>{[1,2,3,4].map(i=><div key={i} style={{ height:'2px', flex:1, borderRadius:'1px', background:form.password.length>=i*2?sc:'var(--border2)', transition:'background 0.2s' }} />)}</div><span style={{ fontSize:'10px', color:sc, textTransform:'uppercase', letterSpacing:'0.05em' }}>{strength}</span></div>}
            </div>
            <div><label style={lbl}>Confirmer le mot de passe</label><input type="password" name="password2" value={form.password2} onChange={handleChange} placeholder="••••••••" required style={inp} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
            <button type="submit" disabled={loading||success} style={{ background:loading||success?'var(--surface2)':'var(--green)', color:loading||success?'var(--text3)':'#fff', border:'none', borderRadius:'4px', padding:'10px 20px', fontSize:'13.5px', fontWeight:'600', cursor:loading?'not-allowed':'pointer', marginTop:'8px', fontFamily:'Sora,sans-serif' }}>
              {loading ? 'Création en cours...' : "S'inscrire"}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'12.5px', color:'var(--text3)' }}>
          Vous avez déjà un compte ?{' '}<Link to="/login" style={{ color:'var(--green)', textDecoration:'none', fontWeight:'500' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  )
}