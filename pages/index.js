// pages/index.js
import { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import { Document, Page } from '@react-pdf/renderer';
import { signUp, logIn, logOut } from '../lib/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';

function Home({ setCurrentPage }) {
  const [score, setScore] = useState(null);
  const [basicFeedback, setBasicFeedback] = useState([]);
  const [deepFeedback, setDeepFeedback] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [docxContent, setDocxContent] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [aiFeedback, setAIFeedback] = useState('');
  const [pendingDeepAnalysis, setPendingDeepAnalysis] = useState(false);
  const previewRef = useRef(null);

  const toggleModal = () => {
    if (!isLoggedIn) {
      setIsModalOpen(!isModalOpen);
    }
    setIsResetPassword(false);
    setResetEmail('');
    setResetMessage('');
  };

  const handleFileUpload = async (file) => {
    console.log('Uploaded file:', file);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];

        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileType: file.type,
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || 'Parsing failed');
        }

        const { text } = await response.json();
        console.log('Parsed text:', text);

        if (text) {
          setResumeFile(file);
          setPdfText(file.type === 'application/pdf' ? text : '');
          if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await file.arrayBuffer();
            const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
            setDocxContent(html);
          }
          updateATSScore(text, jobTitle, jobDescription);
        } else {
          console.error('No text returned from API');
          alert('Failed to parse resume: No text extracted');
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        alert('Error reading file');
      };
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to parse file: ${error.message}`);
    }
  };

  const updateATSScore = (text, jobTitle = '', jobDesc = '') => {
    const requiredSections = [
      'professional summary',
      'core strengths',
      'technical skills',
      'professional experience',
      'education',
      'certifications',
      'projects',
    ];

    const baseKeywords = [
      'software', 'development', 'coding', 'programming', 'react', 'javascript', 'python', 'java', 'aws', 'cloud',
      'agile', 'scrum', 'devops', 'full-stack', 'frontend', 'backend', 'api', 'database', 'git',
      'design', 'graphics', 'photoshop', 'illustrator', 'ui/ux', 'figma', 'adobe', 'creative', 'visual',
      'management', 'leadership', 'team', 'project', 'communication', 'collaboration', 'strategy', 'planning',
      'analytical', 'problem-solving', 'innovation', 'adaptability', 'time-management',
      'internship', 'training', 'learning', 'certified', 'course', 'workshop', 'graduate', 'fresher',
      'experience', 'years', 'senior', 'lead', 'expert', 'specialist', 'consultant',
      'marketing', 'sales', 'finance', 'accounting', 'hr', 'recruitment', 'operations', 'logistics', 'customer',
    ];

    const resumeLower = text.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    const jobDescLower = jobDesc.toLowerCase();

    let jobKeywords = [];
    if (jobDesc) {
      const descWords = jobDescLower.split(/\s+/).filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'this'].includes(w));
      const keywordFreq = {};
      descWords.forEach(word => keywordFreq[word] = (keywordFreq[word] || 0) + 1);
      jobKeywords = Object.entries(keywordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    }
    const allKeywords = [...new Set([...baseKeywords, ...jobKeywords, ...jobTitleLower.split(' ')])];

    const foundSections = requiredSections.filter(section => resumeLower.includes(section));
    let keywordMatchCount = 0;
    allKeywords.forEach(keyword => {
      if (resumeLower.includes(keyword.toLowerCase())) {
        keywordMatchCount++;
      }
    });

    const feedback = [];
    requiredSections.forEach(section => {
      if (!foundSections.includes(section)) {
        feedback.push(`➕ Add the \"${section}\" section to improve your resume's structure.`); // Escaped quotes
      }
    });

    const jobSpecificKeywords = [...jobKeywords, ...jobTitleLower.split(' ')];
    const jobSpecificMatchCount = jobSpecificKeywords.filter(keyword => resumeLower.includes(keyword)).length;
    const jobSpecificTotal = jobSpecificKeywords.length;
    const jobSpecificMatchPercentage = jobSpecificTotal > 0 ? (jobSpecificMatchCount / jobSpecificTotal) * 100 : 100;

    if (jobSpecificMatchPercentage < 70 && jobDesc) {
      feedback.push("⚠️ Your resume lacks key terms from the job title and description. Add more job-specific keywords.");
    }

    const sectionScore = (foundSections.length / requiredSections.length) * 40;
    const baseKeywordScore = (keywordMatchCount / allKeywords.length) * 30;
    const jobSpecificScore = jobDesc ? (jobSpecificMatchPercentage / 100) * 30 : 30;
    const totalScore = Math.round(sectionScore + baseKeywordScore + jobSpecificScore);

    console.log('Score calculated:', { sectionScore, baseKeywordScore, jobSpecificScore, totalScore });
    setScore(totalScore);
    setBasicFeedback(feedback);
  };

  const calculateDeepAnalysis = (resumeText, jobTitle, jobDesc) => {
    const feedback = [];

    if (!jobTitle || !jobDesc) {
      feedback.push("⚠️ Please provide both a job title and job description.");
      return feedback;
    }

    if (jobDesc.length < 200) {
      feedback.push(`⚠️ Job description must be at least 200 characters (currently ${jobDesc.length} characters). Please provide a detailed description for accurate analysis.`);
      return feedback;
    }

    const resumeLower = resumeText.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    const jobDescLower = jobDesc.toLowerCase();

    const descWords = jobDescLower.split(/\s+/);
    const wordFreq = {};
    descWords.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
    const repeatedWords = Object.entries(wordFreq).filter(([, count]) => count > 5).map(([word]) => word);
    if (repeatedWords.length > 3) {
      feedback.push(`⚠️ Job description has excessive repetition (e.g., ${repeatedWords.slice(0, 3).join(', ')}). Use varied language for better analysis.`);
    }

    const descKeywords = descWords.filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'this'].includes(w));
    const keywordFreq = {};
    descKeywords.forEach(word => keywordFreq[word] = (keywordFreq[word] || 0) + 1);
    const topJobKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    const resumeWords = resumeLower.split(/\s+/).filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'this'].includes(w));
    const resumeKeywordFreq = {};
    resumeWords.forEach(word => resumeKeywordFreq[word] = (resumeKeywordFreq[word] || 0) + 1);

    const requiredSections = [
      'professional summary',
      'core strengths',
      'technical skills',
      'professional experience',
      'education',
      'certifications',
      'projects',
    ];
    const missingSections = requiredSections.filter(section => !resumeLower.includes(section));
    if (missingSections.length > 0) {
      feedback.push(`➕ Missing sections: ${missingSections.join(', ')}. Add these to improve your score.`);
    }

    const titleWords = jobTitleLower.split(' ');
    const titleMatchCount = titleWords.filter(word => resumeLower.includes(word)).length;
    const titleMatchPercentage = (titleMatchCount / titleWords.length) * 100;
    if (titleMatchPercentage < 100) {
      const missingTitleWords = titleWords.filter(word => !resumeLower.includes(word));
      feedback.push(`⚠️ Job title alignment is ${Math.round(titleMatchPercentage)}%. Add missing title terms: ${missingTitleWords.join(', ')}.`);
    }

    const missingKeywords = topJobKeywords.filter(keyword => !resumeLower.includes(keyword));
    if (missingKeywords.length > 0) {
      feedback.push(`➕ Missing job-specific keywords: ${missingKeywords.join(', ')}. Incorporate these to boost your score.`);
    }

    const jobSkills = [
      'software', 'development', 'coding', 'programming', 'react', 'javascript', 'python', 'java', 'aws', 'cloud',
      'design', 'graphics', 'photoshop', 'illustrator', 'ui/ux', 'figma', 'adobe',
      'marketing', 'sales', 'branding', 'campaign', 'analytics', 'seo', 'crm',
      'finance', 'accounting', 'budget', 'hr', 'recruitment', 'payroll',
      'management', 'leadership', 'communication', 'collaboration', 'analytical', 'problem-solving',
    ];
    const resumeSkills = jobSkills.filter(skill => resumeLower.includes(skill));
    const jobSkillsMentioned = jobSkills.filter(skill => jobDescLower.includes(skill) || jobTitleLower.includes(skill));
    const missingSkills = jobSkillsMentioned.filter(skill => !resumeSkills.includes(skill));
    if (missingSkills.length > 0) {
      feedback.push(`➕ Missing skills: ${missingSkills.join(', ')}. Add these to enhance your resume.`);
    }

    if (jobDescLower.includes('experience') && !resumeLower.includes('year') && !resumeLower.includes('experience')) {
      feedback.push("⚠️ The job requires experience. Add terms like \"years\" or \"experience\" (e.g., \"3 years of software development\")."); // Escaped quotes
    }

    if (jobTitleLower.includes('developer') && !resumeLower.includes('develop') && !resumeLower.includes('coding')) {
      feedback.push("⚠️ For a \"Software Developer\" role, include \"development\" or \"coding\" to enhance alignment."); // Escaped quotes
    }

    const currentScore = score || 0;
    if (currentScore < 100) {
      const improvementPoints = [];
      if (missingSections.length > 0) improvementPoints.push(`add sections: ${missingSections.join(', ')}`);
      if (missingKeywords.length > 0) improvementPoints.push(`include keywords: ${missingKeywords.join(', ')}`);
      if (missingSkills.length > 0) improvementPoints.push(`add skills: ${missingSkills.join(', ')}`);
      feedback.push(`📈 Your current score is ${currentScore}/100. To reach 100, improve these: ${improvementPoints.join('; ')}.`);
    } else {
      feedback.push("🎉 Perfect score! Your resume fully aligns with the job title and description.");
    }

    return feedback;
  };

  const handleDeepAnalysis = () => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
      setPendingDeepAnalysis(true);
    } else if (resumeFile) {
      const textToAnalyze = pdfText || docxContent;
      const deepAnalysis = calculateDeepAnalysis(textToAnalyze, jobTitle, jobDescription);
      setDeepFeedback(deepAnalysis);
      setShowDeepAnalysis(true);
      setAIFeedback(getAIFeedback(deepAnalysis, textToAnalyze, jobDescription));
      updateATSScore(textToAnalyze, jobTitle, jobDescription);
      setPendingDeepAnalysis(false);
    }
  };

  const getAIFeedback = (analysis, resumeText, jobDesc) => {
    let feedback = "Based on my AI analysis:";

    if (analysis.some(item => item.includes("✅"))) {
      feedback += " Your resume is well-suited for this position, but here are some additional insights:";
    } else {
      feedback += " Here are some key areas to improve your resume for this role:";
    }

    const jobDescLower = jobDesc.toLowerCase();
    const resumeLower = resumeText.toLowerCase();
    const jobKeywords = jobDescLower.split(/\s+/).filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'this'].includes(w));
    const resumeKeywords = resumeLower.split(/\s+/).filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'this'].includes(w));

    const missingKeywords = jobKeywords.filter(keyword => !resumeKeywords.includes(keyword));

    if (missingKeywords.length > 0) {
      feedback += ` - Missing keywords from job description: ${missingKeywords.slice(0, 3).join(', ')}.`;
      if (missingKeywords.length > 3) feedback += " Include more job-specific terms.";
    } else {
      feedback += " - Your resume contains all identified job-specific keywords. Excellent!";
    }

    if (analysis.some(item => item.includes("sections"))) {
      feedback += " - Consider adding or enhancing sections to match industry standards.";
    }
    if (analysis.some(item => item.includes("skills"))) {
      feedback += " - Ensure your skills section reflects the job's requirements.";
    }

    return feedback;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('✅ Password reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (error) {
      setResetMessage(`⚠️ Error: ${error.message}`);
    }
  };

  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    setResetEmail('');
    setResetMessage('');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded, pages:', numPages);
    setNumPages(numPages);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      alert('User signed up successfully!');
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await logIn(email, password);
      setIsLoggedIn(true);
      setIsModalOpen(false);
      if (resumeFile && pendingDeepAnalysis) {
        handleDeepAnalysis();
      }
      setEmail('');
      setPassword('');
      setPendingDeepAnalysis(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      setIsLoggedIn(false);
      setShowDeepAnalysis(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const formatPdfText = (text) => {
    const paragraphs = text.split(/\n\n|\.\s+|\n/).filter(line => line.trim());
    return paragraphs.map((para, index) => (
      <p key={index} className="mb-2 text-gray-600">{para.trim()}</p>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-blue-600"
        >
          ATS Checker
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => setCurrentPage('why-ats')}
            className="text-blue-600 hover:underline"
          >
            Why ATS?
          </button>
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
              onClick={() => !isLoggedIn && toggleModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              {isLoggedIn ? 'Deep Scan' : 'Login for Deep Scan'}
            </button>
          )}
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row p-6 md:space-x-6 flex-grow">
        {/* Left Panel - Score and Feedback */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/3 p-6 bg-white shadow-xl rounded-xl mb-6 md:mb-0"
        >
          {resumeFile ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-blue-600">
                ATS Score: {score !== null ? `${score}/100` : 'Calculating...'}
              </h2>
              <div className="space-y-4">
                {basicFeedback.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-500 text-gray-700"
                  >
                    {point}
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeepAnalysis}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-lg font-semibold"
                >
                  Deep Analysis
                </motion.button>
              </div>
              {showDeepAnalysis && isLoggedIn && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-green-600">Deep Analysis:</h3>
                  {deepFeedback.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-md border-l-4 border-green-500 text-gray-700"
                    >
                      {point}
                    </motion.div>
                  ))}
                  {aiFeedback && (
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-500 text-gray-700"
                    >
                      {aiFeedback}
                    </motion.div>
                  )}
                </div>
              )}
              <div className="mt-6 p-3 bg-green-50 rounded-md">
                <p className="text-sm font-medium text-green-700">✓ Uploaded: {resumeFile.name}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic text-center">Upload your resume to get started</p>
          )}
        </motion.div>

        {/* Right Panel - Upload and Full Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-2/3 p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <FileUpload onFileUpload={handleFileUpload} />
            {isLoggedIn && (
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  placeholder="Paste Job Description Here (minimum 200 characters)"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>
            )}
          </motion.div>

          {/* PDF Full Preview */}
          {resumeFile && resumeFile.type === 'application/pdf' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
              ref={previewRef}
            >
              <h3 className="text-lg mb-3 text-gray-700">PDF Preview</h3>
              <Document file={resumeFile} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
                {numPages && Array.from(new Array(numPages), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
                ))}
              </Document>
              {pdfText && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md overflow-auto max-h-64">
                  {formatPdfText(pdfText)}
                </div>
              )}
            </motion.div>
          )}

          {/* DOCX Full Preview */}
          {resumeFile && resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6"
              ref={previewRef}
            >
              <h3 className="text-lg mb-3 text-gray-700">DOCX Preview</h3>
              <div dangerouslySetInnerHTML={{ __html: docxContent }} className="text-gray-600" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-inner p-4 text-center text-gray-600 text-sm">
        © 2025 ATS Checker. All rights reserved.
      </footer>

      {/* Modal for Sign Up/Login/Reset Password */}
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
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign Up / Log In</h2>
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
              onClick={toggleModal}
              className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-300"
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// WhyATS Component
function WhyATS({ setCurrentPage }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 bg-gradient-to-br from-gray-100 to-blue-50">
      <header className="bg-white shadow-md p-4 flex justify-between items-center md:px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-blue-600"
        >
          ATS Checker
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
          >
            Back to Home
          </button>
        </motion.div>
      </header>

      <div className="flex-grow p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h1 className="text-3xl font-bold mb-4 text-blue-600">Why ATS-Friendly Resumes Matter</h1>
          <p className="text-gray-700 mb-4">
            An ATS (Applicant Tracking System) friendly resume is essential in today’s job market because most companies use ATS software to filter resumes before they reach human recruiters. Crafting your resume with ATS optimization in mind increases your chances of landing an interview.
          </p>
          <h2 className="text-xl font-semibold mb-2 text-green-600">Key Reasons:</h2>
          <ul className="list-disc pl-5 text-gray-700 mb-4">
            <li><strong>Keyword Matching:</strong> ATS systems scan for specific resume keywords like \"ATS resume\" and \"job search tips\" to match job descriptions.</li>
            <li><strong>Formatting:</strong> Simple, clean layouts with standard fonts ensure ATS can parse your resume correctly.</li>
            <li><strong>Relevance:</strong> Including industry-specific terms from Google Trends, such as \"career advice\", aligns your resume with current hiring trends.</li>
            <li><strong>Visibility:</strong> An ATS-optimized resume gets past the initial screening, making your application visible to recruiters.</li>
          </ul>
          <p className="text-gray-700">
            Use our ATS Checker to analyze your resume and ensure it’s optimized for ATS systems. Boost your job search success with tailored career advice today!
          </p>
        </motion.div>
      </div>

      <footer className="bg-white shadow-inner p-4 text-center text-gray-600 text-sm">
        © 2025 ATS Checker. All rights reserved.
      </footer>
    </div>
  );
}

// Main App Component with Simple Routing
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <>
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
      {currentPage === 'why-ats' && <WhyATS setCurrentPage={setCurrentPage} />}
    </>
  );
}