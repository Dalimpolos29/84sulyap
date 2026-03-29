'use client'

// Admin Panel - Only accessible to Officers and Super Admin
// User management, account creation, password resets

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext } from '@/contexts/ProfileContext'
import { Loader2, Users, UserPlus, Shield } from 'lucide-react'
import CreateUserModal from '@/components/admin/CreateUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import AnnouncementsTab from '@/components/admin/AnnouncementsTab'
import EventsTab from '@/components/admin/EventsTab'
import YearbookUpload from '@/components/admin/YearbookUpload'

export default function AdminPage() {
  const router = useRouter()
  const { profile, loading: profileLoading } = useProfileContext()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [resettingPassword, setResettingPassword] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'announcements' | 'events' | 'yearbook'>('users')

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

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleResetPassword = async (user: any) => {
    if (!confirm(`Reset password for ${user.first_name} ${user.last_name}?\n\nPassword will be reset to: upis1984\nUser will be required to change it on next login.`)) {
      return
    }

    setResettingPassword(user.id)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      alert('Password reset successfully!\n\nNew password: upis1984\nUser will be required to change it on next login.')
      loadUsers()
    } catch (error: any) {
      console.error('Reset password error:', error)
      alert('Error: ' + error.message)
    } finally {
      setResettingPassword(null)
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
      {/* Header with Tabs */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
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

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 font-serif font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-1 font-serif font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-1 font-serif font-medium transition-colors ${
              activeTab === 'events'
                ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('yearbook')}
            className={`pb-3 px-1 font-serif font-medium transition-colors ${
              activeTab === 'yearbook'
                ? 'text-[#7D1A1D] border-b-2 border-[#7D1A1D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Digital Sulyap
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Add User Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#7D1A1D] text-white px-4 py-2 rounded hover:bg-[#6a1518] transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Add User</span>
            </button>
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
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-[#7D1A1D] hover:text-[#6a1518] mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={resettingPassword === user.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resettingPassword === user.id ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Resetting...
                          </span>
                        ) : (
                          'Reset Password'
                        )}
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
        </>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && <AnnouncementsTab />}

      {/* Events Tab */}
      {activeTab === 'events' && <EventsTab />}

      {/* Yearbook Tab */}
      {activeTab === 'yearbook' && <YearbookUpload />}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadUsers() // Reload user list
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSuccess={() => {
          loadUsers() // Reload user list
        }}
        user={selectedUser}
      />
    </div>
  )
}
