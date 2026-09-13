import { useLocation } from 'react-router-dom'
import { Home, ClipboardList, History, BarChart2 } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useSurveyStore } from '../../store/surveyStore'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'
import { useEffect } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'

export const NAV_ITEMS = [
  { path: '/', label: 'Trang chủ', icon: Home },
  { path: '/survey', label: 'Khảo sát', icon: ClipboardList },
  { path: '/history', label: 'Lịch sử', icon: History },
  { path: '/dashboard', label: 'Thống kê', icon: BarChart2 },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isOnline = useOnlineStatus()
  const location = useLocation()
  const { loadSurveys, syncPendingSurveys } = useSurveyStore()

  // Hide bottom nav on survey form page (full-screen form)
  const hiddenNavPaths = ['/survey']
  const showNav = !hiddenNavPaths.some(p => location.pathname === p)

  useEffect(() => {
    loadSurveys()
  }, [loadSurveys])

  useEffect(() => {
    if (isOnline) {
      syncPendingSurveys().then(async (count) => {
        if (count > 0) {
          try {
            await LocalNotifications.requestPermissions()
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Date.now(),
                  title: 'Đồng bộ thành công',
                  body: `Đã đồng bộ ${count} báo cáo lên hệ thống.`,
                },
              ],
            })
          } catch (error) {
            console.error('Notification permission/schedule error:', error)
          }
        }
      })
    }
  }, [isOnline, syncPendingSurveys])

  return (
    <div className="app-layout">
      <AppHeader />
      {!isOnline && <OfflineBanner />}
      <main
        className={`page-content${showNav ? '' : ' page-content--no-nav'}`}
        style={{ paddingTop: !isOnline ? `calc(var(--header-height) + env(safe-area-inset-top) + 38px + var(--content-padding))` : undefined }}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
