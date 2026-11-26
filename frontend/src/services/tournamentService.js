import api from './api';

export const getDashboard = () => api.get('/dashboard/me').then((r) => r.data);
export const getStats = () => api.get('/dashboard/stats').then((r) => r.data);
export const getMatches = () => api.get('/matches?limit=20').then((r) => r.data);
export const getUpcomingMatches = () => api.get('/matches/upcoming').then((r) => r.data);
export const getControllerMatches = () => api.get('/controller/matches?limit=30').then((r) => r.data);
export const createMatch = (payload) => api.post('/matches/create', payload).then((r) => r.data);
export const joinMatch = (matchId) => api.post('/matches/join', { matchId }).then((r) => r.data);
export const validateTeamJoin = (payload) => api.post('/matches/team/validate', payload).then((r) => r.data);
export const joinTeam = (payload) => api.post('/matches/join-team', payload).then((r) => r.data);
export const acceptTeamInvite = (payload) => api.post('/matches/invite/accept', payload).then((r) => r.data);
export const getFriendInvites = () => api.get('/matches/friend-invites').then((r) => r.data);
export const acceptFriendInvite = (payload) => api.post('/matches/friend-invites/accept', payload).then((r) => r.data);
export const rejectFriendInvite = (payload) => api.post('/matches/friend-invites/reject', payload).then((r) => r.data);
export const getControllerOverview = () => api.get('/matches/overview').then((r) => r.data);
export const deposit = (payload) => api.post('/wallet/deposit', payload).then((r) => r.data);
export const withdraw = (payload) => api.post('/wallet/withdraw', payload).then((r) => r.data);
export const getLeaderboard = () => api.get('/leaderboard?limit=50').then((r) => r.data);
export const getPointTable = (id = 1) => api.get(`/tournament/${id}/point-table`).then((r) => r.data);
export const getUpdates = () => api.get('/tournaments/updates').then((r) => r.data);
export const getProfile = () => api.get('/profile').then((r) => r.data);
export const updateProfile = (payload) => api.put('/profile', payload).then((r) => r.data);
export const approveDeposit = (payload) => api.post('/controller/deposit/approve', payload).then((r) => r.data);
export const rejectDeposit = (payload) => api.post('/controller/deposit/reject', payload).then((r) => r.data);
export const verifyWithdraw = (payload) => api.post('/controller/withdraw/verify', payload).then((r) => r.data);
export const completeWithdraw = (payload) => api.post('/master/withdraw/complete', payload).then((r) => r.data);
export const masterRejectWithdraw = (payload) => api.post('/master/withdraw/reject', payload).then((r) => r.data);
export const masterApproveDeposit = (payload) => api.post('/master/deposit/approve', payload).then((r) => r.data);
export const masterRejectDeposit = (payload) => api.post('/master/deposit/reject', payload).then((r) => r.data);
export const getPendingDeposits = (page = 0) => api.get(`/master/deposits/pending?page=${page}&size=8`).then((r) => r.data);
export const getPendingWithdraws = (page = 0) => api.get(`/master/withdraws/pending?page=${page}&size=8`).then((r) => r.data);
export const updatePaymentQr = (payload) => api.post('/master/qr', payload).then((r) => r.data);
export const getDepositQr = () => api.get('/wallet/deposit-qr').then((r) => r.data);
export const getNotifications = () => api.get('/notifications').then((r) => r.data);
export const markNotificationsRead = () => api.post('/notifications/read').then((r) => r.data);
export const getMasterMatches = (status) => api.get(`/master/matches?status=${status}`).then((r) => r.data);
export const getMasterControllers = () => api.get('/master/controllers').then((r) => r.data);
export const resetSeasonData = () => api.post('/master/reset-season').then((r) => r.data);
export const updateManualPoints = (payload) => api.post('/master/manual-points', payload).then((r) => r.data);
export const markMatchDone = (matchId) => api.post(`/controller/matches/${matchId}/done`).then((r) => r.data);
export const deleteControllerMatch = (matchId) => api.delete(`/controller/matches/${matchId}`).then((r) => r.data);
export const saveMatchRoomDetails = (matchId, payload) => api.post(`/controller/matches/${matchId}/room-details`, payload).then((r) => r.data);
export const saveMatchTiming = (matchId, payload) => api.post(`/controller/matches/${matchId}/timing`, payload).then((r) => r.data);
export const awardPlayer = (payload) => api.post('/controller/matches/award', payload).then((r) => r.data);
export const getMatchParticipants = (matchId) => api.get(`/controller/matches/${matchId}/participants`).then((r) => r.data);
export const submitMatchResults = (payload) => api.post('/controller/matches/' + payload.matchId + '/results', payload).then((r) => r.data);
export const getTodayControllerReviews = () => api.get('/controller/reviews/today').then((r) => r.data);
export const getTotalControllerReviews = () => api.get('/controller/reviews/total').then((r) => r.data);
export const getAdminPlayers = (page = 0) => api.get(`/admin/players?page=${page}&size=15`).then((r) => r.data);
export const getAdminControllers = (page = 0) => api.get(`/admin/controllers?page=${page}&size=15`).then((r) => r.data);
export const getAdminMasters = (page = 0) => api.get(`/admin/masters?page=${page}&size=10`).then((r) => r.data);
export const deletePlayer = (id) => api.delete(`/admin/players/${id}`).then((r) => r.data);
export const createHelpTicket = (payload) => api.post('/help/tickets', payload).then((r) => r.data);
export const getMyHelpTickets = (page = 0) => api.get(`/help/tickets?page=${page}&size=8`).then((r) => r.data);
export const getMasterHelpTickets = (page = 0) => api.get(`/master/help/tickets?page=${page}&size=8`).then((r) => r.data);
export const respondHelpTicket = (payload) => api.post('/master/help/respond', payload).then((r) => r.data);
export const sendUpdateToPlayers = (payload) => api.post('/master/help/updates', payload).then((r) => r.data);
export const getActivePlayers = (page = 0, size = 10, search = '') => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size)
  });

  if (search.trim()) {
    params.set('q', search.trim());
  }

  return api.get(`/players/active?${params.toString()}`).then((r) => r.data);
};
export const sendMessage = (payload) => api.post('/players/messages/send', payload).then((r) => r.data);
export const getMessages = (userId) => api.get(`/players/messages/${userId}`).then((r) => r.data);
export const deleteConversation = (userId) => api.delete(`/players/messages/${userId}`).then((r) => r.data);
export const markMessagesRead = (userId) => api.post(`/players/messages/${userId}/read`).then((r) => r.data);
export const getConversations = () => api.get('/players/conversations').then((r) => r.data);

export const getGlobalMessages = () => api.get('/community/messages').then((r) => r.data);
export const sendGlobalMessage = (content) => api.post('/community/messages/send', content, { headers: { 'Content-Type': 'text/plain' } }).then((r) => r.data);
export const getPolls = () => api.get('/community/polls').then((r) => r.data);
export const createPoll = (payload) => api.post('/community/polls/create', payload).then((r) => r.data);
export const voteInPoll = (pollId, optionId) => api.post(`/community/polls/${pollId}/vote?optionId=${optionId}`).then((r) => r.data);
export const closePoll = (pollId) => api.post(`/community/polls/${pollId}/close`).then((r) => r.data);

