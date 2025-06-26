import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { logOut } from '../lib/auth';

export default function Header({ isLoggedIn, setIsModalOpen }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

      {/* Mobile: Login/Logout Icon and Hamburger Trigger */}
      <div className="md:hidden flex items-center space-x-4">
        {isLoggedIn ? (
          <button
            onClick={() => {
              handleLogOut();
              toggleMenu();
            }}
            className="text-red-600 hover:text-red-700"
            aria-label="Log Out"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
          </button>
        ) : (
          <button
            onClick={() => {
              setIsModalOpen(true);
              toggleMenu();
            }}
            className="text-blue-600 hover:text-blue-700"
            aria-label="Login"
          >
            <FontAwesomeIcon icon={faLock} className="text-xl" />
          </button>
        )}
        <button
          className="text-blue-600 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} className="text-2xl" />
        </button>
      </div>

      {/* Desktop Navigation */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex items-center space-x-4"
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

      {/* Mobile Menu (Slide-in) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden z-10"
          >
            <div className="flex flex-col items-center py-4 space-y-4">
              <Link
                href="/why-ats"
                className="text-blue-600 hover:underline text-lg"
                onClick={toggleMenu}
              >
                Why ATS?
              </Link>
              <Link
                href="/about"
                className="text-blue-600 hover:underline text-lg"
                onClick={toggleMenu}
              >
                About
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogOut();
                    toggleMenu();
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  aria-label="Log Out"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    toggleMenu();
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  aria-label="Login"
                >
                  <FontAwesomeIcon icon={faLock} className="text-xl" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}