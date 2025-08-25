import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaShieldAlt, FaArrowLeft, FaUserPlus } from 'react-icons/fa';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState('voter');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.post(
        'http://localhost:5000/api/auth/register-admin',
        { tenantId, email, password, name, role },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setSuccess(`${role === 'voter' ? 'Voter' : 'Admin'} registered successfully!`);
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setTenantId('');
      setRole('voter');
      
      // Navigate back to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="btn-secondary mb-6 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-black mb-2 flex items-center">
            <FaUserPlus className="mr-4 text-purple-500" />
            <span className="text-white">Register New User</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Add new voters and administrators to your organization
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Role Selection */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaShieldAlt className="mr-3 text-purple-500" />
                User Role
              </h3>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="voter">Voter - Can participate in elections</option>
                <option value="admin">Admin - Can create and manage elections</option>
              </select>
            </div>

            {/* Personal Information */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="input-field pl-10 w-full"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="input-field pl-10 w-full"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-6">Security Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="input-field pl-10 w-full"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tenantId" className="block text-sm font-medium text-white mb-2">
                    Organization ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="text-gray-400" />
                    </div>
                    <input
                      id="tenantId"
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="e.g., stanford-university"
                      className="input-field pl-10 w-full"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Permissions */}
            <div className="glass p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">
                {role === 'voter' ? 'Voter Permissions' : 'Admin Permissions'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {role === 'voter' ? (
                  <>
                    <div className="flex items-center text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Register and login securely
                    </div>
                    <div className="flex items-center text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      View list of available elections
                    </div>
                    <div className="flex items-center text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Cast votes (once per election)
                    </div>
                    <div className="flex items-center text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      View public election results
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-purple-400">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Create private elections with candidates
                    </div>
                    <div className="flex items-center text-purple-400">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Add, edit, and manage voters
                    </div>
                    <div className="flex items-center text-purple-400">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Monitor voter turnout
                    </div>
                    <div className="flex items-center text-purple-400">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      View and download election results
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleGoBack}
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
                {loading ? 'Registering...' : `Register ${role === 'voter' ? 'Voter' : 'Admin'}`}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="glass-card p-6 rounded-2xl mt-8 border border-yellow-500/20">
          <div className="flex items-start">
            <FaShieldAlt className="text-yellow-500 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-2">Security Notice</h3>
              <p className="text-gray-300">
                All user registrations are secured with JWT authentication and multi-tenant isolation. 
                Voting records are backed by blockchain technology for transparency and immutability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}