import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaPlus, 
  FaUsers, 
  FaVoteYea, 
  FaChartLine,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaBuilding,
  FaEdit,
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserPlus,
  FaFileUpload
} from 'react-icons/fa';
import { electionsAPI, usersAPI, votesAPI } from '../services/api';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalElections: 0,
    totalVoters: 0,
    totalVotes: 0,
    liveElections: 0
  });
  
  // Election Creation Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', description: '' }],
    isPublic: false
  });

  // Voter Management
  const [showVoterForm, setShowVoterForm] = useState(false);
  const [newVoter, setNewVoter] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUserInfo(payload);
    } catch (err) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [electionsRes, votersRes] = await Promise.all([
        electionsAPI.getAll(),
        usersAPI.getVoters()
      ]);

      setElections(electionsRes.data);
      setVoters(votersRes.data);

      // Calculate stats
      const now = new Date();
      const liveElections = electionsRes.data.filter((e: any) => 
        new Date(e.startDate) <= now && new Date(e.endDate) >= now
      );

      // Get total votes across all elections
      let totalVotes = 0;
      for (const election of electionsRes.data) {
        try {
          const resultsRes = await electionsAPI.getResults(election._id);
          totalVotes += resultsRes.data.totalVotes || 0;
        } catch (err) {
          // Election may not have votes yet
        }
      }

      setStats({
        totalElections: electionsRes.data.length,
        totalVoters: votersRes.data.length,
        totalVotes,
        liveElections: liveElections.length
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await electionsAPI.create(newElection);
      setSuccess('Election created successfully!');
      setShowCreateForm(false);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '', description: '' }],
        isPublic: false
      });
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create election');
    }
  };

  const handleCreateVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoter.name || !newVoter.email || !newVoter.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await usersAPI.registerAdmin({
        tenantId: userInfo.tenantId,
        email: newVoter.email,
        password: newVoter.password,
        name: newVoter.name,
        role: 'voter'
      });
      setSuccess('Voter created successfully!');
      setShowVoterForm(false);
      setNewVoter({ name: '', email: '', password: '' });
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create voter');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getElectionStatus = (election: any) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'live';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-orange-500 bg-orange-500/20';
      case 'upcoming':
        return 'text-blue-500 bg-blue-500/20';
      case 'completed':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'elections', label: 'Elections', icon: FaVoteYea },
    { id: 'voters', label: 'Voters', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const renderOverview = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">
          Welcome back, <span className="text-purple-400">{userInfo?.name || 'Admin'}</span>! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Organization: <span className="text-white">{userInfo?.tenantId}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Elections", value: stats.totalElections, icon: FaCalendarAlt, color: "text-purple-500", bgColor: "bg-purple-500/10" },
          { title: "Live Elections", value: stats.liveElections, icon: FaClock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
          { title: "Registered Voters", value: stats.totalVoters, icon: FaUsers, color: "text-blue-500", bgColor: "bg-blue-500/10" },
          { title: "Total Votes", value: stats.totalVotes, icon: FaVoteYea, color: "text-green-500", bgColor: "bg-green-500/10" }
        ].map((stat, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                setActiveTab('elections');
                setShowCreateForm(true);
              }}
              className="w-full btn-primary flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Create New Election
            </button>
            <button
              onClick={() => {
                setActiveTab('voters');
                setShowVoterForm(true);
              }}
              className="w-full btn-secondary flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" />
              Add New Voter
            </button>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Recent Elections</h3>
          <div className="space-y-3">
            {elections.slice(0, 3).map((election: any) => (
              <div key={election._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{election.title}</p>
                  <p className="text-gray-400 text-sm">{getElectionStatus(election)}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(getElectionStatus(election))}`}>
                  {getElectionStatus(election).toUpperCase()}
                </span>
              </div>
            ))}
            {elections.length === 0 && (
              <p className="text-gray-400 text-center py-4">No elections created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Continue with other render functions...
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="glass border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:text-purple-400 mr-4 lg:hidden"
            >
              {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <div className="flex items-center">
              <FaBuilding className="text-purple-500 text-2xl mr-3" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 hidden sm:block">
              {userInfo?.email}
            </span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-white/10 transition-transform duration-300 ease-in-out`}>
          <div className="p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {/* Add other tab renders here */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}