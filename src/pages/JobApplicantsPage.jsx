import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  Timestamp, 
} from 'firebase/firestore';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const { user, userProfile } = useAuth(); 
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user || userProfile?.role !== 'recruiter') {
        if (user === undefined || userProfile === undefined) {
          return;
        }
        toast.error('Unauthorized access.');
        navigate('/');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists() || jobDocSnap.data().recruiterId !== user.uid) {
           toast.error('Job not found or you do not own this job.');
           navigate('/jobs');
           setLoading(false); 
           return;
        }
        setJobTitle(jobDocSnap.data().title);

        const applicationsRef = collection(db, 'applications');
        const q = query(
            applicationsRef,
            where('jobId', '==', jobId), 
            where('recruiterId', '==', user.uid),
            orderBy('applicationDate', 'desc') 
        );

        const querySnapshot = await getDocs(q);
        console.log(`Applicant query returned ${querySnapshot.size} results.`); 

        const appsList = querySnapshot.docs.map((doc) => {
           const data = doc.data();
           let formattedDate = 'Invalid Date';
           if (data.applicationDate && data.applicationDate instanceof Timestamp) {
             try {
               formattedDate = data.applicationDate.toDate().toLocaleDateString();
             } catch (e) { console.error("Date formatting error", e); }
           }
           return {
              id: doc.id,
              ...data,
              formattedApplicationDate: formattedDate, 
           };
        });
        setApplicants(appsList);

      } catch (error) {
        console.error('Error fetching applicants:', error);
        if (error.code === 'failed-precondition') {
           toast.error('Database index required. Please check browser console for the link to create it.');
        } else {
           toast.error(`Failed to load applicants: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && userProfile) {
       fetchApplicants();
    } else if (user === null) { 
        setLoading(false);
        navigate('/login');
    }

  }, [jobId, user, userProfile, navigate]);

  const handleStatusChange = async (applicationId, newStatus) => {
     if (!user || userProfile?.role !== 'recruiter') {
       toast.error('Action not allowed.');
       return;
     }

     console.log(`Updating app ${applicationId} to ${newStatus} by user ${user.uid}`);
     const targetApp = applicants.find(app => app.id === applicationId);
     console.log("Target app's recruiterId:", targetApp?.recruiterId);

    try {
      const appDocRef = doc(db, 'applications', applicationId);
      await updateDoc(appDocRef, {
        status: newStatus,
      });

      setApplicants((prevApplicants) =>
        prevApplicants.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Applicant status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const getStatusClass = (status) => {
     switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to={`/jobs/${jobId}`}
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Job Details
          </Link>
        </div>
      </section>

      <section className="bg-blue-50 px-4 py-10 min-h-screen">
        <div className="container-xl lg:container m-auto">
          <h1 className="text-3xl font-bold text-indigo-500 mb-2 text-center">
            Applicants for: {jobTitle || 'Loading...'} 
          </h1>
          <p className="text-center text-gray-500 mb-6">Manage applications for your job listing</p>

          {loading ? (
            <Spinner loading={loading} />
          ) : applicants.length === 0 ? (
            <p className="text-center text-gray-500">No applicants for this job yet.</p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicants.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.applicantEmail ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.formattedApplicationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {app.status && (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                app.status
                              )}`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {app.status !== 'accepted' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'accepted')}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs"
                          >
                            Accept
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs"
                          >
                            Reject
                          </button>
                        )}
                         {app.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded text-xs"
                          >
                            Set Pending
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default JobApplicantsPage;