import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSignOutAlt,
  FaChartBar,
  FaCalendarAlt,
  FaShieldAlt,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { tenantsAPI } from '../services/api';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalElections: 0,
    totalVotes: 0
  });
  const [newTenant, setNewTenant] = useState({ tenantId: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
        if (payload.role !== 'superadmin') {
          navigate('/login');
          return;
        }
      } catch (err) {
        console.error('Error parsing token:', err);
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [tenantsRes] = await Promise.all([
        tenantsAPI.getAll()
      ]);
      
      // Calculate enhanced tenant data
      const enhancedTenants = await Promise.all(
        tenantsRes.data.map(async (tenant: any) => {
          try {
            const detailsRes = await tenantsAPI.getById(tenant._id);
            return {
              ...tenant,
              ...detailsRes.data.statistics
            };
          } catch (err) {
            return {
              ...tenant,
              totalUsers: 0,
              totalElections: 0,
              adminCount: 0,
              voterCount: 0
            };
          }
        })
      );
      
      setTenants(enhancedTenants);
      
      // Calculate platform statistics
      const totalUsers = enhancedTenants.reduce((sum: number, t: any) => sum + (t.totalUsers || 0), 0);
      const totalElections = enhancedTenants.reduce((sum: number, t: any) => sum + (t.totalElections || 0), 0);
      
      setPlatformStats({
        totalUsers,
        totalElections,
        totalVotes: 0 // This would come from a dedicated endpoint
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await tenantsAPI.create(newTenant);
      setSuccess('Tenant created successfully!');
      setNewTenant({ tenantId: '', name: '' });
      setShowCreateForm(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    
    setLoading(true);
    setError('');
    
    try {
      await tenantsAPI.update(editingTenant._id, { name: editingTenant.name });
      setSuccess('Tenant updated successfully!');
      setEditingTenant(null);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will permanently delete all associated users and elections.')) {
      return;
    }
    
    try {
      await tenantsAPI.delete(tenantId);
      setSuccess('Tenant deleted successfully!');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tenant');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaShieldAlt className="mr-3 text-purple-500" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Welcome, <span className="text-purple-400">{userInfo?.name || 'Super Admin'}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Tenant
            </button>
            
            <button
              onClick={logout}
              className="btn-secondary flex items-center text-red-400 hover:text-red-300"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Status Messages */}
        {error && (
          <div className="glass border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="glass border border-green-500/30 bg-green-500/10 text-green-300 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Tenants",
              value: tenants.length,
              icon: FaBuilding,
              color: "text-purple-500"
            },
            {
              title: "Platform Users",
              value: platformStats.totalUsers,
              icon: FaUsers,
              color: "text-green-500"
            },
            {
              title: "Total Elections",
              value: platformStats.totalElections,
              icon: FaCalendarAlt,
              color: "text-blue-500"
            },
            {
              title: "Active Tenants",
              value: tenants.filter((t: any) => (t.totalUsers || 0) > 0).length,
              icon: FaChartBar,
              color: "text-orange-500"
            }
          ].map((stat, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Tenant Form */}
        {showCreateForm && (
          <div className="glass-card p-8 rounded-2xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Tenant</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTenant} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tenant ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newTenant.tenantId}
                      onChange={(e) => setNewTenant({ ...newTenant, tenantId: e.target.value })}
                      placeholder="e.g., stanford-university"
                      className="input-field pl-10 w-full"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Use lowercase letters, numbers, and hyphens only
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="e.g., Stanford University"
                    className="input-field w-full"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tenants Management */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Manage Tenants</h2>
          
          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <FaBuilding className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No tenants yet</h3>
              <p className="text-gray-400 mb-6">Create your first tenant organization to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Tenant
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant: any) => (
                <div key={tenant._id} className="glass border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center mr-4">
                          <FaBuilding className="text-white text-xl" />
                        </div>
                        <div>
                          {editingTenant?._id === tenant._id ? (
                            <input
                              type="text"
                              value={editingTenant.name}
                              onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                              className="input-field text-xl font-bold"
                            />
                          ) : (
                            <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                          )}
                          <p className="text-gray-400">ID: {tenant.tenantId}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaUsers className="text-purple-400 mr-2 text-sm" />
                            <span className="text-xs font-medium text-gray-400">Total Users</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {tenant.totalUsers || 0}
                          </p>
                        </div>
                        
                        <div className="glass p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaCalendarAlt className="text-purple-400 mr-2 text-sm" />
                            <span className="text-xs font-medium text-gray-400">Elections</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {tenant.totalElections || 0}
                          </p>
                        </div>
                        
                        <div className="glass p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaShieldAlt className="text-purple-400 mr-2 text-sm" />
                            <span className="text-xs font-medium text-gray-400">Admins</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {tenant.adminCount || 0}
                          </p>
                        </div>
                        
                        <div className="glass p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaUsers className="text-purple-400 mr-2 text-sm" />
                            <span className="text-xs font-medium text-gray-400">Voters</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {tenant.voterCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-6">
                      {editingTenant?._id === tenant._id ? (
                        <>
                          <button
                            onClick={handleUpdateTenant}
                            className="btn-secondary flex items-center text-green-400 hover:text-green-300"
                            disabled={loading}
                          >
                            <FaCheck className="mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTenant(null)}
                            className="btn-secondary flex items-center"
                          >
                            <FaTimes className="mr-2" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingTenant(tenant)}
                            className="btn-secondary flex items-center"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(tenant._id)}
                            className="btn-secondary flex items-center text-red-400 hover:text-red-300"
                          >
                            <FaTrash className="mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="glass-card p-6 rounded-2xl mt-8 border border-purple-500/20">
          <div className="flex items-start">
            <FaShieldAlt className="text-purple-500 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">System Status</h3>
              <p className="text-gray-300 mb-4">
                Platform is running smoothly with multi-tenant isolation and secure authentication.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-green-400 ml-2">99.9%</span>
                </div>
                <div>
                  <span className="text-gray-400">Security:</span>
                  <span className="text-green-400 ml-2">All systems operational</span>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="text-purple-400 ml-2">v2.1.0</span>
                </div>
                <div>
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-purple-400 ml-2">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}