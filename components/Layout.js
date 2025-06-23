import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { signUp, logIn } from '../lib/auth';
import { motion } from 'framer-motion';
import { AuthProvider } from '../lib/authContext';

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [pendingDeepAnalysis, setPendingDeepAnalysis] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);
      console.log('Auth state changed, isLoggedIn:', loggedIn);
    });
    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      console.log('User signed up successfully');
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Signup error:', error.message);
      alert(error.message);
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await logIn(email, password);
      console.log('User logged in successfully');
      setIsLoggedIn(true);
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Login error:', error.message);
      alert(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('✅ Password reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (error) {
      console.error('Reset password error:', error.message);
      setResetMessage(`⚠️ Error: ${error.message}`);
    }
  };

  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    setResetEmail('');
    setResetMessage('');
  };

  const authValue = {
    isLoggedIn,
    setIsLoggedIn,
    isModalOpen,
    setIsModalOpen,
    pendingDeepAnalysis,
    setPendingDeepAnalysis,
  };

  return (
    <AuthProvider value={authValue}>
      <div className="flex flex-col min-h-screen bg-gray-100 bg-gradient-to-br from-gray-100 to-blue-50">
        <Header isLoggedIn={isLoggedIn} setIsModalOpen={setIsModalOpen} />
        {children}
        <Footer />
        {isModalOpen && !isLoggedIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
            >
              {!isResetPassword ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Sign Up or Log In</h2>
                  <p className="text-gray-600 mb-4 text-center">Please sign up or log in to access Deep Analysis.</p>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 w-full"
                      >
                        Sign Up
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogIn}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all duration-300 w-full"
                        type="button"
                      >
                        Log In
                      </motion.button>
                    </div>
                  </form>
                  <button
                    onClick={toggleResetPassword}
                    className="mt-4 text-blue-600 hover:underline text-sm w-full text-center"
                  >
                    Forgot Password?
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Reset Password</h2>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {resetMessage && (
                      <p className={`text-sm ${resetMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {resetMessage}
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 w-full"
                    >
                      Send Reset Email
                    </motion.button>
                  </form>
                  <button
                    onClick={toggleResetPassword}
                    className="mt-4 text-blue-600 hover:underline text-sm w-full text-center"
                  >
                    Back to Login
                  </button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-300"
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}