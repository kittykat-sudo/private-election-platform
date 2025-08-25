import { useEffect, useState } from 'react';
import { 
  FaTrophy, 
  FaChartBar, 
  FaDownload, 
  FaUsers, 
  FaVoteYea,
  FaPercentage,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa';
import { electionsAPI } from '../services/api';

export default function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await electionsAPI.getAll();
      // Filter to show only completed or public elections
      const viewableElections = response.data.filter((election: any) => {
        const now = new Date();
        const endDate = new Date(election.endDate);
        return endDate < now || election.isPublic;
      });
      setElections(viewableElections);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (electionId: string) => {
    setLoadingResults(true);
    try {
      const response = await electionsAPI.getResults(electionId);
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleElectionSelect = (election: any) => {
    setSelectedElection(election);
    fetchResults(election._id);
  };

  const downloadResults = (election: any) => {
    if (!results) return;

    const csvContent = [
      ['Candidate', 'Votes', 'Percentage'],
      ...Object.entries(results.results).map(([candidate, votes]: [string, any]) => [
        candidate,
        votes,
        getPercentage(votes, results.totalVotes)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election.title.replace(/\s+/g, '_')}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getWinner = (results: any) => {
    if (!results || Object.keys(results).length === 0) return null;
    return Object.entries(results).reduce((a: any, b: any) => 
      results[a[0]] > results[b[0]] ? a : b
    )[0];
  };

  const getTotalVotes = (results: any) => {
    if (!results) return 0;
    return Object.values(results).reduce((sum: number, votes: any) => sum + votes, 0);
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return '0%';
    return `${((votes / total) * 100).toFixed(1)}%`;
  };

  const getElectionStatus = (election: any) => {
    const now = new Date();
    const endDate = new Date(election.endDate);
    return endDate < now ? 'completed' : 'live';
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
          <FaTrophy className="mr-4 text-yellow-500" />
          <span className="text-white">Election Results</span>
        </h1>
        <p className="text-gray-400 text-lg">
          View results from completed elections • {elections.length} election{elections.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Elections List */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaCalendarAlt className="mr-3 text-purple-500" />
              Available Elections
            </h2>
            
            {elections.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaTrophy className="text-4xl mx-auto mb-2" />
                <p>No results available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {elections.map((election: any) => (
                  <div
                    key={election._id}
                    onClick={() => handleElectionSelect(election)}
                    className={`glass p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedElection?._id === election._id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{election.title}</h4>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        getElectionStatus(election) === 'completed'
                          ? 'bg-gray-600 text-white'
                          : 'bg-orange-500 text-white'
                      }`}>
                        {getElectionStatus(election).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{election.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      Ended {new Date(election.endDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {!selectedElection ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <FaEye className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Select an Election</h3>
              <p className="text-gray-400">Choose an election from the list to view its results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Election Header */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedElection.title}</h2>
                    <p className="text-gray-400">{selectedElection.description}</p>
                  </div>
                  <button
                    onClick={() => downloadResults(selectedElection)}
                    disabled={!results}
                    className="btn-secondary flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download CSV
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Election Period:</span>
                    <p className="text-white">
                      {new Date(selectedElection.startDate).toLocaleDateString()} - 
                      {new Date(selectedElection.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Candidates:</span>
                    <p className="text-white">{selectedElection.candidates?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Eligible Voters:</span>
                    <p className="text-white">{selectedElection.voters?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Results Content */}
              {loadingResults ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading results...</p>
                </div>
              ) : results ? (
                <>
                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-2xl text-center">
                      <FaVoteYea className="text-3xl text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{results.totalVotes}</p>
                      <p className="text-gray-400">Total Votes</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl text-center">
                      <FaUsers className="text-3xl text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{results.eligibleVoters}</p>
                      <p className="text-gray-400">Eligible Voters</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl text-center">
                      <FaPercentage className="text-3xl text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{results.turnout}%</p>
                      <p className="text-gray-400">Turnout Rate</p>
                    </div>
                  </div>

                  {/* Winner Announcement */}
                  {getWinner(results.results) && (
                    <div className="glass-card p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
                      <div className="flex items-center justify-center mb-4">
                        <FaTrophy className="text-4xl text-yellow-500 mr-4" />
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white">Winner</h3>
                          <p className="text-3xl font-black text-yellow-400">
                            {getWinner(results.results)}
                          </p>
                          <p className="text-gray-400">
                            {results.results[getWinner(results.results)]} votes 
                            ({getPercentage(results.results[getWinner(results.results)], results.totalVotes)})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Results */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <FaChartBar className="mr-3 text-purple-500" />
                      Detailed Results
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(results.results)
                        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
                        .map(([candidate, votes]: [string, any], index: number) => {
                          const percentage = getPercentage(votes, results.totalVotes);
                          const isWinner = candidate === getWinner(results.results);
                          
                          return (
                            <div
                              key={candidate}
                              className={`glass p-4 rounded-xl ${
                                isWinner ? 'border border-yellow-500/50 bg-yellow-500/10' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                                    index === 0 ? 'bg-yellow-500 text-black' :
                                    index === 1 ? 'bg-gray-400 text-black' :
                                    index === 2 ? 'bg-orange-600 text-white' :
                                    'bg-gray-600 text-white'
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <div>
                                    <h4 className="text-lg font-bold text-white">{candidate}</h4>
                                    {isWinner && (
                                      <span className="text-yellow-400 text-sm flex items-center">
                                        <FaTrophy className="mr-1" />
                                        Winner
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-white">{votes}</p>
                                  <p className="text-sm text-gray-400">{percentage}</p>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-1000 ${
                                    isWinner ? 'bg-yellow-500' : 'bg-purple-500'
                                  }`}
                                  style={{ 
                                    width: results.totalVotes > 0 ? `${(votes / results.totalVotes) * 100}%` : '0%' 
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 rounded-2xl text-center">
                  <FaChartBar className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Results Available</h3>
                  <p className="text-gray-400">Results are not yet available for this election</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}