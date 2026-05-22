import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const Landing = lazy(() => import('../pages/Landing.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Matches = lazy(() => import('../pages/Matches.jsx'));
const UpcomingMatches = lazy(() => import('../pages/UpcomingMatches.jsx'));
const MatchingFriends = lazy(() => import('../pages/MatchingFriends.jsx'));
const Wallet = lazy(() => import('../pages/Wallet.jsx'));
const Notifications = lazy(() => import('../pages/Notifications.jsx'));
const Leaderboard = lazy(() => import('../pages/Leaderboard.jsx'));
const PointTable = lazy(() => import('../pages/PointTable.jsx'));
const Profile = lazy(() => import('../pages/Profile.jsx'));
const HelpCenter = lazy(() => import('../pages/HelpCenter.jsx'));
const ControllerPanel = lazy(() => import('../pages/ControllerPanel.jsx'));
const ControllerPendingReview = lazy(() => import('../pages/ControllerPendingReview.jsx'));
const ControllerTodayReviewed = lazy(() => import('../pages/ControllerTodayReviewed.jsx'));
const ControllerTotalReviews = lazy(() => import('../pages/ControllerTotalReviews.jsx'));
const MasterPanel = lazy(() => import('../pages/MasterPanel.jsx'));
const MasterHelpCenter = lazy(() => import('../pages/MasterHelpCenter.jsx'));
const AdminPanel = lazy(() => import('../pages/AdminPanel.jsx'));
const AdminPlayers = lazy(() => import('../pages/AdminPlayers.jsx'));
const AdminControllers = lazy(() => import('../pages/AdminControllers.jsx'));
const AdminMasters = lazy(() => import('../pages/AdminMasters.jsx'));
const MasterDeposits = lazy(() => import('../pages/MasterDeposits.jsx'));
const MasterWithdraws = lazy(() => import('../pages/MasterWithdraws.jsx'));
const MasterMatches = lazy(() => import('../pages/MasterMatches.jsx'));
const MasterControllers = lazy(() => import('../pages/MasterControllers.jsx'));
const ActivePlayers = lazy(() => import('../pages/ActivePlayers.jsx'));
const Messages = lazy(() => import('../pages/Messages.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/upcoming-matches" element={<UpcomingMatches />} />
          <Route path="/matching-friends" element={<MatchingFriends />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/point-table" element={<PointTable />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/active-players" element={<ActivePlayers />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['CONTROLLER']} loginRole="CONTROLLER" />}>
        <Route element={<AppLayout />}>
          <Route path="/controller" element={<ControllerPanel />} />
          <Route path="/controller/reviews/pending" element={<ControllerPendingReview />} />
          <Route path="/controller/reviews/today" element={<ControllerTodayReviewed />} />
          <Route path="/controller/reviews/total" element={<ControllerTotalReviews />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['MASTER_CONTROLLER']} loginRole="MASTER_CONTROLLER" />}>
        <Route element={<AppLayout />}>
          <Route path="/master" element={<MasterPanel />} />
          <Route path="/master/controllers" element={<MasterControllers />} />
          <Route path="/master/deposits" element={<MasterDeposits />} />
          <Route path="/master/withdraws" element={<MasterWithdraws />} />
          <Route path="/master/matches" element={<MasterMatches />} />
          <Route path="/master/help" element={<MasterHelpCenter />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['ADMIN']} loginRole="ADMIN" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/players" element={<AdminPlayers />} />
          <Route path="/admin/controllers" element={<AdminControllers />} />
          <Route path="/admin/masters" element={<AdminMasters />} />
        </Route>
      </Route>
    </Routes>
  );
}
