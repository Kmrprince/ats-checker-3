import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRobot, faCheckCircle, faFileAlt } from '@fortawesome/free-solid-svg-icons';

export default function WhyATS({ isLoggedIn, setIsLoggedIn, pendingDeepAnalysis, setPendingDeepAnalysis, setIsModalOpen, setIsLogin }) {
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
        <title>Why ATS Matters: Optimize Your Resume with Webflie</title>
        <meta
          name="description"
          content="Understand why ATS resume checkers are key to job success in 2025. Webflie’s AI tools optimize your resume to pass ATS filters and land interviews!"
        />
        <meta
          name="keywords"
          content="ATS resume checker, ATS-friendly resume, resume optimization for ATS, job application tools, AI resume feedback, pass ATS screening, best ATS resume checker 2025, how to pass ATS with resume"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://webflie.com/why-ats/" />
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
            Why ATS Matters for Your Job Search
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            In 2025, Applicant Tracking Systems (ATS) filter most job applications. Webflie’s <strong>ATS resume checker</strong> ensures your resume passes these systems to reach hiring managers.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-lg font-semibold"
            >
              Check Your Resume Now
            </motion.button>
          </Link>
        </motion.section>

        {/* What is ATS Section */}
        <section className="py-12 px-6">
          <Container>
            <motion.div
              initial={{ opacity: 0.2, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-2xl font-bold text-blue-600 mb-4">What is an Applicant Tracking System (ATS)?</h2>
              <p className="text-gray-700 text-lg mb-6">
                An Applicant Tracking System (ATS) is software used by employers to manage job applications. It scans resumes for keywords, skills, and formatting to identify top candidates. In 2025, over 99% of Fortune 500 companies rely on ATS, making an <strong>ATS-friendly resume</strong> essential for job success.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* Why ATS Matters Section */}
        <section className="bg-white py-12 px-6">
          <Container>
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              Why ATS Matters in 2025
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-gray-50 rounded-lg shadow-md"
              >
                <FontAwesomeIcon icon={faFilter} className="text-blue-600 text-3xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">High Rejection Rates</h3>
                <p className="text-gray-700">
                  Studies show 75% of resumes are rejected by ATS due to missing keywords or poor formatting. Without <strong>resume optimization for ATS</strong>, your application may never reach a recruiter.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-gray-50 rounded-lg shadow-md"
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-3xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Keyword and Structure Challenges</h3>
                <p className="text-gray-700">
                  ATS prioritizes job-specific keywords and clear formatting. Many job seekers struggle to align their resumes with job descriptions, reducing their chances of passing ATS screening.
                </p>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Webflie’s Solution Section */}
        <section className="py-12 px-6">
          <Container>
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              How Webflie Helps You Pass ATS
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Free ATS Checker</h3>
                <p className="text-gray-700">
                  Our <strong>ATS resume checker</strong> scans your resume for free, identifying missing keywords and structural issues.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faRobot} className="text-blue-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Resume Feedback</h3>
                <p className="text-gray-700">
                  Get personalized <strong>AI resume feedback</strong> to align your resume with job descriptions and boost your ATS score.
                </p>
              </motion.div>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-6 bg-white rounded-lg shadow-lg text-center"
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Job-Specific Optimization</h3>
                <p className="text-gray-700">
                  Tailor your resume to specific roles with our <strong>job application tools</strong> to pass ATS screening and land interviews.
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
            Ready to Pass ATS and Land Your Dream Job?
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-xl mx-auto">
            Use Webflie’s <strong>best ATS resume checker 2025</strong> to optimize your resume and increase your interview chances.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-xl font-semibold"
            >
              Start Free ATS Check
            </motion.button>
          </Link>
          <p className="text-gray-600 mt-4">
            Have questions? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link> today!
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}

function Container({ children }) {
  return <div className="container mx-auto px-4 max-w-6xl">{children}</div>;
}
