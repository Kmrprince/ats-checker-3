import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { logOut } from '../lib/auth';

export default function Header({ isLoggedIn, setIsModalOpen }) {
  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center md:px-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-blue-600"
      >
        <Link href="/">ATS Checker</Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <Link href="/why-ats" className="text-blue-600 hover:underline">
          Why ATS?
        </Link>
        <Link href="/about" className="text-blue-600 hover:underline">
          About
        </Link>
        {isLoggedIn ? (
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faLock} className="text-green-500" />
            <button
              onClick={handleLogOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
          >
            Login for Deep Scan
          </button>
        )}
      </motion.div>
    </header>
  );
}