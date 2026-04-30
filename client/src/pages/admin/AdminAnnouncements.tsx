import { Megaphone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createAnnouncement, getAnnouncements, toggleAnnouncement } from '../../api/admin.api'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import type { Announcement } from '../../types/index'

type AnnouncementWithCreatedAt = Announcement & { createdAt?: string }

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementWithCreatedAt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', expiresAt: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const response = await getAnnouncements()
      const list = (response.data?.announcements ?? response.data ?? []) as AnnouncementWithCreatedAt[]
      setAnnouncements(Array.isArray(list) ? list : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchAnnouncements()
  }, [])

  const sortedAnnouncements = useMemo(
    () => [...announcements].sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [announcements],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await createAnnouncement({
        title: form.title,
        message: form.message,
        expiresAt: form.expiresAt || undefined,
      })
      toast.success('Announcement posted!')
      setForm({ title: '', message: '', expiresAt: '' })
      setIsFormOpen(false)
      await fetchAnnouncements()
    } catch {
      toast.error('Unable to post announcement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string) => {
    await toggleAnnouncement(id)
    await fetchAnnouncements()
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease] text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white"
        >
          New Announcement
        </button>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-6">
          <input
            required
            placeholder="Announcement title..."
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
          />
          <textarea
            required
            rows={4}
            placeholder="Write your message..."
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="mt-3 w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
          />
          <div className="mt-3">
            <p className="mb-1 text-xs text-zinc-500">Expires on (optional)</p>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              className="w-full rounded-lg border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Post Announcement
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <>
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
          </>
        ) : sortedAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Megaphone className="h-14 w-14 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No announcements yet</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <article
              key={announcement._id}
              className={`rounded-xl border p-5 ${
                announcement.isActive ? 'border-orange-500/30 bg-[#1a1a1a]' : 'border-zinc-800 bg-[#1a1a1a] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{announcement.title}</h3>
                  {announcement.expiresAt ? (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Expires {new Date(announcement.expiresAt).toLocaleDateString('en-IN')}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleToggle(announcement._id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    announcement.isActive ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {announcement.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{announcement.message}</p>
              <p className="mt-3 text-xs text-zinc-600">
                Posted {announcement.createdAt ? timeAgo(announcement.createdAt) : 'recently'}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminAnnouncements
