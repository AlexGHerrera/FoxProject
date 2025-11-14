import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/spends',
      label: 'Gastos',
      icon: Receipt,
      isCentral: false,
    },
    {
      path: '/',
      label: 'Inicio',
      icon: Home,
      isCentral: true,
    },
    {
      path: '/settings',
      label: 'Ajustes',
      icon: Settings,
      isCentral: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border z-50">
      <div className="max-w-4xl mx-auto px-2 py-3">
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isCentral = item.isCentral;

            if (isCentral) {
              // Tab central destacado - cuadrado
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-16 h-16
                    rounded-2xl
                    transition-all duration-300 ease-out
                    ${active
                      ? 'bg-gradient-to-br from-brand-cyan to-brand-cyan-neon text-white shadow-lg shadow-brand-cyan/30'
                      : 'text-muted hover:text-text hover:bg-surface/50'
                    }
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2
                  `}
                  aria-label={item.label}
                >
                  <Icon 
                    size={24} 
                    className="mb-1 transition-all duration-300"
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-xs font-medium transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            // Tabs laterales - mismo tamaño de iconos
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center
                  min-h-[56px] min-w-[64px]
                  px-4 py-3 rounded-lg
                  transition-all duration-200
                  flex-1 max-w-[120px]
                  ${active
                    ? 'text-brand-cyan bg-brand-cyan/10'
                    : 'text-muted hover:text-text hover:bg-surface/50'
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2
                `}
                aria-label={item.label}
              >
                <Icon 
                  size={24} 
                  className="mb-1 transition-all duration-200"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

