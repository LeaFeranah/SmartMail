import { useEffect, useState, useRef } from 'react'
import { Mail, Clock, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react'
import api from '../api/client'

const PRIORITY_COLOR = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const CATEGORY_LABEL = {
  action_required: 'Action requise',
  waiting_reply: 'En attente',
  informational: 'Informatif',
  spam: 'Spam',
  newsletter: 'Newsletter',
  other: 'Autre',
}

export default function EmailsPage() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [analyzing, setAnalyzing] = useState(null)
  const [analyzingAll, setAnalyzingAll] = useState(false)
  const [schedulingId, setSchedulingId] = useState(null)
  const refreshRef = useRef(0)
  const [tick, setTick] = useState(0)

  const handleRefresh = () => {
    refreshRef.current += 1
    setTick(refreshRef.current)
  }

  useEffect(() => {
    const controller = new AbortController()
    const params = {}
    if (filter === 'unread') params.is_read = 'false'
    if (filter === 'needs_reply') params.needs_reply = 'true'
    if (filter === 'urgent') params.priority = 'urgent'
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/emails/', { params, signal: controller.signal })
        setEmails(res.data.results || res.data)
      } catch {
        // ignoré
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [filter, tick])

  const markRead = async (id) => {
    try {
      await api.post(`/emails/${id}/mark-read/`)
      setEmails(prev => prev.map(e => e.id === id ? { ...e, is_read: true } : e))
    } catch (e) { console.error(e) }
  }

  const analyzeEmail = async (id) => {
    setAnalyzing(id)
    try {
      const res = await api.post(`/analysis/email/${id}/`)
      const a = res.data.analysis
      setEmails(prev => prev.map(e => e.id === id ? {
        ...e, is_analyzed: true,
        priority: a.priority, category: a.category,
        summary: a.summary, needs_reply: a.needs_reply,
        action_detected: a.action_detected,
      } : e))
      if (res.data.tasks_count > 0) {
        alert(`✅ Analyse terminée !\n${res.data.tasks_count} tâche(s) créée(s) automatiquement.`)
      }
    } catch (err) { console.error(err) }
    finally { setAnalyzing(null) }
  }

  const analyzeAll = async () => {
    setAnalyzingAll(true)
    try {
      await api.post('/analysis/batch/')
      handleRefresh()
    } catch (e) { console.error(e) }
    finally { setAnalyzingAll(false) }
  }

  const scheduleFollowup = async (id) => {
    setSchedulingId(id)
    try {
      const res = await api.post(`/emails/${id}/schedule-followup/`)
      alert(`✅ Relance planifiée !\n\nMessage généré par IA :\n\n${res.data.message}`)
    } catch (e) {
      alert('❌ Erreur lors de la planification.')
      console.error(e)
    } finally {
      setSchedulingId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Emails</h1>
          <p className="text-slate-400 text-sm mt-1">{emails.length} message(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={analyzeAll} disabled={analyzingAll}
            className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40
                       border border-indigo-600/30 text-indigo-300 px-4 py-2
                       rounded-xl text-sm transition-all disabled:opacity-50">
            <Zap size={15} className={analyzingAll ? 'animate-pulse' : ''} />
            {analyzingAll ? 'Analyse en cours...' : 'Tout analyser avec IA'}
          </button>
          <button onClick={handleRefresh}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700
                       text-slate-300 px-4 py-2 rounded-xl text-sm transition-all">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'unread', label: 'Non lus' },
          { key: 'needs_reply', label: 'À répondre' },
          { key: 'urgent', label: 'Urgents' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste emails */}
      {loading ? (
        <div className="text-slate-500 text-center py-20">Chargement...</div>
      ) : emails.length === 0 ? (
        <div className="text-slate-500 text-center py-20">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun email trouvé</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {emails.map(email => (
            <div key={email.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all hover:border-slate-600
                ${email.is_read ? 'border-slate-800' : 'border-indigo-600/40'}`}>

              {/* Contenu email */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!email.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                    <p className="text-white font-medium truncate">{email.subject}</p>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{email.sender}</p>
                  {email.summary && (
                    <p className="text-slate-500 text-sm bg-slate-800/50 rounded-lg px-3 py-2 mt-2">
                      💡 {email.summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg border
                    ${PRIORITY_COLOR[email.priority] || PRIORITY_COLOR.normal}`}>
                    {email.priority}
                  </span>
                  {email.category && email.category !== 'other' && (
                    <span className="text-xs text-slate-500">
                      {CATEGORY_LABEL[email.category]}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3 flex-wrap">

                  {/* Marquer lu */}
                  {!email.is_read && (
                    <button onClick={() => markRead(email.id)}
                      className="flex items-center gap-1 text-xs text-slate-400
                                 hover:text-indigo-400 transition-all">
                      <CheckCircle size={13} />
                      Marquer lu
                    </button>
                  )}

                  {/* Planifier relance */}
                  <button
                    onClick={() => scheduleFollowup(email.id)}
                    disabled={schedulingId === email.id}
                    className="flex items-center gap-1 text-xs text-slate-400
                               hover:text-amber-400 transition-all disabled:opacity-50">
                    <Clock size={13} className={schedulingId === email.id ? 'animate-pulse' : ''} />
                    {schedulingId === email.id ? 'Génération...' : 'Planifier relance'}
                  </button>

                  {/* Badges */}
                  {email.needs_reply && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Clock size={13} />
                      Réponse requise
                    </span>
                  )}
                  {email.action_detected && (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertTriangle size={13} />
                      Action détectée
                    </span>
                  )}
                </div>

                {/* Bouton analyse IA */}
                {!email.is_analyzed ? (
                  <button onClick={() => analyzeEmail(email.id)}
                    disabled={analyzing === email.id}
                    className="flex items-center gap-1 text-xs bg-indigo-600/20
                               hover:bg-indigo-600/40 border border-indigo-600/30
                               text-indigo-300 px-3 py-1.5 rounded-lg transition-all
                               disabled:opacity-50">
                    <Zap size={12} className={analyzing === email.id ? 'animate-pulse' : ''} />
                    {analyzing === email.id ? 'Analyse...' : 'Analyser avec IA'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle size={12} />
                    Analysé par IA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}