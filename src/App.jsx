// src/App.jsx
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './layout/MainLayout';
import JobsPage from './pages/JobsPage';
import NotFoundPage from './pages/NotFoundPage';
import JobPage, { jobLoader } from './pages/JobPage';
import AddJobPage from './pages/AddJobPage';
import EditJobPage from './pages/EditJobPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import RecruiterRoute from './components/RecruiterRoute';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobApplicantsPage from './pages/JobApplicantsPage';

// Import fungsi-fungsi Firebase
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const App = () => {
  // Add New Job (sudah pakai Firebase)
  const addJob = async (newJob) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('Tidak ada user yang login');
      return;
    }

    // Tambahkan recruiterId ke data lowongan
    const jobWithRecruiter = {
      ...newJob,
      recruiterId: user.uid,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'jobs'), jobWithRecruiter);
    return;
  };

  // Delete Job (sudah pakai Firebase)
  const deleteJob = async (id) => {
    const jobDoc = doc(db, 'jobs', id);
    await deleteDoc(jobDoc);
    return;
  };

  // Update Job (sudah pakai Firebase)
  const updateJob = async (job) => {
    const jobDoc = doc(db, 'jobs', job.id);
    await updateDoc(jobDoc, job);
    return;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        {/* Rute Publik */}
        <Route index element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Terproteksi (Harus Login) */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/jobs/:id"
            element={<JobPage deleteJob={deleteJob} />}
            loader={jobLoader}
          />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
        </Route>

        {/* Rute Khusus Recruiter */}
        <Route element={<RecruiterRoute />}>
          <Route path="/add-job" element={<AddJobPage addJobSubmit={addJob} />} />
          <Route
            path="/edit-job/:id"
            element={<EditJobPage updateJobSubmit={updateJob} />}
            loader={jobLoader}
          />
          {/* Rute untuk melihat pelamar job tertentu */}
          <Route path="/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
        </Route>

        {/* Rute Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};

export default App;