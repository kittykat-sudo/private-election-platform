import { useEffect, useState } from 'react';
import { FaFire, FaVoteYea, FaClock, FaUsers, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

export default function LiveElections() {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set());
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveElections();
    fetchVotedElections();
  }, []);

  const fetchLiveElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/elections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const liveElections = response.data.filter((election: any) => 
        election.status === 'live' || (
          new Date() >= new Date(election.startDate) && 
          new Date() <= new Date(election.endDate)
        )
      );
      setElections(liveElections);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotedElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/votes/my-votes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const votedIds = new Set(response.data.map((vote: any) => vote.electionId));
      setVotedElections(votedIds);
    } catch (err: any) {
      console.error('Failed to fetch voted elections:', err);
    }
  };

  const handleVote = async (electionId: string, candidate: string) => {
    if (votedElections.has(electionId)) {
      setError('You have already voted in this election');
      return;
    }

    setVotingLoading(electionId);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/votes', 
        { electionId, candidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Vote for ${candidate} submitted successfully!`);
      setVotedElections(prev => new Set([...prev, electionId]));
      await fetchLiveElections();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVotingLoading(null);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
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
          <FaFire className="mr-4 text-orange-500" />
          <span className="text-white">Live Elections</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Vote in active elections • {elections.length} live election{elections.length !== 1 ? 's' : ''}
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

      {/* Elections List */}
      {elections.length === 0 ? (
        <div className="text-center py-20">
          <FaExclamationTriangle className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Live Elections</h3>
          <p className="text-gray-400">There are currently no active elections you can participate in.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {elections.map((election: any) => (
            <div
              key={election._id}
              className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300"
            >
              {/* Election Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{election.title}</h3>
                  <p className="text-gray-300 mb-4">{election.description}</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center text-orange-400">
                      <FaClock className="mr-2" />
                      {getTimeRemaining(election.endDate)}
                    </div>
                    <div className="flex items-center text-blue-400">
                      <FaUsers className="mr-2" />
                      {election.voters?.length || 0} eligible voters
                    </div>
                  </div>
                </div>
                
                {votedElections.has(election._id) && (
                  <div className="flex items-center text-green-400 bg-green-500/20 px-4 py-2 rounded-lg">
                    <FaCheckCircle className="mr-2" />
                    Vote Cast
                  </div>
                )}
              </div>

              {/* Candidates */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-4">Candidates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {election.candidates.map((candidate: any, index: number) => (
                    <div
                      key={index}
                      className={`glass p-4 rounded-xl border transition-all duration-300 ${
                        votedElections.has(election._id)
                          ? 'border-gray-600 opacity-60'
                          : 'border-white/20 hover:border-purple-500/50 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!votedElections.has(election._id) && votingLoading !== election._id) {
                          handleVote(election._id, candidate.name);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg font-bold text-white mb-1">{candidate.name}</h5>
                          {candidate.description && (
                            <p className="text-gray-400 text-sm">{candidate.description}</p>
                          )}
                        </div>
                        
                        {!votedElections.has(election._id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(election._id, candidate.name);
                            }}
                            disabled={votingLoading === election._id}
                            className="btn-primary flex items-center"
                          >
                            {votingLoading === election._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <FaVoteYea className="mr-2" />
                            )}
                            Vote
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Election Info */}
              <div className="border-t border-white/10 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <p className="text-white">{new Date(election.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span>
                    <p className="text-white">{new Date(election.endDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}