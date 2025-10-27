import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/',
      label: 'Inicio',
      icon: '🏠',
    },
    {
      path: '/spends',
      label: 'Gastos',
      icon: '📊',
    },
    {
      path: '/settings',
      label: 'Ajustes',
      icon: '⚙️',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-4xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors flex-1 max-w-[120px] ${
                isActive(item.path)
                  ? 'text-brand-cyan bg-brand-cyan/10'
                  : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

