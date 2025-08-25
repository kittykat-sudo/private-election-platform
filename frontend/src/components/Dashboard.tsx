import { useEffect, useState } from 'react';
import { 
  FaCalendarAlt, 
  FaVoteYea, 
  FaChartLine, 
  FaClock, 
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaTrophy
} from 'react-icons/fa';
import { electionsAPI, votesAPI } from '../services/api';

interface DashboardProps {
  userInfo: any;
}

export default function Dashboard({ userInfo }: DashboardProps) {
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalElections: 0,
    liveElections: 0,
    votesCase: 0,
    upcomingElections: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [electionsRes, votesRes] = await Promise.all([
        electionsAPI.getAll(),
        votesAPI.getMyVotes()
      ]);

      const allElections = electionsRes.data;
      setElections(allElections);

      const votedIds = new Set(votesRes.data.map((vote: any) => vote.electionId));
      setVotedElections(votedIds);

      // Calculate stats
      const now = new Date();
      const live = allElections.filter((e: any) => 
        new Date(e.startDate) <= now && new Date(e.endDate) >= now
      );
      const upcoming = allElections.filter((e: any) => 
        new Date(e.startDate) > now
      );

      setStats({
        totalElections: allElections.length,
        liveElections: live.length,
        votesCase: votesRes.data.length,
        upcomingElections: upcoming.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election: any) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'live';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <FaClock className="text-orange-500" />;
      case 'upcoming':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">
          Welcome back, <span className="text-purple-400">{userInfo?.name || 'Voter'}</span>! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Your voting dashboard • Stay informed and make your voice heard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Elections",
            value: stats.totalElections,
            icon: FaCalendarAlt,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
          },
          {
            title: "Live Now",
            value: stats.liveElections,
            icon: FaClock,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10"
          },
          {
            title: "Votes Cast",
            value: stats.votesCase,
            icon: FaVoteYea,
            color: "text-green-500",
            bgColor: "bg-green-500/10"
          },
          {
            title: "Upcoming",
            value: stats.upcomingElections,
            icon: FaChartLine,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
          }
        ].map((stat, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Live Elections Preview */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaClock className="mr-3 text-orange-500" />
              Live Elections
            </h2>
            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
              {stats.liveElections} Active
            </span>
          </div>
          
          {elections
            .filter((e: any) => getElectionStatus(e) === 'live')
            .slice(0, 3)
            .map((election: any) => (
              <div key={election._id} className="glass p-4 rounded-xl mb-4 last:mb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">{election.title}</h4>
                    <p className="text-gray-400 text-sm">
                      Ends {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {votedElections.has(election._id) ? (
                      <span className="text-green-400 flex items-center">
                        <FaCheckCircle className="mr-1" />
                        Voted
                      </span>
                    ) : (
                      <span className="text-orange-400 flex items-center">
                        <FaClock className="mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          
          {stats.liveElections === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FaExclamationCircle className="text-4xl mx-auto mb-2" />
              <p>No live elections at the moment</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaTrophy className="mr-3 text-green-500" />
              Recent Activity
            </h2>
          </div>
          
          {elections
            .filter((e: any) => votedElections.has(e._id))
            .slice(0, 3)
            .map((election: any) => (
              <div key={election._id} className="glass p-4 rounded-xl mb-4 last:mb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">{election.title}</h4>
                    <p className="text-gray-400 text-sm">
                      Voted on {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <FaCheckCircle className="text-green-400 text-xl" />
                </div>
              </div>
            ))}
          
          {stats.votesCase === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FaVoteYea className="text-4xl mx-auto mb-2" />
              <p>No voting activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* All Elections Overview */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaCalendarAlt className="mr-3 text-purple-500" />
          All Elections
        </h2>
        
        {elections.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaCalendarAlt className="text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Elections Available</h3>
            <p>You don't have access to any elections yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {elections.map((election: any) => {
              const status = getElectionStatus(election);
              const hasVoted = votedElections.has(election._id);
              
              return (
                <div key={election._id} className="glass p-4 rounded-xl hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(status)}
                      <div>
                        <h4 className="text-lg font-bold text-white">{election.title}</h4>
                        <p className="text-gray-400 text-sm">{election.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <FaUsers className="mr-1" />
                            {election.candidates?.length || 0} candidates
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        status === 'live' 
                          ? 'bg-orange-500 text-white'
                          : status === 'upcoming'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                      
                      {hasVoted && (
                        <span className="text-green-400 flex items-center">
                          <FaCheckCircle className="mr-1" />
                          Voted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}