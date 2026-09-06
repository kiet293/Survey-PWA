import { useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './AppLayout'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        height: 'var(--bottom-nav-h)',
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path
        const Icon = item.icon

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0 12px',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2,
                  background: 'var(--gradient-primary)',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}

            {/* Icon container */}
            <div
              style={{
                width: 42,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                transition: 'all 0.25s ease',
              }}
            >
              <Icon
                size={20}
                color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>

            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                lineHeight: 1,
                transition: 'color 0.2s ease',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
