import { useEffect, useState } from 'react'
import { getMessages } from '../../api/message.api'
import type { Message } from '../../types/index'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages()
        setMessages(res.data.data)
      } catch (error) {
        console.error('Failed to fetch messages', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchMessages()
  }, [])

  return (
    <div className="animate-[fadeIn_0.2s_ease-in-out]">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="mt-1 text-foreground-muted">
          Here you can see all the messages from the dropshippers.
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <p className="mt-4 text-foreground-muted">No messages yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full text-left text-sm text-foreground-secondary">
                <thead className="bg-[#151515] text-xs uppercase tracking-wide text-foreground-muted">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message._id}
                      className="border-t border-border transition hover:bg-[#1f1f1f]"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {message.name}
                      </td>
                      <td className="px-4 py-3">{message.subject}</td>
                      <td className="px-4 py-3">
                        {new Date(message.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(message)}
                          className="text-primary hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {selectedMessage.subject}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-foreground-muted hover:text-foreground"
              >
                &times;
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-foreground-muted">
                From: {selectedMessage.name} ({selectedMessage.email})
              </p>
              <p className="mt-1 text-sm text-foreground-muted">
                Date:{' '}
                {new Date(selectedMessage.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="mt-4 max-h-96 overflow-y-auto text-foreground">
              {selectedMessage.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessages
