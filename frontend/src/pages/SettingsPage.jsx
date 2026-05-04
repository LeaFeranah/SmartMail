import { useState, useEffect, useRef } from 'react'
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api/client'

const inp = { width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'8px 12px', color:'var(--text)', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif', transition:'border-color 0.15s' }
const lbl = { display:'block', fontSize:'12px', fontWeight:'500', color:'var(--text2)', marginBottom:'5px' }

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'12px', width:'100%' }}>
      <div style={{ fontSize:'13.5px', fontWeight:'600', color:'var(--text)', marginBottom:'14px', paddingBottom:'12px', borderBottom:'1px solid var(--border)' }}>{title}</div>
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
      try { const res = await api.get('/auth/mail-settings/', { signal:controller.signal }); setForm(res.data) }
      catch (e) { console.error(e) }
    })()
    return () => controller.abort()
  }, [tick])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type==='checkbox' ? checked : value }))
  }

  const focus = (e) => { e.target.style.borderColor='var(--blue)' }
  const blur = (e) => { e.target.style.borderColor='var(--border)' }

  const handleSave = async () => {
    setSaving(true)
    try { await api.patch('/auth/mail-settings/', form); setMessage({ type:'success', text:'Paramètres sauvegardés.' }) }
    catch (e) { console.error(e); setMessage({ type:'error', text:'Erreur lors de la sauvegarde.' }) }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.post('/emails/sync/')
      setMessage({ type:'success', text:`Synchronisation terminée — ${res.data.synced} nouveau(x) email(s).` })
      tickRef.current += 1; setTick(tickRef.current)
    } catch (e) { setMessage({ type:'error', text: e.response?.data?.error || 'Erreur IMAP.' }) }
    setSyncing(false)
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div style={{ padding:'28px', width:'100%', maxWidth:'680px' }}>
      <div style={{ marginBottom:'22px' }}>
        <p style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>Configuration</p>
        <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)' }}>Paramètres</h1>
      </div>

      {message && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background: message.type==='success'?'#f0fdf4':'#fef2f2', border:`1px solid ${message.type==='success'?'#bbf7d0':'#fecaca'}`, borderRadius:'6px', padding:'10px 14px', color: message.type==='success'?'var(--success)':'var(--danger)', fontSize:'12.5px', marginBottom:'14px' }}>
          {message.type==='success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {message.text}
        </div>
      )}

      <Section title="Réception IMAP">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px', gap:'12px', marginBottom:'12px' }}>
          <div><label style={lbl}>Serveur IMAP</label><input name="imap_host" value={form.imap_host} onChange={handleChange} placeholder="imap.gmail.com" style={inp} onFocus={focus} onBlur={blur} /></div>
          <div><label style={lbl}>Port</label><input name="imap_port" type="number" value={form.imap_port} onChange={handleChange} style={inp} onFocus={focus} onBlur={blur} /></div>
        </div>
        <div style={{ marginBottom:'12px' }}><label style={lbl}>Adresse email</label><input name="imap_user" value={form.imap_user} onChange={handleChange} placeholder="vous@gmail.com" style={inp} onFocus={focus} onBlur={blur} /></div>
        <div><label style={lbl}>Mot de passe / App Password</label><input name="imap_password" type="password" value={form.imap_password} onChange={handleChange} placeholder="••••••••••••••••" style={inp} onFocus={focus} onBlur={blur} /></div>
      </Section>

      <Section title="Envoi SMTP">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px', gap:'12px' }}>
          <div><label style={lbl}>Serveur SMTP</label><input name="smtp_host" value={form.smtp_host} onChange={handleChange} placeholder="smtp.gmail.com" style={inp} onFocus={focus} onBlur={blur} /></div>
          <div><label style={lbl}>Port</label><input name="smtp_port" type="number" value={form.smtp_port} onChange={handleChange} style={inp} onFocus={focus} onBlur={blur} /></div>
        </div>
      </Section>

      <Section title="Relances automatiques">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
          <span style={{ fontSize:'13px', color:'var(--text2)' }}>Activer les relances automatiques</span>
          <input type="checkbox" name="auto_followup_enabled" checked={form.auto_followup_enabled} onChange={handleChange} style={{ width:'15px', height:'15px', accentColor:'var(--blue)', cursor:'pointer' }} />
        </div>
        <div><label style={lbl}>Délai avant relance (jours)</label><input name="followup_delay_days" type="number" value={form.followup_delay_days} onChange={handleChange} min="1" max="30" style={{...inp, maxWidth:'120px'}} onFocus={focus} onBlur={blur} /></div>
      </Section>

      <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--blue)', color:'#fff', border:'none', borderRadius:'6px', padding:'9px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          <Save size={13} />{saving?'Sauvegarde...':'Sauvegarder'}
        </button>
        <button onClick={handleSync} disabled={syncing} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface)', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 18px', fontSize:'13px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          <RefreshCw size={13} />{syncing?'Synchronisation...':'Synchroniser'}
        </button>
      </div>
    </div>
  )
}