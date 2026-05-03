import { Bell } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getNotifications, markAllRead } from '../../api/admin.api'
import type { Notification } from '../../types/index'

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await getNotifications()
      const list = (response.data?.notifications ?? response.data ?? []) as Notification[]
      setNotifications(Array.isArray(list) ? list : [])
    } catch {
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchNotifications()
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  const handleMarkAllRead = async () => {
    await markAllRead()
    await fetchNotifications()
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-foreground">
      <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
      <p className="mt-1 text-foreground-muted">Stay updated on your orders.</p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">{unreadCount} unread</p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl bg-surface-secondary" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <Bell className="h-16 w-16 text-zinc-600" />
          <p className="mt-4 text-foreground-muted">No notifications yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`flex gap-4 rounded-xl border p-4 ${
                notification.isRead
                  ? 'border-border bg-surface-secondary'
                  : 'border-primary/30 bg-primary/5'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  notification.isRead ? 'bg-surface-secondary text-zinc-600' : 'bg-primary/20 text-primary'
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{notification.title}</h3>
                <p className="mt-0.5 text-sm text-foreground-muted">{notification.message}</p>
                <p className="mt-2 text-xs text-zinc-600">{timeAgo(notification.createdAt)}</p>
              </div>

              {!notification.isRead ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
