import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faRobot, faClock, faFileAlt } from '@fortawesome/free-solid-svg-icons';

export default function About({ isLoggedIn, setIsLoggedIn, pendingDeepAnalysis, setPendingDeepAnalysis, setIsModalOpen, setIsLogin }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Layout
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
      pendingDeepAnalysis={pendingDeepAnalysis}
      setPendingDeepAnalysis={setPendingDeepAnalysis}
      setIsModalOpen={setIsModalOpen}
      setIsLogin={setIsLogin}
    >
      <Helmet>
        <title>Webflie About: AI-Powered ATS Resume Optimization</title>
        <meta
          name="description"
          content="Learn about Webflie’s mission to enhance your career with our AI-powered ATS resume checker. Optimize your job applications for success in 2025!"
        />
        <meta
          name="keywords"
          content="ATS resume checker, AI resume builder, resume ATS optimization, job application tools, career advancement platform, resume feedback AI, ATS-friendly resume, best ATS resume checker 2025"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://webflie.com/about/" />
      </Helmet>

      <div className="flex flex-col flex-grow bg-gradient-to-br from-gray-100 to-blue-50">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white shadow-md py-12 px-6 text-center"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-blue-600 mb-4">
            About Webflie: Your Career Success Partner
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Discover how Webflie’s <strong>AI-powered ATS resume checker</strong> transforms your job applications with cutting-edge career tools.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-lg font-semibold"
            >
              Optimize Your Resume Now
            </motion.button>
          </Link>
        </motion.section>

        {/* Mission Section */}
        <section className="py-12 px-6">
          <Container>
            <motion.div
              initial={{ opacity: 0.2, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg mb-6">
                At <strong>Webflie</strong>, we’re dedicated to empowering job seekers worldwide. Our <strong>career advancement platform</strong> equips you with a free <strong>ATS resume checker</strong> and AI-driven insights to ensure your resume stands out in the 2025 job market. Whether you’re a fresh graduate or a seasoned professional, we help you navigate Applicant Tracking Systems (ATS) and secure more interviews.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ATS Importance Section */}
        <section className="bg-white py-12 px-6">
          <Container>
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              Why an ATS Resume Checker Matters
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-gray-50 rounded-lg shadow-md"
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-3xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ATS Dominance</h3>
                <p className="text-gray-700">
                  In 2025, 99% of Fortune 500 companies use ATS to filter resumes. Without an <strong>ATS-friendly resume</strong>, even qualified candidates get rejected.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-gray-50 rounded-lg shadow-md"
              >
                <FontAwesomeIcon icon={faRobot} className="text-blue-600 text-3xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Solution</h3>
                <p className="text-gray-700">
                  Webflie’s <strong>AI resume builder</strong> scans your resume for keywords, structure, and job alignment, providing <strong>resume feedback AI</strong> to boost your score.
                </p>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Why Webflie Section */}
        <section className="py-12 px-6">
          <Container>
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              Why Choose Webflie?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Free Access</h3>
                <p className="text-gray-700">
                  Enjoy our <strong>free resume optimizer</strong> with no subscriptions or hidden fees.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faRobot} className="text-blue-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Driven Insights</h3>
                <p className="text-gray-700">
                  Our <strong>job application tools</strong> use AI to deliver precise, personalized feedback.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faClock} className="text-blue-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2025-Ready</h3>
                <p className="text-gray-700">
                  Stay ahead with tools updated for modern ATS and AI recruitment trends.
                </p>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-12 px-6 text-center bg-blue-50"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Ready to Boost Your Career?
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-xl mx-auto">
            Try Webflie’s <strong>best ATS resume checker 2025</strong> to optimize your resume and land more interviews.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-xl font-semibold"
            >
              Start Free Resume Check
            </motion.button>
          </Link>
          <p className="text-gray-600 mt-4">
            Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link> today!
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}

function Container({ children }) {
  return <div className="container mx-auto px-4 max-w-6xl">{children}</div>;
}
