'use client'

import { useState } from 'react'
import { updateSeatsQuota } from '@/app/actions/enrollments'

const MOCK_USERS = [
  { id: '00000000-0000-0000-0000-000000000000', name: 'Svetlana', email: 'ssergey2@gmail.com', company: 'ROI4CIO', tariff: 'Enterprise', seats: 100, defaultExpiration: 14 },
  { id: '11111111-1111-1111-1111-111111111111', name: 'John Doe', email: 'john@example.com', company: 'Acme Corp', tariff: 'Basic', seats: 50, defaultExpiration: 14 },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [editingUser, setEditingUser] = useState<typeof MOCK_USERS[0] | null>(null)
  const [quota, setQuota] = useState(100)
  const [isSaving, setIsSaving] = useState(false)

  const [expiration, setExpiration] = useState(14)

  const handleEdit = (user: typeof MOCK_USERS[0]) => {
    setEditingUser(user)
    setQuota(user.seats)
    setExpiration(user.defaultExpiration)
  }

  const handleSave = async () => {
    if (!editingUser) return
    setIsSaving(true)
    try {
      await updateSeatsQuota(quota, editingUser.id)
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, seats: quota, defaultExpiration: expiration } : u))
      setEditingUser(null)
    } catch (e) {
      console.error(e)
      alert('Failed to update quota')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 font-semibold text-lg border-b">Admin Panel</div>
        <div className="p-2 space-y-1 text-sm font-medium">
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Companies</button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">All presentations</button>
          <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 rounded-md">Users</button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Resource hub</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Users</h1>
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 font-medium text-gray-500">Company</th>
                <th className="px-6 py-3 font-medium text-gray-500">Enrollments Quota</th>
                <th className="px-6 py-3 font-medium text-gray-500">Default Expiration</th>
                <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.company}</td>
                  <td className="px-6 py-4 font-semibold">{user.seats}</td>
                  <td className="px-6 py-4">{user.defaultExpiration} days</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Create / edit user</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input disabled value={editingUser.name} className="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                <input disabled value={editingUser.email} className="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">Enrollments Quota (Listeners Seats)</label>
                <input 
                  type="number" 
                  value={quota} 
                  onChange={e => setQuota(parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-blue-500 rounded-md px-3 py-2 text-gray-900 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1">Default Link Expiration (days)</label>
                <input 
                  type="number" 
                  value={expiration} 
                  onChange={e => setExpiration(parseInt(e.target.value) || 14)}
                  className="w-full border-2 border-blue-500 rounded-md px-3 py-2 text-gray-900 focus:outline-none" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
