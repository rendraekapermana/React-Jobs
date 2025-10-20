// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobSeeker'); // 'jobSeeker' atau 'recruiter'
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Buat user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Simpan data user (termasuk role) ke Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      toast.success('Registrasi berhasil!');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal mendaftar: ' + error.message);
      console.error('Error registering:', error);
    }
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={handleRegister}>
            <h2 className="text-3xl text-center font-semibold mb-6">
              Register Akun
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="Alamat email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="Password (min. 6 karakter)"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Daftar sebagai:
              </label>
              <div className="flex justify-around">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="jobSeeker"
                    checked={role === 'jobSeeker'}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-radio text-indigo-600"
                  />
                  <span className="text-gray-700">Pencari Kerja (Worker)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={role === 'recruiter'}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-radio text-indigo-600"
                  />
                  <span className="text-gray-700">Perekrut (Recruiter)</span>
                </label>
              </div>
            </div>

            <div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Register
              </button>
            </div>

            <p className="mt-4 text-center">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-indigo-700 hover:underline">
                Login di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;