// src/components/JobListings.jsx
/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react';
import JobListing from './JobListing';
import Spinner from './Spinner';
// Impor fungsi-fungsi Firebase
import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const JobListings = ({ isHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, 'jobs');
        
        // Tentukan query: jika di homepage, limit 3; jika tidak, ambil semua
        const q = isHome 
          ? query(jobsCollection, limit(3)) 
          : jobsCollection;

        const querySnapshot = await getDocs(q);
        
        const jobsList = [];
        querySnapshot.forEach((doc) => {
          jobsList.push({ id: doc.id, ...doc.data() });
        });
        
        setJobs(jobsList);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isHome]); // Tambahkan isHome sebagai dependency

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2
          className="text-3xl font-bold
            text-indigo-500 mb-6 text-center"
        >
          {isHome ? 'Recent Jobs' : 'Browse Jobs'}
        </h2>
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobListing key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobListings;