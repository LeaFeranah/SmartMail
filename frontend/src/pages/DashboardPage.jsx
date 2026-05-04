import { useEffect, useState, useRef } from 'react'
import { Mail, CheckSquare, Clock, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react'
import api from '../api/client'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'18px 20px', flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <span style={{ fontSize:'12px', color:'var(--text2)', fontWeight:'500' }}>{label}</span>
        <Icon size={16} color={color} strokeWidth={1.8} />
      </div>
      <p style={{ fontSize:'26px', fontWeight:'700', color:'var(--text)' }}>{value ?? '0'}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [, setLoading] = useState(true)
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const handleRefresh = () => { refreshRef.current += 1; setTick(refreshRef.current) }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      try { const res = await api.get('/auth/dashboard-stats/', { signal:controller.signal }); setStats(res.data) }
      catch (e) { console.error(e) }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [tick])

  return (
    <div style={{ padding:'28px', width:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <p style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>Vue d'ensemble</p>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)' }}>Tableau de bord</h1>
        </div>
        <button onClick={handleRefresh} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'6px', padding:'7px 14px', color:'var(--text2)', fontSize:'12.5px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* Stats grid — 4 colonnes */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'18px' }}>
        <StatCard icon={Mail} label="Emails non lus" value={stats?.unread_emails} color="var(--blue)" />
        <StatCard icon={AlertTriangle} label="Urgents" value={stats?.urgent_emails} color="var(--danger)" />
        <StatCard icon={Clock} label="À répondre" value={stats?.needs_reply} color="var(--warning)" />
        <StatCard icon={CheckSquare} label="Tâches à faire" value={stats?.pending_tasks} color="var(--success)" />
      </div>

      {/* Bas — 2 colonnes */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'16px' }}>
            <TrendingUp size={14} color="var(--blue)" />
            <span style={{ fontSize:'13.5px', fontWeight:'600', color:'var(--text)' }}>Résumé général</span>
          </div>
          {[
            { label:'Total emails', value: stats?.total_emails ?? 0 },
            { label:'Relances en attente', value: stats?.pending_followups ?? 0 },
            { label:'Tâches en cours', value: stats?.in_progress_tasks ?? 0 },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom: i<2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize:'13px', color:'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize:'14px', fontWeight:'600', color:'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px' }}>
          <div style={{ fontSize:'13.5px', fontWeight:'600', color:'var(--text)', marginBottom:'16px' }}>Actions rapides</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[
              { href:'/emails', label:'Voir les emails urgents' },
              { href:'/tasks', label:'Gérer les tâches' },
              { href:'/settings', label:'Configurer la boîte mail' },
            ].map((item, i) => (
              <a key={i} href={item.href} style={{ display:'block', padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', color:'var(--text2)', fontSize:'13px', textDecoration:'none', transition:'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.color='var(--blue)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)' }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}