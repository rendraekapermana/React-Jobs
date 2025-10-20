// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login Berhasil!');
      navigate('/');
    } catch (error) {
      toast.error('Email atau password salah.');
      console.error('Error logging in:', error);
    }
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={handleLogin}>
            <h2 className="text-3xl text-center font-semibold mb-6">Login</h2>

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
                placeholder="Password"
                required
              />
            </div>

            <div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Login
              </button>
            </div>

            <p className="mt-4 text-center">
              Belum punya akun?{' '}
              <Link to="/register" className="text-indigo-700 hover:underline">
                Register di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;