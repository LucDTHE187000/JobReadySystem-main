
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute, JobSeekerRoute, EmployerRoute, NoEmployerRoute } from './components/guards/RoleGuards';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Pricing from './pages/Pricing';
import CVUpload from './pages/CVUpload';
import Profile from './pages/Profile';
import ApplicationsList from './pages/Job/ApplicationsList';
import CreateJob from './pages/Job/CreateApplication';
import JobDetail from './pages/Job/JobDetail';
import PaymentPage from './pages/Job/PaymentPage';
import CreditShopPage from './pages/CreditShopPage';
import ManageCandidates from './pages/Job/ManageCandidates';
import JobSearch from './pages/JobSearch';
import PublicJobDetail from './pages/Job/PublicJobDetail';
import MyApplications from './pages/MyApplications';
import InterviewPractice from './pages/InterviewPractice';
import InterviewSession from './pages/InterviewSession';
import InterviewResult from './pages/InterviewResult';
import InterviewHistory from './pages/InterviewHistory';
import InterviewAnalytics from './pages/InterviewAnalytics';
import Feedback from './pages/Feedback';
import FeedbackReview from './pages/FeedbackReview';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={
              <NoEmployerRoute><About /></NoEmployerRoute>
            } />
            <Route path="/pricing" element={
              <NoEmployerRoute><Pricing /></NoEmployerRoute>
            } />
            <Route path="/jobs" element={
              <NoEmployerRoute><JobSearch /></NoEmployerRoute>
            } />
            <Route path="/jobs/:jobId" element={
              <NoEmployerRoute><PublicJobDetail /></NoEmployerRoute>
            } />

            <Route path="/dashboard" element={
              <EmployerRoute><Dashboard /></EmployerRoute>
            } />
            <Route path="/job-application" element={
              <EmployerRoute><ApplicationsList /></EmployerRoute>
            } />
            <Route path="/create" element={
              <EmployerRoute><CreateJob /></EmployerRoute>
            } />
            <Route path="/job-applications/:jobId" element={
              <EmployerRoute><JobDetail /></EmployerRoute>
            } />
            <Route path="/candidate" element={
              <EmployerRoute><ManageCandidates /></EmployerRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/cv-upload" element={
              <JobSeekerRoute><CVUpload /></JobSeekerRoute>
            } />
            <Route path="/my-applications" element={
              <JobSeekerRoute><MyApplications /></JobSeekerRoute>
            } />
            <Route path="/interview" element={
              <JobSeekerRoute><InterviewPractice /></JobSeekerRoute>
            } />
            <Route path="/employer/feedback" element={
              <EmployerRoute><FeedbackReview /></EmployerRoute>
            } />
            <Route path="/interview/:sessionId" element={
              <JobSeekerRoute><InterviewSession /></JobSeekerRoute>
            } />
            <Route path="/interview/:sessionId/result" element={
              <JobSeekerRoute><InterviewResult /></JobSeekerRoute>
            } />
            <Route path="/interview-history" element={
              <JobSeekerRoute><InterviewHistory /></JobSeekerRoute>
            } />
            <Route path="/feedback" element={
              <JobSeekerRoute><Feedback /></JobSeekerRoute>
            } />
            <Route path="/interview-analytics" element={
              <JobSeekerRoute><InterviewAnalytics /></JobSeekerRoute>
            } />
            <Route path="/credits" element={
              <JobSeekerRoute><CreditShopPage /></JobSeekerRoute>
            } />
            <Route path="/payment/:id" element={
              <JobSeekerRoute><PaymentPage /></JobSeekerRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
