import { useEffect, useState, useRef } from 'react'
import { Mail, CheckSquare, Clock, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react'
import api from '../api/client'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'20px 24px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <span style={{ fontSize:'11px', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
        <div style={{ width:'28px', height:'28px', borderRadius:'4px', background:accent+'18', border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={13} color={accent} />
        </div>
      </div>
      <p style={{ fontSize:'32px', fontWeight:'700', color:'var(--text)', fontFamily:'JetBrains Mono, monospace' }}>{value ?? '0'}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const handleRefresh = () => { refreshRef.current += 1; setTick(refreshRef.current) }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/auth/dashboard-stats/', { signal: controller.signal })
        setStats(res.data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [tick])

  return (
    <div style={{ padding:'32px 40px', maxWidth:'1100px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'32px' }}>
        <div>
          <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Vue d'ensemble</div>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'var(--text)', margin:0 }}>Tableau de bord</h1>
        </div>
        <button onClick={handleRefresh} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'6px 14px', color:'var(--text2)', fontSize:'12px', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px' }}>
        <StatCard icon={Mail} label="Non lus" value={stats?.unread_emails} accent="#3b82f6" />
        <StatCard icon={AlertTriangle} label="Urgents" value={stats?.urgent_emails} accent="#ef4444" />
        <StatCard icon={Clock} label="À répondre" value={stats?.needs_reply} accent="#f59e0b" />
        <StatCard icon={CheckSquare} label="Tâches" value={stats?.pending_tasks} accent="var(--green)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <TrendingUp size={14} color="var(--green)" />
            <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)' }}>Résumé</span>
          </div>
          {[
            { label: 'Total emails', value: stats?.total_emails ?? 0 },
            { label: 'Relances en attente', value: stats?.pending_followups ?? 0 },
            { label: 'Tâches en cours', value: stats?.in_progress_tasks ?? 0 },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize:'13px', color:'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', fontFamily:'JetBrains Mono, monospace' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', marginBottom:'20px' }}>Actions rapides</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[
              { href: '/emails', label: 'Voir les emails urgents' },
              { href: '/tasks', label: 'Gérer les tâches' },
              { href: '/settings', label: 'Configurer la boîte mail' },
            ].map((item, i) => (
              <a key={i} href={item.href} style={{ display:'block', padding:'10px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', color:'var(--text2)', fontSize:'13px', textDecoration:'none', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}