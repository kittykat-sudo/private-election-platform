import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaCalendarAlt, FaHome, FaVoteYea, FaUsers, FaFire, FaChartLine } from 'react-icons/fa';
import LiveElections from '../components/LiveElections';
import History from '../components/History';
import Results from '../components/Results';
import Profile from '../components/Profile';
import Dashboard from '../components/Dashboard';

export default function VoterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
      } catch (err) {
        console.error('Error parsing token:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/voter-dashboard', active: location.pathname === '/voter-dashboard' },
    { icon: FaFire, label: 'Live Elections', path: '/voter-dashboard/live', active: location.pathname === '/voter-dashboard/live' },
    { icon: FaCalendarAlt, label: 'History', path: '/voter-dashboard/history', active: location.pathname === '/voter-dashboard/history' },
    { icon: FaChartLine, label: 'Results', path: '/voter-dashboard/results', active: location.pathname === '/voter-dashboard/results' },
    { icon: FaUser, label: 'Profile', path: '/voter-dashboard/profile', active: location.pathname === '/voter-dashboard/profile' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-16'
        } glass border-r border-white/10`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <FaVoteYea className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-white">EduVote</span>
            )}
          </div>
          {sidebarOpen && (
            <p className="text-sm text-gray-400 mt-1">Dashboard</p>
          )}
        </div>
        
        <nav className="mt-6 space-y-2 px-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                item.active 
                  ? 'bg-purple-500 text-white' 
                  : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <item.icon className="text-lg" />
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 transition-all duration-300 mt-8 text-red-400"
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="glass border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search elections..."
                className="input-field w-64"
              />
              
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-lg">
                {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard userInfo={userInfo} />} />
            <Route path="/live" element={<LiveElections />} />
            <Route path="/history" element={<History />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile userInfo={userInfo} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}