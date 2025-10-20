// src/hooks/useAuth.js
import { useContext } from 'react';
// Impor AuthContext dari file tempat ia didefinisikan
import { AuthContext } from '../context/AuthContext'; 

// Hook kustom ini hanya mengembalikan hasil dari useContext(AuthContext)
export const useAuth = () => {
  return useContext(AuthContext);
};

// Tidak perlu default export di sini