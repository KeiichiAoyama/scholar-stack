import { createElement, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Award, LayoutDashboard, Search, User, Users, ChevronDown, ChevronRight, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MY_PAPERS_CHILDREN = [
  { label: 'Publications Scopus', path: '/articles/scopus' },
  { label: 'Publications Google', path: '/articles/googlescholar' },
  { label: 'Research', path: '/researches' },
  { label: 'Com. Service', path: '/service' },
];

const TOP_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Explore', icon: Search, path: '/explore' },
];

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myPapersOpen, setMyPapersOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkBase = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors';
  const activeClass = 'bg-white/10 text-secondary font-medium';
  const inactiveClass = 'text-white/80 hover:bg-white/10 hover:text-white';

  return (
    <aside className="w-64 h-screen bg-primary flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookOpen className="text-secondary" size={22} />
          <span className="text-white font-bold text-lg tracking-wide">ScholarStack</span>
        </div>
        <p className="text-white/50 text-xs mt-0.5">UMN Research Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {TOP_NAV.map(({ label, icon, path }) => (
          path === '#' ? (
            <button key={label} className={`${linkBase} ${inactiveClass} w-full cursor-not-allowed opacity-60`}>
              {createElement(icon, { size: 18 })}
              <span>{label}</span>
            </button>
          ) : (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              {createElement(icon, { size: 18 })}
              <span>{label}</span>
            </NavLink>
          )
        ))}

        {user?.role !== 'Admin' && (
          <div>
            <button
              onClick={() => setMyPapersOpen((o) => !o)}
              className={`${linkBase} ${inactiveClass} w-full justify-between`}
            >
              <span className="flex items-center gap-3">
                <User size={18} />
                My Papers
              </span>
              {myPapersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
            {myPapersOpen && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                {MY_PAPERS_CHILDREN.map(({ label, path }) => (
                  path === '#' ? (
                    <button key={label} className="block w-full text-left px-3 py-2 text-xs text-white/50 cursor-not-allowed rounded">
                      {label}
                    </button>
                  ) : (
                    <NavLink
                      key={label}
                      to={path}
                      className={({ isActive }) =>
                        `block px-3 py-2 text-xs rounded transition-colors ${isActive ? 'text-secondary bg-white/10 font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`
                      }
                    >
                      {label}
                    </NavLink>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin-only: User Management */}
        {user?.role === 'Admin' && (
          <>
            <NavLink
              to="/admin/grants"
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Award size={18} />
              <span>Master Grants</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/50 text-xs">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
