// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types'; // <-- 1. Impor PropTypes
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log('No such user profile!');
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 2. Tambahkan blok propTypes ---
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Menandakan children wajib ada
};
// ------------------------------------

export const useAuth = () => {
  return useContext(AuthContext);
};