import { useEffect, useState, useRef } from 'react'
import { CheckSquare, Plus, X } from 'lucide-react'
import api from '../api/client'

const STATUS_CONFIG = {
  todo: { label: 'À faire', color: 'var(--text3)' },
  in_progress: { label: 'En cours', color: '#3b82f6' },
  done: { label: 'Terminé', color: 'var(--green)' },
  cancelled: { label: 'Annulé', color: '#ef4444' },
}

const PRIORITY_ACCENT = {
  urgent: '#ef4444',
  high: '#f59e0b',
  normal: 'var(--green)',
  low: 'var(--text3)',
}

const inp = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 12px', color:'var(--text)', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'Sora,sans-serif' }
const lbl = { display:'block', fontSize:'11px', color:'var(--text2)', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'normal', description: '' })
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const triggerRefresh = () => { refreshRef.current += 1; setTick(refreshRef.current) }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/tasks/', { signal: controller.signal })
        setTasks(res.data.results || res.data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [tick])

  const createTask = async () => {
    if (!newTask.title.trim()) return
    try {
      await api.post('/tasks/', newTask)
      setNewTask({ title: '', priority: 'normal', description: '' })
      setShowForm(false)
      triggerRefresh()
    } catch (e) {
      console.error(e)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.post(`/tasks/${id}/status/`, { status })
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    } catch (e) {
      console.error(e)
    }
  }

  const focus = (e) => { e.target.style.borderColor = 'var(--green)' }
  const blur = (e) => { e.target.style.borderColor = 'var(--border)' }

  return (
    <div style={{ padding:'32px 40px', maxWidth:'900px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div>
          <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Gestion</div>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'var(--text)', margin:0 }}>
            Tâches <span style={{ fontSize:'13px', color:'var(--text3)', fontWeight:'400' }}>— {tasks.length} au total</span>
          </h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--green)', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 16px', fontSize:'12.5px', fontWeight:'600', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
          <Plus size={13} />
          Nouvelle tâche
        </button>
      </div>

      {showForm && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'20px', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)' }}>Nouvelle tâche</span>
            <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div>
              <label style={lbl}>Titre</label>
              <input placeholder="Titre de la tâche" value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} style={inp} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <textarea placeholder="Description (optionnel)" value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} rows={2} style={{...inp, resize:'none'}} onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-end' }}>
              <div style={{ flex:1 }}>
                <label style={lbl}>Priorité</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority: e.target.value}))} style={inp}>
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <button onClick={createTask} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'4px', padding:'8px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
                Créer
              </button>
              <button onClick={() => setShowForm(false)} style={{ background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 14px', fontSize:'13px', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)', fontSize:'13px' }}>Chargement...</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
          <CheckSquare size={32} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }} />
          <p style={{ fontSize:'13px' }}>Aucune tâche pour le moment</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {tasks.map(task => {
            const accent = PRIORITY_ACCENT[task.priority] || 'var(--text3)'
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
            return (
              <div key={task.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:`3px solid ${accent}`, borderRadius:'4px', padding:'14px 18px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'13.5px', fontWeight:'500', color: task.status === 'done' ? 'var(--text3)' : 'var(--text)', textDecoration: task.status === 'done' ? 'line-through' : 'none', margin:'0 0 4px' }}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p style={{ fontSize:'12px', color:'var(--text3)', lineHeight:'1.5', margin:0 }}>{task.description}</p>
                  )}
                  {task.source_email_subject && (
                    <div style={{ marginTop:'6px', fontSize:'11px', color:'var(--green)' }}>
                      Via email : {task.source_email_subject}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                  <span style={{ fontSize:'10px', color:cfg.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{cfg.label}</span>
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'4px 8px', fontSize:'11.5px', color:'var(--text2)', outline:'none', cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}