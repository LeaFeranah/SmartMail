import { useEffect, useState, useRef } from 'react'
import { CheckSquare, Plus, X } from 'lucide-react'
import api from '../api/client'

const STATUS_CONFIG = {
  todo:        { label:'À faire',   color:'#6b7280' },
  in_progress: { label:'En cours',  color:'var(--blue)' },
  done:        { label:'Terminé',   color:'var(--success)' },
  cancelled:   { label:'Annulé',    color:'var(--danger)' },
}
const PRIORITY_LEFT = { urgent:'var(--danger)', high:'var(--warning)', normal:'var(--blue)', low:'var(--border2)' }

const inp = { width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'8px 12px', color:'var(--text)', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif', transition:'border-color 0.15s' }
const lbl = { display:'block', fontSize:'12px', fontWeight:'500', color:'var(--text2)', marginBottom:'5px' }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ title:'', priority:'normal', description:'' })
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const triggerRefresh = () => { refreshRef.current += 1; setTick(refreshRef.current) }

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      try { const res = await api.get('/tasks/', { signal:controller.signal }); setTasks(res.data.results || res.data) }
      catch (e) { console.error(e) }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [tick])

  const createTask = async () => {
    if (!newTask.title.trim()) return
    try { await api.post('/tasks/', newTask); setNewTask({ title:'', priority:'normal', description:'' }); setShowForm(false); triggerRefresh() }
    catch (e) { console.error(e) }
  }

  const updateStatus = async (id, status) => {
    try { await api.post(`/tasks/${id}/status/`, { status }); setTasks(prev => prev.map(t => t.id===id?{...t,status}:t)) }
    catch (e) { console.error(e) }
  }

  const focus = (e) => { e.target.style.borderColor='var(--blue)' }
  const blur = (e) => { e.target.style.borderColor='var(--border)' }

  return (
    <div style={{ padding:'28px', width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <p style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>Gestion</p>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'var(--text)' }}>Tâches <span style={{ fontSize:'13px', color:'var(--text3)', fontWeight:'400' }}>— {tasks.length} au total</span></h1>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--blue)', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'12.5px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          <Plus size={13} /> Nouvelle tâche
        </button>
      </div>

      {showForm && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'16px', width:'100%' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span style={{ fontSize:'13.5px', fontWeight:'600', color:'var(--text)' }}>Nouvelle tâche</span>
            <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}><X size={15} /></button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div><label style={lbl}>Titre</label><input placeholder="Titre de la tâche" value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={lbl}>Description</label><textarea placeholder="Description (optionnel)" value={newTask.description} onChange={e=>setNewTask(p=>({...p,description:e.target.value}))} rows={2} style={{...inp,resize:'none'}} onFocus={focus} onBlur={blur} /></div>
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-end' }}>
              <div style={{ flex:1 }}>
                <label style={lbl}>Priorité</label>
                <select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={inp} onFocus={focus} onBlur={blur}>
                  <option value="low">Basse</option><option value="normal">Normale</option>
                  <option value="high">Haute</option><option value="urgent">Urgente</option>
                </select>
              </div>
              <button onClick={createTask} style={{ background:'var(--blue)', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 20px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Créer</button>
              <button onClick={()=>setShowForm(false)} style={{ background:'var(--bg)', color:'var(--text2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'8px 14px', fontSize:'13px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)', fontSize:'13px' }}>Chargement...</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
          <CheckSquare size={32} style={{ margin:'0 auto 12px', display:'block', opacity:0.25 }} />
          <p style={{ fontSize:'13px' }}>Aucune tâche pour le moment</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {tasks.map(task => {
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
            const accent = PRIORITY_LEFT[task.priority] || 'var(--border2)'
            return (
              <div key={task.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:`3px solid ${accent}`, borderRadius:'8px', padding:'13px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'14px', width:'100%' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'13.5px', fontWeight:'500', color:task.status==='done'?'var(--text3)':'var(--text)', textDecoration:task.status==='done'?'line-through':'none', margin:'0 0 3px' }}>{task.title}</p>
                  {task.description && <p style={{ fontSize:'12px', color:'var(--text2)', margin:0, lineHeight:'1.5' }}>{task.description}</p>}
                  {task.source_email_subject && <p style={{ fontSize:'11px', color:'var(--blue)', margin:'5px 0 0' }}>Via email : {task.source_email_subject}</p>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                  <span style={{ fontSize:'11px', color:cfg.color, fontWeight:'500', whiteSpace:'nowrap' }}>{cfg.label}</span>
                  <select value={task.status} onChange={e=>updateStatus(task.id,e.target.value)} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px', padding:'4px 8px', fontSize:'12px', color:'var(--text2)', outline:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
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