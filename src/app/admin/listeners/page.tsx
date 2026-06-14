import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getListeners() {
  const { data, error } = await supabase
    .from('listeners')
    .select(`
      id, first_name, last_name, email, position, company, created_at,
      enrollments(id, status)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listeners:', error)
    return []
  }
  return data || []
}

export default async function AdminListenersPage() {
  const listeners = await getListeners()

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Admin Sidebar */}
      <div className="w-56 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 font-semibold text-sm text-gray-400 uppercase tracking-wider border-b">Admin Panel</div>
        <nav className="p-2 space-y-0.5 text-sm font-medium flex-1">
          <Link href="/admin/users" className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            👥 Users
          </Link>
          <Link href="/admin/listeners" className="flex items-center gap-2 w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-md font-semibold">
            🎧 Listeners
          </Link>
          <Link href="/admin/enrollments" className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            📋 Enrollments
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listeners</h1>
            <p className="text-sm text-gray-500 mt-0.5">{listeners.length} total listeners in the system</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Position / Company</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total Enrollments</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listeners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No listeners found</td>
                </tr>
              )}
              {listeners.map((l: any) => {
                const totalEnrollments = l.enrollments?.length ?? 0
                const activeEnrollments = l.enrollments?.filter((e: any) => e.status === 'Pending' || e.status === 'In Progress').length ?? 0
                const fullName = [l.first_name, l.last_name].filter(Boolean).join(' ') || '—'
                return (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{fullName}</td>
                    <td className="px-5 py-3.5 text-gray-500">{l.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {l.position && <span>{l.position}</span>}
                      {l.position && l.company && <span className="text-gray-400"> · </span>}
                      {l.company && <span className="text-gray-400">{l.company}</span>}
                      {!l.position && !l.company && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-700">{totalEnrollments}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {activeEnrollments > 0
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">{activeEnrollments} active</span>
                        : <span className="text-gray-300 text-xs">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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
