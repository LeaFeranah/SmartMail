import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Mail, CheckSquare, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import useAuthStore from '../store/authStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/tasks', icon: CheckSquare, label: 'Tâches' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
      }}>

        {/* Logo ISPM + Titre */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <img src="/logo_ispm.png" alt="ISPM" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', letterSpacing: '0.05em' }}>
                SmartMail AI
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ISPM · IGGLIA 5
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 6px', marginBottom: '4px' }}>
            Navigation
          </div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '4px',
              marginBottom: '2px',
              fontSize: '13.5px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? 'var(--green)' : 'var(--text2)',
              background: isActive ? 'var(--green-muted)' : 'transparent',
              border: isActive ? '1px solid var(--green-border)' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Utilisateur */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            padding: '10px',
            background: 'var(--surface2)',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            marginBottom: '8px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
              Connecté
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text3)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444440'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={13} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}