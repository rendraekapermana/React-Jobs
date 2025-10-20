// src/pages/JobPage.jsx
import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'; // <-- 1. Import PropTypes
// Impor fungsi-fungsi Firebase
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
// Impor hook useAuth
import { useAuth } from '../hooks/useAuth'; // <-- Pastikan path ini benar
import NotFoundPage from './NotFoundPage'; // Impor NotFoundPage untuk fallback

const JobPage = ({ deleteJob }) => {
  const navigate = useNavigate();
  const job = useLoaderData();
  // const { id } = useParams(); // <-- 2. Hapus baris ini karena 'id' tidak digunakan

  // Dapatkan info user
  const { user, userProfile } = useAuth();

  // Cek apakah user adalah pemilik lowongan ini
  const isOwner =
    user &&
    userProfile?.role === 'recruiter' &&
    job &&
    user.uid === job.recruiterId;

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
    return <NotFoundPage />; // Tampilkan 404 jika job tidak ada
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
                <p className="mb-4">{job.salary} / Month</p>
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

              {/* Tampilkan "Manage Job" hanya jika user adalah pemilik */}
              {isOwner && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Job</h3>
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

// --- 3. Tambahkan validasi propTypes ---
JobPage.propTypes = {
  deleteJob: PropTypes.func.isRequired, // deleteJob adalah fungsi dan wajib ada
};
// ------------------------------------

// Loader (tidak berubah)
const jobLoader = async ({ params }) => {
  try {
    const docRef = doc(db, 'jobs', params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Response('Not Found', { status: 404, statusText: 'Job Not Found' });
    }
  } catch (error) {
     console.error("Error loading job:", error);
     throw new Response('Error loading job data.', { status: 500 });
  }
};

export { JobPage as default, jobLoader };