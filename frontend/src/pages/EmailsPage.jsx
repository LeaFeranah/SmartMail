import { useEffect, useState, useRef } from 'react'
import { Mail, Clock, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react'
import api from '../api/client'

const PRIORITY_STYLE = {
  urgent: { bg:'#fef2f2', color:'#b91c1c', border:'#fecaca' },
  high:   { bg:'#fffbeb', color:'#92400e', border:'#fde68a' },
  normal: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
  low:    { bg:'#f9fafb', color:'#6b7280', border:'#e5e7eb' },
}
const CATEGORY_LABEL = { action_required:'Action requise', waiting_reply:'En attente', informational:'Informatif', spam:'Spam', newsletter:'Newsletter', other:'Autre' }

export default function EmailsPage() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [analyzing, setAnalyzing] = useState(null)
  const [analyzingAll, setAnalyzingAll] = useState(false)
  const [schedulingId, setSchedulingId] = useState(null)
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const handleRefresh = () => { refreshRef.current += 1; setTick(refreshRef.current) }

  useEffect(() => {
    const controller = new AbortController()
    const params = {}
    if (filter==='unread') params.is_read='false'
    if (filter==='needs_reply') params.needs_reply='true'
    if (filter==='urgent') params.priority='urgent'
    ;(async () => {
      setLoading(true)
      try { const res = await api.get('/emails/', { params, signal:controller.signal }); setEmails(res.data.results || res.data) }
      catch (e) { console.error(e) }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [filter, tick])

  const markRead = async (id) => {
    try { await api.post(`/emails/${id}/mark-read/`); setEmails(prev => prev.map(e => e.id===id?{...e,is_read:true}:e)) }
    catch (e) { console.error(e) }
  }

  const analyzeEmail = async (id) => {
    setAnalyzing(id)
    try {
      const res = await api.post(`/analysis/email/${id}/`)
      const a = res.data.analysis
      setEmails(prev => prev.map(e => e.id===id?{...e,is_analyzed:true,priority:a.priority,category:a.category,summary:a.summary,needs_reply:a.needs_reply,action_detected:a.action_detected}:e))
      if (res.data.tasks_count > 0) alert(`Analyse terminée — ${res.data.tasks_count} tâche(s) créée(s).`)
    } catch (e) { console.error(e) }
    setAnalyzing(null)
  }

  const analyzeAll = async () => {
    setAnalyzingAll(true)
    try { await api.post('/analysis/batch/'); handleRefresh() }
    catch (e) { console.error(e) }
    setAnalyzingAll(false)
  }

  const scheduleFollowup = async (id) => {
    setSchedulingId(id)
    try { const res = await api.post(`/emails/${id}/schedule-followup/`); alert(`Relance planifiée.\n\nMessage :\n${res.data.message}`) }
    catch (e) { console.error(e) }
    setSchedulingId(null)
  }

  return (
    <div style={{ padding:'28px', width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <p style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>Boîte de réception</p>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)' }}>Emails <span style={{ fontSize:'13px', color:'var(--text3)', fontWeight:'400' }}>— {emails.length}</span></h1>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={analyzeAll} disabled={analyzingAll} style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--blue-light)', color:'var(--blue)', border:'1px solid var(--blue-border)', borderRadius:'6px', padding:'7px 14px', fontSize:'12.5px', fontWeight:'500', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <Zap size={13} />{analyzingAll?'Analyse...':'Tout analyser'}
          </button>
          <button onClick={handleRefresh} style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--surface)', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'7px 14px', fontSize:'12.5px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <RefreshCw size={13} />Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'18px', flexWrap:'wrap' }}>
        {[{key:'all',label:'Tous'},{key:'unread',label:'Non lus'},{key:'needs_reply',label:'À répondre'},{key:'urgent',label:'Urgents'}].map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)} style={{ padding:'6px 14px', borderRadius:'6px', fontSize:'12.5px', fontWeight:'500', cursor:'pointer', fontFamily:'Inter,sans-serif', border: filter===f.key?'1px solid var(--blue)':'1px solid var(--border)', background: filter===f.key?'var(--blue-light)':'var(--surface)', color: filter===f.key?'var(--blue)':'var(--text2)', transition:'all 0.12s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)', fontSize:'13px' }}>Chargement...</div>
      ) : emails.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
          <Mail size={32} style={{ margin:'0 auto 10px', display:'block', opacity:0.3 }} />
          <p style={{ fontSize:'13px' }}>Aucun email trouvé</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {emails.map(email => {
            const ps = PRIORITY_STYLE[email.priority] || PRIORITY_STYLE.normal
            return (
              <div key={email.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'14px 16px', transition:'border-color 0.12s', width:'100%' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'10px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'3px' }}>
                      {!email.is_read && <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--blue)', flexShrink:0, display:'inline-block' }} />}
                      <p style={{ fontSize:'13.5px', fontWeight: email.is_read?'500':'600', color:'var(--text)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{email.subject}</p>
                    </div>
                    <p style={{ fontSize:'12px', color:'var(--text2)', margin:0 }}>{email.sender}</p>
                    {email.summary && <p style={{ fontSize:'12.5px', color:'var(--text2)', margin:'7px 0 0', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'7px 11px', lineHeight:'1.5' }}>{email.summary}</p>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }}>
                    <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'4px', fontWeight:'600', background:ps.bg, color:ps.color, border:`1px solid ${ps.border}`, whiteSpace:'nowrap' }}>{email.priority}</span>
                    {email.category && email.category!=='other' && <span style={{ fontSize:'11px', color:'var(--text3)' }}>{CATEGORY_LABEL[email.category]}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'10px', borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                    {!email.is_read && (
                      <button onClick={()=>markRead(email.id)} style={{ display:'flex', alignItems:'center', gap:'4px', background:'none', border:'none', padding:0, color:'var(--text3)', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}
                        onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                        <CheckCircle size={13} /> Marquer lu
                      </button>
                    )}
                    <button onClick={()=>scheduleFollowup(email.id)} disabled={schedulingId===email.id} style={{ display:'flex', alignItems:'center', gap:'4px', background:'none', border:'none', padding:0, color:'var(--text3)', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--warning)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                      <Clock size={13} />{schedulingId===email.id?'Génération...':'Planifier relance'}
                    </button>
                    {email.needs_reply && <span style={{ fontSize:'12px', color:'var(--warning)', display:'flex', alignItems:'center', gap:'3px' }}><Clock size={12} />Réponse requise</span>}
                    {email.action_detected && <span style={{ fontSize:'12px', color:'var(--danger)', display:'flex', alignItems:'center', gap:'3px' }}><AlertTriangle size={12} />Action détectée</span>}
                  </div>
                  {!email.is_analyzed ? (
                    <button onClick={()=>analyzeEmail(email.id)} disabled={analyzing===email.id} style={{ display:'flex', alignItems:'center', gap:'4px', background:'var(--blue-light)', color:'var(--blue)', border:'1px solid var(--blue-border)', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', fontWeight:'500', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                      <Zap size={12} />{analyzing===email.id?'Analyse...':'Analyser'}
                    </button>
                  ) : (
                    <span style={{ fontSize:'12px', color:'var(--success)', display:'flex', alignItems:'center', gap:'4px' }}><CheckCircle size={13} />Analysé</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}