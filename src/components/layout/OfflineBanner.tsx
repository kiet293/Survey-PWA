import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  return (
    <div className="offline-banner">
      <WifiOff size={14} />
      <span>Không có kết nối mạng — Dữ liệu sẽ được lưu offline</span>
    </div>
  )
}
