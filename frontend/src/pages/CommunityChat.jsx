import { useEffect, useState, useRef } from 'react';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import {
  getGlobalMessages,
  sendGlobalMessage,
  getPolls,
  createPoll,
  voteInPoll,
  closePoll,
  sendMessage // for sending private message inside profile popup
} from '../services/tournamentService';
import { when } from '../utils/format';

export default function CommunityChat() {
  const { user } = useAuth();
  const [alert, setAlert] = useState('');

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

  // Emoji Checker
  const containsEmoji = (text) => {
    const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    return regex.test(text);
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
    fetchChatMessages();
    fetchPollData();

    // Setup periodic polling for real-time feel (every 6 seconds)
    const interval = setInterval(() => {
      fetchChatMessages();
      fetchPollData();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatSending) return;

    // EMOJI CHECK: Players are not allowed to use emojis, staff are allowed
    if (user?.role === 'USER' && containsEmoji(newMessage)) {
      setAlert('Players are not allowed to use emojis in the community chat.');
      setTimeout(() => setAlert(''), 4000);
      return;
    }

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

  return (
    <div className="space-y-5">
      {/* Banner */}
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Community Hub</p>
        <h1 className="mt-2 text-3xl font-black">Lobby & Discussions</h1>
        <p className="mt-2 text-sm text-secondary">
          Chat with online players, take polls, or view profiles by clicking on player names.
        </p>
      </section>

      {alert && <Alert type="error">{alert}</Alert>}

      <div className="grid gap-5 md:grid-cols-[1fr_20rem] items-start">
        {/* CHAT BOX CONTAINER */}
        <div className="panel border border-white/10 bg-card flex flex-col h-[550px] relative">
          
          {/* Header containing title and Staff Poll Creator trigger */}
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <h2 className="font-black text-white flex items-center gap-2">
              <span className="text-emerald-500">💬</span> Global Community Lobby
            </h2>
            {isStaff && (
              <button
                onClick={() => setShowCreatePoll(true)}
                className="btn-ghost p-1.5 h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5"
                title="Create a Community Poll"
              >
                {/* 🗳️ Poll Icon */}
                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
          </div>

          {/* Chat Messages list (WhatsApp Style) */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isMsgStaff = msg.senderStatus === 'ADMIN' || msg.senderStatus === 'CONTROLLER' || msg.senderStatus === 'MASTER_CONTROLLER';

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm border relative shadow-md ${
                      isMe 
                        ? 'bg-emerald-500/15 border-emerald-500/20 text-white rounded-tr-none' 
                        : isMsgStaff 
                          ? 'bg-gold/10 border-gold/25 text-white rounded-tl-none' 
                          : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Username (clickable) */}
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
                        className={`text-xs font-black block hover:underline text-left pb-1 mb-0.5 ${
                          isMsgStaff ? 'text-gold' : 'text-primary'
                        }`}
                      >
                        {msg.senderUsername}
                        {isMsgStaff && <span className="text-[9px] text-gold/80 ml-1 font-semibold uppercase">Staff</span>}
                        {msg.senderGameUid && !isMsgStaff && (
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

          {/* Form to submit messages */}
          <form onSubmit={handleSendChatMessage} className="border-t border-white/10 pt-3 flex gap-2">
            <input
              type="text"
              placeholder={user?.role === 'USER' ? "Send message (no emojis)..." : "Send message..."}
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

        {/* POLLS COLUMN */}
        <div className="panel border border-white/10 bg-card space-y-4 h-[550px] flex flex-col">
          <h2 className="font-black text-white pb-3 border-b border-white/10 flex items-center gap-2">
            <span className="text-gold">🗳️</span> Community Polls
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
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
                              {/* Progress bar */}
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
              <p className="text-xs text-secondary text-center py-5">No active polls running.</p>
            )}
          </div>
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
