'use client'

// Admin Panel - Only accessible to Officers and Super Admin
// User management, account creation, password resets

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext } from '@/contexts/ProfileContext'
import { Loader2, Users, UserPlus, Shield } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { profile, loading: profileLoading } = useProfileContext()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  useEffect(() => {
    // Check if user is authorized (Officer or Super Admin)
    if (!profileLoading && profile) {
      const authorized = profile.role === 'Officer' || profile.role === 'Super Admin'
      setIsAuthorized(authorized)

      if (!authorized) {
        router.push('/')
      } else {
        loadUsers()
      }
    }
  }, [profile, profileLoading, router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-[#7D1A1D]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#7D1A1D] font-serif">
                Admin Panel
              </h1>
              <p className="text-gray-600 text-sm font-serif">
                Manage alumni accounts and permissions
              </p>
            </div>
          </div>
          <button
            onClick={() => {/* TODO: Open create user modal */}}
            className="flex items-center gap-2 bg-[#7D1A1D] text-white px-4 py-2 rounded hover:bg-[#6a1518] transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-serif">Total Members</p>
              <p className="text-2xl font-bold text-[#7D1A1D]">
                {users.filter(u => u.role === 'Alumni').length}
              </p>
            </div>
            <Users className="h-7 w-7 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-serif">Officers</p>
              <p className="text-2xl font-bold text-[#7D1A1D]">
                {users.filter(u => u.role === 'Officer').length}
              </p>
            </div>
            <Shield className="h-7 w-7 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-serif">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.account_status === 'Active').length}
              </p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-serif">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">
                {users.filter(u => u.account_status === 'Inactive').length}
              </p>
            </div>
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded shadow-sm p-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7D1A1D] font-serif"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#7D1A1D] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.username || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'Officer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.account_status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.account_status === 'Deceased' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#7D1A1D] hover:text-[#6a1518] mr-3">
                        Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-serif">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
