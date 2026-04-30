import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/explore': 'Explore',
  '/articles/scopus': 'My Papers - Scopus',
  '/articles/wos': 'My Papers - Web of Science',
  '/articles/googlescholar': 'My Papers - Google Scholar',
  '/articles/garuda': 'My Papers - Garuda',
  '/researches': 'Research',
  '/service': 'Community Service',
  '/admin/users': 'User Management',
};

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = pathname.startsWith('/explore/') ? 'Lecturer Profile' : ROUTE_TITLES[pathname] || 'ScholarStack';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <Link
        to="/profile"
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Open profile"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-bold">
          {getInitials(user?.name || 'U')}
        </div>
      </Link>
    </header>
  );
}
