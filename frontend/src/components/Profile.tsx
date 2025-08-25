import { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaLock, 
  FaEnvelope,
  FaBuilding,
  FaShieldAlt,
  FaCalendarAlt,
  FaVoteYea,
  FaTrophy,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { usersAPI, votesAPI, electionsAPI } from '../services/api';

interface ProfileProps {
  userInfo: any;
}

export default function Profile({ userInfo }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    tenantId: '',
    role: ''
  });
  
  const [originalProfile, setOriginalProfile] = useState({});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalElections: 0,
    participationRate: 0,
    lastVoteDate: null
  });

  useEffect(() => {
    if (userInfo) {
      const profileData = {
        name: userInfo.name || '',
        email: userInfo.email || '',
        tenantId: userInfo.tenantId || '',
        role: userInfo.role || ''
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
      fetchUserStats();
    }
  }, [userInfo]);

  const fetchUserStats = async () => {
    try {
      const [votesRes, electionsRes] = await Promise.all([
        votesAPI.getMyVotes(),
        electionsAPI.getAll()
      ]);
      
      const votes = votesRes.data;
      const elections = electionsRes.data;
      
      const participationRate = elections.length > 0 
        ? ((votes.length / elections.length) * 100).toFixed(1)
        : 0;
      
      const lastVote = votes.length > 0 
        ? new Date(Math.max(...votes.map((v: any) => new Date(v.timestamp).getTime())))
        : null;
      
      setStats({
        totalVotes: votes.length,
        totalElections: elections.length,
        participationRate: parseFloat(participationRate.toString()),
        lastVoteDate: lastVote
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await usersAPI.updateProfile({
        name: profile.name,
        email: profile.email
      });
      
      setOriginalProfile(profile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await usersAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setSuccess('Password changed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'text-red-400 bg-red-500/20';
      case 'admin':
        return 'text-blue-400 bg-blue-500/20';
      case 'voter':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return <FaShieldAlt />;
      case 'voter':
        return <FaVoteYea />;
      default:
        return <FaUser />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center">
          <FaUser className="mr-4 text-purple-500" />
          <span className="text-white">My Profile</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your account settings and view your voting statistics
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FaUser className="mr-3 text-purple-500" />
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="btn-secondary flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl">
                    <FaUser className="mr-3 text-gray-400" />
                    <span className="text-white">{profile.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl">
                    <FaEnvelope className="mr-3 text-gray-400" />
                    <span className="text-white">{profile.email}</span>
                  </div>
                )}
              </div>

              {/* Tenant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Organization
                </label>
                <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl">
                  <FaBuilding className="mr-3 text-gray-400" />
                  <span className="text-white">{profile.tenantId}</span>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Role
                </label>
                <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl">
                  {getRoleIcon(profile.role)}
                  <span className={`ml-3 px-3 py-1 rounded-full text-sm font-bold ${getRoleColor(profile.role)}`}>
                    {profile.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex space-x-4 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Password Change */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FaLock className="mr-3 text-purple-500" />
                Security
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn-secondary flex items-center"
                >
                  <FaLock className="mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Password Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setError('');
                    }}
                    className="btn-secondary flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Keep your account secure by using a strong password and changing it regularly.
              </p>
            )}
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Voting Statistics */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaTrophy className="mr-3 text-yellow-500" />
              Voting Stats
            </h3>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-purple-400">{stats.totalVotes}</div>
                <div className="text-gray-400 text-sm">Total Votes Cast</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-blue-400">{stats.totalElections}</div>
                <div className="text-gray-400 text-sm">Elections Available</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-green-400">{stats.participationRate}%</div>
                <div className="text-gray-400 text-sm">Participation Rate</div>
              </div>
              
              {stats.lastVoteDate && (
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center text-orange-400 mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span className="text-sm">Last Vote</span>
                  </div>
                  <div className="text-white text-sm">
                    {stats.lastVoteDate.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-green-500" />
              Account Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account Type</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getRoleColor(profile.role)}`}>
                  {profile.role?.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Organization</span>
                <span className="text-white text-sm">{profile.tenantId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}