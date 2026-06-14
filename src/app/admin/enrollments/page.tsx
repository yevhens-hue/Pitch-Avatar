import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  Pending:     'bg-yellow-50 text-yellow-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Completed:   'bg-green-50 text-green-700',
  Failed:      'bg-red-50 text-red-700',
}

async function getEnrollments() {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, title, status, target_type, created_at, start_date, expires_at,
      listeners(first_name, last_name, email),
      projects(title),
      groups(name)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching enrollments:', error)
    return []
  }
  return data || []
}

export default async function AdminEnrollmentsPage() {
  const enrollments = await getEnrollments()

  const counts = {
    total: enrollments.length,
    pending: enrollments.filter((e: any) => e.status === 'Pending').length,
    inProgress: enrollments.filter((e: any) => e.status === 'In Progress').length,
    completed: enrollments.filter((e: any) => e.status === 'Completed').length,
    failed: enrollments.filter((e: any) => e.status === 'Failed').length,
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Admin Sidebar */}
      <div className="w-56 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 font-semibold text-sm text-gray-400 uppercase tracking-wider border-b">Admin Panel</div>
        <nav className="p-2 space-y-0.5 text-sm font-medium flex-1">
          <Link href="/admin/users" className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            👥 Users
          </Link>
          <Link href="/admin/listeners" className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            🎧 Listeners
          </Link>
          <Link href="/admin/enrollments" className="flex items-center gap-2 w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-md font-semibold">
            📋 Enrollments
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
            <p className="text-sm text-gray-500 mt-0.5">All enrollments across all users</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
            { label: 'Pending', value: counts.pending, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'In Progress', value: counts.inProgress, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Completed', value: counts.completed, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Failed', value: counts.failed, color: 'bg-red-50 border-red-200 text-red-700' },
          ].map(card => (
            <div key={card.label} className={`rounded-lg border px-4 py-3 ${card.color}`}>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs font-medium mt-0.5 opacity-80">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Target</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Listener / Group</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Project</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Created</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No enrollments found</td>
                </tr>
              )}
              {enrollments.map((e: any) => {
                const listenerName = e.listeners
                  ? [e.listeners.first_name, e.listeners.last_name].filter(Boolean).join(' ') || e.listeners.email
                  : e.groups?.name || 'Anonymous'
                const statusStyle = STATUS_STYLES[e.status] || 'bg-gray-100 text-gray-600'

                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px] truncate">{e.title || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize text-xs">{e.target_type || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{listenerName}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[160px] truncate">{e.projects?.title || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                      {e.expires_at
                        ? <span className={new Date(e.expires_at) < new Date() ? 'text-red-400' : 'text-gray-400'}>
                            {new Date(e.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
