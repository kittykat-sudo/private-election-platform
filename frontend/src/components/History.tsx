import { useEffect, useState } from 'react';
import { 
  FaHistory, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaUsers,
  FaVoteYea,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { electionsAPI, votesAPI } from '../services/api';

export default function History() {
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectionsAndVotes();
  }, []);

  const fetchElectionsAndVotes = async () => {
    try {
      const [electionsRes, votesRes] = await Promise.all([
        electionsAPI.getAll(),
        votesAPI.getMyVotes()
      ]);

      setElections(electionsRes.data);
      const votedIds = new Set(votesRes.data.map((vote: any) => vote.electionId));
      setVotedElections(votedIds);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const filteredElections = elections.filter((election: any) => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'voted':
        return votedElections.has(election._id);
      case 'not-voted':
        return !votedElections.has(election._id);
      case 'completed':
        return getElectionStatus(election) === 'completed';
      case 'live':
        return getElectionStatus(election) === 'live';
      case 'upcoming':
        return getElectionStatus(election) === 'upcoming';
      default:
        return true;
    }
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <FaClock className="text-orange-500" />;
      case 'upcoming':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-gray-400" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getParticipationStatus = (election: any) => {
    const hasVoted = votedElections.has(election._id);
    const status = getElectionStatus(election);
    
    if (hasVoted) return { text: 'Participated', color: 'text-green-400', icon: FaCheckCircle };
    if (status === 'completed') return { text: 'Did not vote', color: 'text-red-400', icon: FaExclamationCircle };
    if (status === 'live') return { text: 'Pending vote', color: 'text-orange-400', icon: FaClock };
    return { text: 'Not started', color: 'text-gray-400', icon: FaCalendarAlt };
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center">
          <FaHistory className="mr-4 text-purple-500" />
          <span className="text-white">Election History</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Track your participation across all elections • {elections.length} total election{elections.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Elections</option>
              <option value="voted">Participated</option>
              <option value="not-voted">Not Participated</option>
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Filter Stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
          <span>Showing {filteredElections.length} of {elections.length} elections</span>
          <span>•</span>
          <span>{Array.from(votedElections).length} participated</span>
          <span>•</span>
          <span>{elections.filter((e: any) => getElectionStatus(e) === 'live').length} live</span>
        </div>
      </div>

      {/* Elections List */}
      {filteredElections.length === 0 ? (
        <div className="text-center py-20">
          <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchTerm || filter !== 'all' ? 'No matching elections' : 'No elections found'}
          </h3>
          <p className="text-gray-400">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have access to any elections yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredElections.map((election: any) => {
            const status = getElectionStatus(election);
            const participation = getParticipationStatus(election);
            
            return (
              <div
                key={election._id}
                className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-white mr-3">{election.title}</h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{election.description}</p>
                    
                    {/* Election Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <FaCalendarAlt className="mr-2" />
                        <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FaClock className="mr-2" />
                        <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FaUsers className="mr-2" />
                        <span>{election.candidates?.length || 0} candidates</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {/* Status Icon */}
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                    </div>
                    
                    {/* Participation Status */}
                    <div className={`flex items-center px-3 py-1 rounded-lg bg-white/5 ${participation.color}`}>
                      <participation.icon className="mr-2 text-sm" />
                      <span className="text-sm font-medium">{participation.text}</span>
                    </div>
                  </div>
                </div>

                {/* Candidates Preview */}
                {election.candidates && election.candidates.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Candidates:</h4>
                    <div className="flex flex-wrap gap-2">
                      {election.candidates.slice(0, 3).map((candidate: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/5 text-white text-sm rounded-lg"
                        >
                          {candidate.name}
                        </span>
                      ))}
                      {election.candidates.length > 3 && (
                        <span className="px-3 py-1 bg-white/5 text-gray-400 text-sm rounded-lg">
                          +{election.candidates.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action based on status */}
                {status === 'live' && !votedElections.has(election._id) && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-medium">⚡ Election is live - you can vote now!</span>
                      <button className="btn-primary flex items-center">
                        <FaVoteYea className="mr-2" />
                        Vote Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}