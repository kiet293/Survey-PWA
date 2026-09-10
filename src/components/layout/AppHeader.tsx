import { useNavigate } from 'react-router-dom'
import { LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useSurveyStore } from '../../store/surveyStore'

interface AppHeaderProps {}

export default function AppHeader(_props: AppHeaderProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const isOnline = useOnlineStatus()
  const pendingCount = useSurveyStore((s) => s.pendingCount)

  const handleLogout = () => {
    if (confirm('Bạn có muốn đăng xuất không?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10, 22, 40, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: 'calc(var(--header-height) + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--content-padding)',
          height: '100%',
        }}
      >
        {/* Logo + Title */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              color: 'white',
              letterSpacing: '-1px',
              boxShadow: '0 2px 12px rgba(37,99,235,0.4)',
            }}
          >
            VKU
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              VKU Survey
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Cơ sở vật chất
            </div>
          </div>
        </button>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Pending sync badge */}
          {pendingCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-warning)',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={10} />
              {pendingCount}
            </div>
          )}

          {/* Online status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              background: isOnline ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${isOnline ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
            }}
          >
            {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn--ghost btn--icon"
            title="Đăng xuất"
            style={{ width: 36, height: 36, padding: 0 }}
          >
            <LogOut size={16} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </header>
  )
}
