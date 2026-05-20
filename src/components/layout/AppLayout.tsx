import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-clinic-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
