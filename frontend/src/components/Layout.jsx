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
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden' }}>

      {/* Sidebar fixe */}
      <aside style={{ width:'210px', minWidth:'210px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100vh' }}>

        {/* Logo */}
        <div style={{ padding:'18px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
          <img src="/logo_ispm.png" alt="ISPM" style={{ width:'30px', height:'30px', objectFit:'contain', flexShrink:0 }} />
          <div>
            <div style={{ fontSize:'13px', fontWeight:'700', color:'var(--text)', lineHeight:'1.2' }}>SmartMail AI</div>
            <div style={{ fontSize:'10px', color:'var(--text3)', letterSpacing:'0.04em' }}>ISPM · IGGLIA 5</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          <div style={{ fontSize:'10px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'6px 8px 4px', fontWeight:'600' }}>Navigation</div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
      <NavLink
  key={to}
  to={to}
  end={end}
  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
>
  <Icon size={15} />
  {label}
</NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border)' }}>
          <div style={{ padding:'8px 10px', background:'var(--bg)', borderRadius:'6px', border:'1px solid var(--border)', marginBottom:'6px' }}>
            <div style={{ fontSize:'10px', color:'var(--text3)', marginBottom:'2px' }}>Connecté</div>
            <div style={{ fontSize:'12px', color:'var(--text)', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout}
            style={{ display:'flex', alignItems:'center', gap:'7px', width:'100%', padding:'7px 10px', borderRadius:'6px', border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.borderColor='#fca5a5' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.borderColor='var(--border)' }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal — prend tout l'espace restant */}
      <main style={{ flex:1, overflowY:'auto', background:'var(--bg)', minWidth:0 }}>
        <Outlet />
      </main>
    </div>
  )
}