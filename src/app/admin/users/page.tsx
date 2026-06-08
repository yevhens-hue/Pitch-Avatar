'use client'

import React, { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { Search, UserCog, Edit3, Check, X } from 'lucide-react'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', maxListenersWithAssignments: 100 },
  { id: 'u2', name: 'Acme Corp Admin', email: 'admin@acmecorp.com', maxListenersWithAssignments: 50 },
  { id: 'u3', name: 'Jane Smith', email: 'jane@smith.net', maxListenersWithAssignments: 10 },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [search, setSearch] = useState('')

  const handleEditClick = (user: typeof MOCK_USERS[0]) => {
    setEditingUserId(user.id)
    setEditValue(user.maxListenersWithAssignments.toString())
  }

  const handleSave = (userId: string) => {
    const newVal = parseInt(editValue, 10)
    if (!isNaN(newVal)) {
      setUsers(users.map(u => u.id === userId ? { ...u, maxListenersWithAssignments: newVal } : u))
    }
    setEditingUserId(null)
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: 12, color: '#4f46e5' }}>
            <UserCog size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Users Management</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage users and limits (Super Admin)</p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Max Listeners with Assignments</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    {editingUserId === user.id ? (
                      <input 
                        type="number" 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        style={{ width: 80, padding: '0.4rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    ) : (
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.maxListenersWithAssignments}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingUserId === user.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleSave(user.id)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '0.4rem', cursor: 'pointer' }}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingUserId(null)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '0.4rem', cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(user)}
                        style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <Edit3 size={14} /> Edit Limit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users found.</div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
