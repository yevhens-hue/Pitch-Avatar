'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2, Search, EyeOff, ChevronDown } from 'lucide-react'

const MOCK_USERS = [
  {
    id: '91',
    name: 'Svetlana Bulega',
    timeCreated: '12:50',
    dateCreated: '6/26/2021',
    email: 'ssergey2@gmail.com',
    hubspotEmail: '',
    company: 'ROI4CIO',
    companyRole: 'Member',
    tariff: 'Enterprise',
    seats: 10,
    language: 'English',
    regType: 'Unknown',
    removeAccess: false,
    password: 'password123',
  },
  {
    id: '95',
    name: 'Олег Пицик',
    timeCreated: '11:34',
    dateCreated: '6/28/2021',
    email: 'oleg.pitsyc@agiliway.com',
    hubspotEmail: '',
    company: 'ROI4CIO',
    companyRole: '',
    tariff: 'Enterprise',
    seats: 10,
    language: 'English',
    regType: 'Unknown',
    removeAccess: false,
    password: '',
  },
  {
    id: '96',
    name: 'Luna Chekh',
    timeCreated: '14:01',
    dateCreated: '6/28/2021',
    email: 'luna@gmail.com',
    hubspotEmail: '',
    company: 'ROI4CIO',
    companyRole: '',
    tariff: 'Enterprise',
    seats: 10,
    language: 'English',
    regType: 'Unknown',
    removeAccess: false,
    password: '',
  },
  {
    id: '98',
    name: 'Alex Kobets',
    timeCreated: '15:16',
    dateCreated: '7/9/2021',
    email: 'kobets@softprom.com',
    hubspotEmail: '',
    company: 'Softprom',
    companyRole: '',
    tariff: 'Enterprise',
    seats: 10,
    language: 'English',
    regType: 'Unknown',
    removeAccess: false,
    password: '',
  },
  {
    id: '113',
    name: 'Alina Ivashyna',
    timeCreated: '09:36',
    dateCreated: '7/20/2021',
    email: 'ivashyna@softprom.com',
    hubspotEmail: '',
    company: 'Softprom',
    companyRole: '',
    tariff: 'Enterprise',
    seats: 10,
    language: 'English',
    regType: 'Unknown',
    removeAccess: false,
    password: '',
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<typeof MOCK_USERS[0] | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<typeof MOCK_USERS[0]>>({})
  const [showPassword, setShowPassword] = useState(false)

  const handleEdit = (user: typeof MOCK_USERS[0]) => {
    setEditingUser(user)
    setFormData(user)
  }

  const handleCreate = () => {
    const newUser = {
      id: Math.random().toString().slice(2, 6),
      name: '',
      timeCreated: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      dateCreated: new Date().toLocaleDateString('en-US'),
      email: '',
      hubspotEmail: '',
      company: 'ROI4CIO',
      companyRole: '',
      tariff: 'Enterprise',
      seats: 10,
      language: 'English',
      regType: 'Unknown',
      removeAccess: false,
      password: '',
    }
    setEditingUser(newUser)
    setFormData(newUser)
  }

  const handleSave = () => {
    if (!formData.id) return
    setUsers(prev => {
      const exists = prev.find(u => u.id === formData.id)
      if (exists) {
        return prev.map(u => u.id === formData.id ? { ...u, ...formData } as typeof MOCK_USERS[0] : u)
      }
      return [formData as typeof MOCK_USERS[0], ...prev]
    })
    setEditingUser(null)
  }

  const handleDelete = () => {
    if (!formData.id) return
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== formData.id))
      setEditingUser(null)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const InputField = ({ label, value, onChange, type = "text", required = false, icon: IconComponent }: any) => (
    <div className="relative mb-4">
      <div className="absolute -top-2 left-2 px-1 bg-white text-[11px] text-blue-500 font-medium z-10">
        {label}{required && '*'}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {IconComponent && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <IconComponent size={18} />
        </button>
      )}
    </div>
  )

  const SelectField = ({ label, value, onChange, options, required = false }: any) => (
    <div className="relative mb-4">
      <div className="absolute -top-2 left-2 px-1 bg-white text-[11px] text-gray-400 font-medium z-10">
        {label}{required && '*'}
      </div>
      <div className="relative">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 appearance-none bg-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-[#f4f7fc] text-gray-900 font-sans w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b flex items-center px-6 justify-between shrink-0">
          <div className="flex gap-2">
            {editingUser ? (
              <>
                <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium uppercase tracking-wide">
                  Save
                </button>
                <button onClick={() => setEditingUser(null)} className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-1.5 rounded text-sm font-medium uppercase tracking-wide">
                  Close
                </button>
                <button onClick={handleDelete} className="bg-white border border-red-500 text-red-500 hover:bg-red-50 px-4 py-1.5 rounded text-sm font-medium uppercase tracking-wide">
                  Delete
                </button>
              </>
            ) : (
              <div className="w-64">
                {/* Search is positioned differently in the screenshot, it's above the buttons */}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
            <span className="text-sm font-medium text-gray-600">super-admin</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {editingUser ? (
            <div className="flex justify-center mt-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-[500px] p-8">
                <h2 className="text-xl font-medium text-gray-800 mb-8 text-center">Create / edit user</h2>
                
                <InputField 
                  label="Name" 
                  value={formData.name} 
                  onChange={(v: string) => setFormData({...formData, name: v})} 
                  required 
                />
                
                <InputField 
                  label="Email" 
                  value={formData.email} 
                  onChange={(v: string) => setFormData({...formData, email: v})} 
                  required 
                />
                
                <InputField 
                  label="HubSpot Email" 
                  value={formData.hubspotEmail} 
                  onChange={(v: string) => setFormData({...formData, hubspotEmail: v})} 
                />
                
                <InputField 
                  label="Password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password} 
                  onChange={(v: string) => setFormData({...formData, password: v})} 
                  required 
                  icon={showPassword ? EyeOff : Eye}
                />
                
                <SelectField 
                  label="Company" 
                  value={formData.company}
                  onChange={(v: string) => setFormData({...formData, company: v})}
                  options={['ROI4CIO', 'Softprom', 'Acme Corp']}
                  required
                />
                
                <InputField 
                  label="Company Role" 
                  value={formData.companyRole} 
                  onChange={(v: string) => setFormData({...formData, companyRole: v})} 
                />
                
                <SelectField 
                  label="Tariff" 
                  value={formData.tariff}
                  onChange={(v: string) => setFormData({...formData, tariff: v})}
                  options={['Enterprise', 'Basic', 'Pro']}
                />
                
                <div className="relative mb-4">
                  <div className="absolute -top-2 left-2 px-1 bg-white text-[11px] text-blue-500 font-medium z-10">
                    Listeners Seats
                  </div>
                  <input
                    type="number"
                    value={formData.seats || 0}
                    onChange={e => setFormData({...formData, seats: parseInt(e.target.value) || 0})}
                    className="w-full border-2 border-blue-400 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
                  />
                  <div className="absolute right-2 top-1.5 flex flex-col">
                    <button onClick={() => setFormData({...formData, seats: (formData.seats||0)+1})} className="text-gray-500 hover:text-gray-700">
                      <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <button onClick={() => setFormData({...formData, seats: Math.max(0, (formData.seats||0)-1)})} className="text-gray-500 hover:text-gray-700">
                      <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>

                <SelectField 
                  label="Language" 
                  value={formData.language}
                  onChange={(v: string) => setFormData({...formData, language: v})}
                  options={['English', 'Английский', 'Русский', 'Spanish']}
                />

                <div className="mt-6 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="removeAccess"
                    checked={formData.removeAccess || false}
                    onChange={(e) => setFormData({...formData, removeAccess: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="removeAccess" className="text-sm text-gray-600 cursor-pointer">
                    Remove access to Admin Panel
                  </label>
                </div>

              </div>
            </div>
          ) : (
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-6 flex flex-col gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="search" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCreate} className="bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium uppercase tracking-wide">
                    New User
                  </button>
                  <button className="bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium uppercase tracking-wide">
                    Export Paid Users
                  </button>
                </div>
              </div>

              <div className="bg-white rounded border overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f8f9fa] border-b">
                    <tr>
                      <th className="px-4 py-4 font-medium text-gray-600">id</th>
                      <th className="px-4 py-4 font-medium text-gray-600">user</th>
                      <th className="px-4 py-4 font-medium text-gray-600">Time created</th>
                      <th className="px-4 py-4 font-medium text-gray-600">Date created</th>
                      <th className="px-4 py-4 font-medium text-gray-600">Email</th>
                      <th className="px-4 py-4 font-medium text-gray-600">company</th>
                      <th className="px-4 py-4 font-medium text-gray-600">Reg type</th>
                      <th className="px-4 py-4 font-medium text-gray-600 text-center">actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr key={user.id} className={`${idx % 2 === 0 ? 'bg-[#f1f3f5]' : 'bg-white'} border-b last:border-0 hover:bg-gray-50`}>
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.timeCreated}</td>
                        <td className="px-4 py-3">{user.dateCreated}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.company}</td>
                        <td className="px-4 py-3">{user.regType}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3 text-blue-500">
                            <button className="hover:text-blue-700"><Eye size={18} /></button>
                            <button onClick={() => handleEdit(user)} className="hover:text-blue-700"><Pencil size={18} /></button>
                            <button 
                              onClick={() => {
                                setFormData(user);
                                handleDelete();
                              }} 
                              className="hover:text-blue-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination placeholder */}
                <div className="flex items-center justify-center gap-2 py-4 bg-white border-t">
                  <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">&lt;</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-[#007bff] text-white rounded-full">1</button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">2</button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">3</button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">4</button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">5</button>
                  <span className="text-gray-500">...</span>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">949</button>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">&gt;</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
