'use client'

import { usePathname } from 'next/navigation'
import AnnouncementBar from './AnnouncementBar'

export default function LayoutTopBar({ messages }: { messages: string[] }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return (
    <div className="fixed top-0 w-full z-[70]">
      <AnnouncementBar messages={messages} />
    </div>
  )
}
