// src/pages/JobPage.jsx
import { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, Link } from 'react-router-dom'; // useNavigate diimpor
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
// Impor fungsi-fungsi Firebase
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
// Impor hook useAuth
import { useAuth } from '../hooks/useAuth';
import NotFoundPage from './NotFoundPage';
import Spinner from '../components/Spinner';

const JobPage = ({ deleteJob }) => {
  // --- PERBAIKAN: Deklarasikan navigate dan job DI SINI ---
  const navigate = useNavigate();
  const job = useLoaderData();
  // --------------------------------------------------------

  const { user, userProfile } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Cek apakah user adalah pemilik lowongan ini
  const isOwner =
    user &&
    userProfile?.role === 'recruiter' &&
    job &&
    user.uid === job.recruiterId;

  // Cek status aplikasi
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (user && userProfile?.role === 'jobSeeker' && job?.id) {
        setCheckingApplication(true);
        const applicationsRef = collection(db, 'applications');
        const q = query(
          applicationsRef,
          where('jobId', '==', job.id),
          where('applicantId', '==', user.uid)
        );
        try {
          const querySnapshot = await getDocs(q);
          setHasApplied(!querySnapshot.empty);
        } catch (error) {
          console.error('Error checking application status:', error);
          setHasApplied(false);
        } finally {
          setCheckingApplication(false);
        }
      } else {
        setCheckingApplication(false);
      }
    };

    if (job) {
      checkApplicationStatus();
    } else {
      setCheckingApplication(false);
    }
  }, [user, userProfile, job]);

  // Fungsi Apply
  const handleApply = async () => {
    if (!user || !job) {
      toast.error('You must be logged in and job data must be loaded to apply.');
      return;
    }
    if (userProfile?.role !== 'jobSeeker') {
      toast.error('Only Job Seekers can apply for jobs.');
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied for this job.');
      return;
    }

    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company.name,
        applicantId: user.uid,
        applicantEmail: user.email,
        applicationDate: Timestamp.fromDate(new Date()),
        status: 'pending',
        recruiterId: job.recruiterId,
      });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application.');
    }
  };

  const onDeleteClick = (jobId) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this listing?'
    );
    if (!confirm) return;

    if (jobId) {
      deleteJob(jobId);
      toast.success('Job deleted successfully');
      navigate('/jobs');
    } else {
      toast.error('Cannot delete job: Job ID is missing.');
    }
  };

  if (!job) {
    return <NotFoundPage />;
  }

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/jobs"
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              {/* Detail Pekerjaan */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{job.type}</div>
                <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className="text-orange-700 mr-1" />
                  <p className="text-orange-700">{job.location}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Job Description
                </h3>
                <p className="mb-4">{job.description}</p>
                <h3 className="text-indigo-800 text-lg font-bold mb-2">
                  Salary
                </h3>
                <p className="mb-4">{job.salary}</p> {/* Asumsi sudah "/ Bulan" */}
              </div>
            </main>

            {/* Sidebar */}
            <aside>
              {/* Info Perusahaan */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Company Info</h3>
                <h2 className="text-2xl">{job.company?.name ?? 'N/A'}</h2>
                <p className="my-2">{job.company?.description ?? 'N/A'}</p>
                <hr className="my-4" />
                <h3 className="text-xl">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {job.company?.contactEmail ?? 'N/A'}
                </p>
                <h3 className="text-xl">Contact Phone:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {job.company?.contactPhone ?? 'N/A'}
                </p>
              </div>

             {/* Tombol Apply (Untuk Job Seeker) */}
              {user && userProfile?.role === 'jobSeeker' && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Apply for this Job</h3>
                  {checkingApplication ? (
                     <Spinner loading={true} />
                  ) : hasApplied ? (
                    <p className="text-center text-green-600 font-semibold">
                      You have already applied.
                    </p>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )}


               {/* Link & Tombol Manage (Untuk Recruiter Pemilik) */}
              {isOwner && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                  <Link
                     to={`/jobs/${job.id}/applicants`}
                     className="bg-blue-500 hover:bg-blue-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline block"
                  >
                    View Applicants
                  </Link>
                  <Link
                    to={`/edit-job/${job.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onDeleteClick(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Delete Job
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

// Validasi PropTypes
JobPage.propTypes = {
  deleteJob: PropTypes.func.isRequired,
};

// Loader
const jobLoader = async ({ params }) => {
  try {
    const docRef = doc(db, 'jobs', params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
     console.error("Error loading job:", error);
     return null;
  }
};

export { JobPage as default, jobLoader };