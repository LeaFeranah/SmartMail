import { useState, useEffect, useRef } from 'react'
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api/client'

const inp = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 12px', color:'var(--text)', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'Sora,sans-serif' }
const lbl = { display:'block', fontSize:'11px', color:'var(--text2)', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'24px', marginBottom:'12px' }}>
      <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', marginBottom:'18px', paddingBottom:'12px', borderBottom:'1px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'12px' }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [form, setForm] = useState({ imap_host:'', imap_port:993, imap_user:'', imap_password:'', smtp_host:'', smtp_port:587, auto_followup_enabled:true, followup_delay_days:3 })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState(null)
  const tickRef = useRef(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await api.get('/auth/mail-settings/', { signal: controller.signal })
        setForm(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => controller.abort()
  }, [tick])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const focus = (e) => { e.target.style.borderColor = 'var(--green)' }
  const blur = (e) => { e.target.style.borderColor = 'var(--border)' }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/mail-settings/', form)
      setMessage({ type:'success', text:'Paramètres sauvegardés.' })
    } catch (e) {
      console.error(e)
      setMessage({ type:'error', text:'Erreur lors de la sauvegarde.' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.post('/emails/sync/')
      setMessage({ type:'success', text:`Synchronisation terminée — ${res.data.synced} nouveau(x) email(s).` })
      tickRef.current += 1
      setTick(tickRef.current)
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.error || 'Erreur de connexion IMAP.' })
    }
    setSyncing(false)
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div style={{ padding:'32px 40px', maxWidth:'640px' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Configuration</div>
        <h1 style={{ fontSize:'22px', fontWeight:'700', color:'var(--text)', margin:0 }}>Paramètres</h1>
      </div>

      {message && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background: message.type==='success' ? '#1db95415' : '#ef444415', border:`1px solid ${message.type==='success' ? '#1db95440' : '#ef444430'}`, borderRadius:'4px', padding:'10px 14px', color: message.type==='success' ? 'var(--green)' : '#ef4444', fontSize:'12.5px', marginBottom:'16px' }}>
          {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {message.text}
        </div>
      )}

      <Section title="Réception IMAP">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:'12px', marginBottom:'12px' }}>
          <div>
            <label style={lbl}>Serveur IMAP</label>
            <input name="imap_host" value={form.imap_host} onChange={handleChange} placeholder="imap.gmail.com" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Port</label>
            <input name="imap_port" type="number" value={form.imap_port} onChange={handleChange} style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>
        <Field label="Adresse email">
          <input name="imap_user" value={form.imap_user} onChange={handleChange} placeholder="vous@gmail.com" style={inp} onFocus={focus} onBlur={blur} />
        </Field>
        <Field label="Mot de passe / App Password">
          <input name="imap_password" type="password" value={form.imap_password} onChange={handleChange} placeholder="••••••••••••••••" style={inp} onFocus={focus} onBlur={blur} />
        </Field>
      </Section>

      <Section title="Envoi SMTP">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:'12px' }}>
          <div>
            <label style={lbl}>Serveur SMTP</label>
            <input name="smtp_host" value={form.smtp_host} onChange={handleChange} placeholder="smtp.gmail.com" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Port</label>
            <input name="smtp_port" type="number" value={form.smtp_port} onChange={handleChange} style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>
      </Section>

      <Section title="Relances automatiques">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <span style={{ fontSize:'13px', color:'var(--text2)' }}>Activer les relances automatiques</span>
          <input type="checkbox" name="auto_followup_enabled" checked={form.auto_followup_enabled} onChange={handleChange} style={{ width:'16px', height:'16px', accentColor:'var(--green)', cursor:'pointer' }} />
        </div>
        <Field label="Délai avant relance (jours)">
          <input name="followup_delay_days" type="number" value={form.followup_delay_days} onChange={handleChange} min="1" max="30" style={{...inp, maxWidth:'120px'}} onFocus={focus} onBlur={blur} />
        </Field>
      </Section>

      <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--green)', color:'#fff', border:'none', borderRadius:'4px', padding:'8px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
          <Save size={13} />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        <button onClick={handleSync} disabled={syncing} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface)', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 18px', fontSize:'13px', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
          <RefreshCw size={13} />
          {syncing ? 'Synchronisation...' : 'Synchroniser les emails'}
        </button>
      </div>
    </div>
  )
}