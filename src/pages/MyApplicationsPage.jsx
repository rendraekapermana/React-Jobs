// src/pages/MyApplicationsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp, // Pastikan Timestamp diimpor jika belum
} from 'firebase/firestore';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Impor toast untuk error

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      // Pastikan user benar-benar ada sebelum query
      if (!user?.uid) {
         console.log("User not logged in, cannot fetch applications.");
         setLoading(false);
         setApplications([]); // Kosongkan aplikasi jika user logout
         return;
      }

      setLoading(true);
      console.log(`Fetching applications for user UID: ${user.uid}`); // Debug: UID User

      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(
          applicationsRef,
          where('applicantId', '==', user.uid),
          orderBy('applicationDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        console.log(`Firestore query returned ${querySnapshot.size} documents.`); // Debug: Jumlah dokumen

        const appsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Raw application data:", data); // Debug: Data mentah per dokumen

          // --- PERBAIKAN: Handle applicationDate dengan aman ---
          let formattedDate = 'N/A';
          if (data.applicationDate && data.applicationDate instanceof Timestamp) {
            try {
              formattedDate = data.applicationDate.toDate().toLocaleDateString();
            } catch (dateError) {
              console.error("Error formatting date:", dateError, data.applicationDate);
            }
          } else {
             console.warn("Missing or invalid applicationDate:", data.applicationDate);
          }
          // ---------------------------------------------------

          return {
            id: doc.id,
            ...data,
            // Simpan tanggal yang sudah diformat untuk ditampilkan
            formattedApplicationDate: formattedDate,
          };
        });

        console.log("Processed applications list:", appsList); // Debug: Hasil map
        setApplications(appsList);

      } catch (error) {
        console.error('Error fetching applications:', error); // <-- Cek console untuk error ini
        // Tampilkan pesan error ke user jika gagal fetch
        toast.error('Failed to load your applications. Please check console.');
        setApplications([]); // Kosongkan jika error
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]); // Tetap jalankan ulang jika user berubah

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default: // pending
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <section className="bg-blue-50 px-4 py-10 min-h-screen">
      <div className="container-xl lg:container m-auto">
        <h1 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          My Job Applications
        </h1>
        {loading ? (
          <Spinner loading={loading} />
        ) : applications.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven&apos;t applied for any jobs yet. {/* Gunakan &apos; untuk apostrophe */}
          </p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto"> {/* Tambah overflow-x-auto */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Pastikan app.jobId ada */}
                      {app.jobId ? (
                         <Link
                           to={`/jobs/${app.jobId}`}
                           className="text-indigo-600 hover:text-indigo-900 font-medium"
                         >
                           {app.jobTitle ?? 'N/A'} {/* Fallback jika jobTitle null */}
                         </Link>
                      ) : (
                         <span>{app.jobTitle ?? 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.companyName ?? 'N/A'} {/* Fallback */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Tampilkan tanggal yang sudah diformat */}
                      {app.formattedApplicationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Pastikan app.status ada */}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyApplicationsPage;