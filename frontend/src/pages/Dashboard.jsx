import { useEffect, useState, useRef } from 'react';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import {
  getDashboard,
  getGlobalMessages,
  sendGlobalMessage,
  getPolls,
  createPoll,
  voteInPoll,
  closePoll,
  sendMessage // for sending private message inside profile popup
} from '../services/tournamentService';
import { money, when } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  // Global Chat States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);

  // Polls States
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollSubmitting, setPollSubmitting] = useState(false);

  // Profile Preview States
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [directMsg, setDirectMsg] = useState('');
  const [directMsgSending, setDirectMsgSending] = useState(false);
  const [directMsgAlert, setDirectMsgAlert] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'CONTROLLER' || user?.role === 'MASTER_CONTROLLER';

  // Fetch Dashboard details
  const fetchDashboardData = async () => {
    try {
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err) {
      setDbError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setDbLoading(false);
    }
  };

  // Fetch Chat messages
  const fetchChatMessages = async () => {
    try {
      const msgs = await getGlobalMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  // Fetch Polls
  const fetchPollData = async () => {
    try {
      const activePolls = await getPolls();
      setPolls(activePolls);
    } catch (err) {
      console.error('Failed to load polls:', err);
    }
  };

  // Load everything on mount
  useEffect(() => {
    fetchDashboardData();
    fetchChatMessages();
    fetchPollData();

    // Setup periodic polling for real-time feel (every 8 seconds)
    const interval = setInterval(() => {
      fetchChatMessages();
      fetchPollData();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatSending) return;

    setChatSending(true);
    try {
      await sendGlobalMessage(newMessage.trim());
      setNewMessage('');
      fetchChatMessages();
    } catch (err) {
      console.error('Failed to send global message:', err);
    } finally {
      setChatSending(false);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const filteredOptions = pollOptions.filter(o => o.trim() !== '');
    if (!pollQuestion.trim() || filteredOptions.length < 2) {
      alert('Please fill out the question and at least 2 options.');
      return;
    }

    setPollSubmitting(true);
    try {
      await createPoll({
        question: pollQuestion.trim(),
        options: filteredOptions
      });
      setShowCreatePoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      fetchPollData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create poll');
    } finally {
      setPollSubmitting(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await voteInPoll(pollId, optionId);
      fetchPollData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to vote');
    }
  };

  const handleClosePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to close this poll?')) return;
    try {
      await closePoll(pollId);
      fetchPollData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to close poll');
    }
  };

  // Profile Modal message handling (WhatsApp max 10 words style)
  const handleDirectMsgChange = (e) => {
    const text = e.target.value;
    setDirectMsg(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
  };

  const handleSendDirectMessage = async () => {
    if (!selectedPlayer || !directMsg.trim()) return;
    if (wordCount > 10) {
      setDirectMsgAlert('Message must be 10 words or less');
      return;
    }

    setDirectMsgSending(true);
    try {
      await sendMessage({
        recipientId: selectedPlayer.userId,
        content: directMsg.trim()
      });
      setDirectMsgAlert('Message sent successfully!');
      setDirectMsg('');
      setWordCount(0);
      setTimeout(() => {
        setSelectedPlayer(null);
        setDirectMsgAlert('');
      }, 1500);
    } catch (err) {
      setDirectMsgAlert(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setDirectMsgSending(false);
    }
  };

  const addOptionField = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removeOptionField = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  if (dbLoading) return <div className="screen-center">Loading dashboard...</div>;
  if (dbError) return <Alert type="error">{dbError}</Alert>;

  const requestUpdates = Array.isArray(dashboardData.requestUpdates) ? dashboardData.requestUpdates : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_24rem] items-start">
      {/* LEFT COLUMN: Wallet stats and standard features */}
      <div className="space-y-5">
        <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
          <p className="text-sm font-bold text-gold">Player Dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Ready for the next room?</h1>
          <p className="mt-2 text-sm text-secondary">Your wallet, qualification, and updates stay compact here.</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Wallet Balance" value={money(dashboardData.wallet.walletBalance)} accent />
          <StatCard label="Winning Points" value={money(dashboardData.wallet.winningPoints)} />
          <StatCard label="Qualification" value={dashboardData.qualificationStatus} />
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="panel">
            <h2 className="font-black">Last Wallet Activity</h2>
            <div className="mt-3 space-y-2">
              {dashboardData.lastTransactions.map((tx) => (
                <p key={tx.id} className="rounded bg-arena p-2 text-sm">
                  {tx.note} <b>{money(tx.amount)}</b>
                </p>
              ))}
              {!dashboardData.lastTransactions.length && <p className="text-sm text-secondary">No wallet activity yet.</p>}
            </div>
          </div>
          <div className="panel">
            <h2 className="font-black">Tournament Updates</h2>
            <div className="mt-3 space-y-2">
              {dashboardData.updates.map((item) => (
                <p key={item.id} className="text-sm text-slate-300">
                  <b className="text-white">{item.title}</b> {item.message}
                </p>
              ))}
              {!dashboardData.updates.length && <p className="text-sm text-secondary">No tournament updates yet.</p>}
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="font-black">Request Updates</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {requestUpdates.map((item) => (
              <div className="rounded-xl border border-white/10 bg-arena p-3 text-sm" key={`${item.type}-${item.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{item.type} {money(item.amount)}</b>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    item.status === 'REJECTED' ? 'bg-red-500/15 text-red-200' :
                    item.status === 'APPROVED' || item.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-200' :
                    'bg-primary/15 text-purple-200'
                  }`}>{item.status}</span>
                </div>
                <p className="mt-2 text-secondary">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{item.reference} - {when(item.createdAt)}</p>
              </div>
            ))}
            {!requestUpdates.length && <p className="text-sm text-secondary">No deposit or withdrawal updates yet.</p>}
          </div>
        </section>

        {dashboardData.qualificationStatus === 'Q' && <button className="btn-primary w-full sm:w-auto">Apply for Tournament</button>}
      </div>

      {/* RIGHT COLUMN: Community Chat Lobby & Polls */}
      <div className="space-y-5">
        
        {/* POLLS SECTION */}
        <div className="panel border border-white/10 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-white flex items-center gap-2">
              <span className="text-gold">🗳️</span> Community Polls
            </h2>
            {isStaff && (
              <button 
                onClick={() => setShowCreatePoll(true)}
                className="btn-primary py-1 px-3 text-xs font-bold"
              >
                + Create Poll
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votesCount, 0);
              const userVoted = poll.userVotedOptionId !== null;

              return (
                <div key={poll.id} className="rounded-xl border border-white/5 bg-arena p-3 space-y-2 relative">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-white leading-tight">{poll.question}</p>
                    {isStaff && (
                      <button 
                        onClick={() => handleClosePoll(poll.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-bold ml-auto"
                        title="Close Poll"
                      >
                        Close
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    {poll.options.map((opt) => {
                      const percentage = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                      const isVotedOption = poll.userVotedOptionId === opt.id;

                      return (
                        <div key={opt.id} className="relative">
                          {userVoted ? (
                            <div className="w-full flex items-center justify-between text-xs rounded-lg border border-white/10 p-2.5 overflow-hidden">
                              {/* Background progress indicator */}
                              <div 
                                className={`absolute left-0 top-0 bottom-0 transition-all ${
                                  isVotedOption ? 'bg-emerald-500/20' : 'bg-white/5'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="relative font-bold text-slate-200 truncate pr-2">
                                {opt.optionText} {isVotedOption && ' (Voted)'}
                              </span>
                              <span className="relative font-black text-white">{percentage}% ({opt.votesCount})</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleVote(poll.id, opt.id)}
                              className="w-full text-left text-xs rounded-lg border border-white/10 bg-white/5 p-2.5 font-semibold text-slate-300 hover:bg-white/10 hover:border-primary transition-all duration-150"
                            >
                              {opt.optionText}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>By: {poll.createdByUsername}</span>
                    <span>{totalVotes} total votes</span>
                  </div>
                </div>
              );
            })}

            {polls.length === 0 && (
              <p className="text-xs text-secondary text-center py-2">No active polls running.</p>
            )}
          </div>
        </div>

        {/* COMMUNITY CHAT LOBBY */}
        <div className="panel border border-white/10 bg-card flex flex-col h-[520px]">
          <h2 className="font-black text-white pb-3 border-b border-white/10 flex items-center gap-2">
            <span className="text-emerald-500">💬</span> Global Community Lobby
          </h2>

          {/* Chat Messages Area (WhatsApp-Style) */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isSenderStaff = msg.senderStatus === 'STAFF' || msg.senderStatus === 'ADMIN' || msg.senderStatus === 'CONTROLLER' || msg.senderStatus === 'MASTER_CONTROLLER';

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm border relative shadow-md ${
                      isMe 
                        ? 'bg-emerald-500/15 border-emerald-500/20 text-white rounded-tr-none' 
                        : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Sender Username */}
                    {!isMe && (
                      <button
                        onClick={() => setSelectedPlayer({
                          userId: msg.senderId,
                          username: msg.senderUsername,
                          gameUid: msg.senderGameUid,
                          profileScreenshotUrl: msg.senderProfileScreenshotUrl,
                          winningPoints: msg.senderWinningPoints,
                          status: msg.senderStatus
                        })}
                        className="text-xs font-black block text-gold hover:underline text-left pb-1 mb-0.5"
                      >
                        {msg.senderUsername}
                        {msg.senderGameUid && (
                          <span className="font-normal text-secondary text-[10px] ml-1.5">
                            (UID: {msg.senderGameUid})
                          </span>
                        )}
                      </button>
                    )}

                    <p className="leading-relaxed break-words">{msg.content}</p>

                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] text-slate-500">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <span className="text-emerald-500 font-bold">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} className="border-t border-white/10 pt-3 flex gap-2">
            <input
              type="text"
              placeholder="Send message to lobby..."
              className="input flex-1 text-sm bg-arena border-white/10"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={1000}
              disabled={chatSending}
            />
            <button
              type="submit"
              className="btn-primary py-2 px-4 font-bold text-sm"
              disabled={chatSending || !newMessage.trim()}
            >
              {chatSending ? '...' : 'Send'}
            </button>
          </form>
        </div>

      </div>

      {/* CREATE POLL MODAL */}
      {showCreatePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <form 
            onSubmit={handleCreatePoll}
            className="panel w-full max-w-md space-y-5 bg-gradient-to-b from-card to-bg border border-white/10 shadow-2xl relative my-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Create Community Poll</h2>
              <button
                type="button"
                className="text-secondary hover:text-white transition-colors text-xl p-1"
                onClick={() => setShowCreatePoll(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gold uppercase block">Poll Question</label>
              <input
                type="text"
                placeholder="What is your question?"
                className="input text-sm"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gold uppercase block flex justify-between items-center">
                <span>Options</span>
                <button
                  type="button"
                  onClick={addOptionField}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  + Add Option
                </button>
              </label>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {pollOptions.map((opt, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className="input text-sm flex-1"
                      value={opt}
                      onChange={(e) => {
                        const nextOptions = [...pollOptions];
                        nextOptions[index] = e.target.value;
                        setPollOptions(nextOptions);
                      }}
                      required={index < 2}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(index)}
                        className="text-red-400 hover:text-red-300 font-bold p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary flex-1 py-2 font-bold text-sm"
                disabled={pollSubmitting}
              >
                {pollSubmitting ? 'Creating...' : 'Create Poll'}
              </button>
              <button
                type="button"
                className="btn-ghost flex-1 py-2 font-bold text-sm"
                onClick={() => setShowCreatePoll(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PLAYER PROFILE PREVIEW MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <div className="panel w-full max-w-lg space-y-5 bg-gradient-to-b from-card to-bg border border-white/10 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Player Profile</h2>
              <button
                className="text-secondary hover:text-white transition-colors text-2xl p-1"
                aria-label="Close profile details"
                onClick={() => {
                  setSelectedPlayer(null);
                  setDirectMsg('');
                  setWordCount(0);
                  setDirectMsgAlert('');
                }}
              >
                ✕
              </button>
            </div>

            {selectedPlayer.profileScreenshotUrl ? (
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex justify-center items-center">
                <img
                  src={selectedPlayer.profileScreenshotUrl}
                  alt={selectedPlayer.username}
                  className="max-h-72 w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-secondary">
                No screenshot uploaded
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Username</span>
                <span className="font-bold text-white text-base truncate block">{selectedPlayer.username}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Gaming UID</span>
                <span className="font-bold text-white text-base truncate block">{selectedPlayer.gameUid || 'Not set'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Winning Points</span>
                <span className="font-bold text-gold text-base block">{selectedPlayer.winningPoints ?? 0}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Status</span>
                <span className="inline-flex items-center gap-1.5 font-bold mt-1 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    selectedPlayer.status === 'ACTIVE' ? 'bg-green-500' :
                    selectedPlayer.status === 'RECENT' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  {selectedPlayer.status === 'ACTIVE' ? 'Active Now' :
                   selectedPlayer.status === 'RECENT' ? 'Recently Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {directMsgAlert && <Alert>{directMsgAlert}</Alert>}

            {/* Direct Message (WhatsApp 10 words style) inside user profile modal */}
            {selectedPlayer.userId !== user?.id && (
              <div className="space-y-2 border-t border-white/10 pt-4">
                <label className="text-xs font-bold text-gold uppercase block">Send Direct Message</label>
                <textarea
                  className="input min-h-20 resize-none text-sm"
                  placeholder="Type your message (max 10 words)..."
                  value={directMsg}
                  onChange={handleDirectMsgChange}
                  maxLength={120}
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs ${wordCount > 10 ? 'text-red-400 font-bold' : 'text-secondary'}`}>
                    Words: {wordCount}/10
                  </p>
                  {wordCount > 10 && (
                    <p className="text-xs text-red-400 font-semibold">Must be 10 words or less</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {selectedPlayer.userId !== user?.id && (
                <button
                  className="btn-primary flex-1 py-2.5 font-bold"
                  disabled={directMsgSending || wordCount === 0 || wordCount > 10}
                  onClick={handleSendDirectMessage}
                >
                  {directMsgSending ? 'Sending...' : 'Send Message'}
                </button>
              )}
              <button
                className="btn-ghost flex-1 py-2.5 font-bold"
                onClick={() => {
                  setSelectedPlayer(null);
                  setDirectMsg('');
                  setWordCount(0);
                  setDirectMsgAlert('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
