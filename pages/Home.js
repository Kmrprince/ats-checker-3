import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import { Document, Page } from '@react-pdf/renderer';
import { useAuth } from '../lib/authContext';

export default function Home() {
  const { isLoggedIn, setIsLoggedIn, isModalOpen, setIsModalOpen, pendingDeepAnalysis, setPendingDeepAnalysis } = useAuth();
  const [score, setScore] = useState(null);
  const [basicFeedback, setBasicFeedback] = useState([]);
  const [deepFeedback, setDeepFeedback] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [docxContent, setDocxContent] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [aiFeedback, setAIFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [jobDescError, setJobDescError] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    console.log('useEffect: isLoggedIn:', isLoggedIn, 'pendingDeepAnalysis:', pendingDeepAnalysis, 'resumeFile:', !!resumeFile);
    if (isLoggedIn && pendingDeepAnalysis && resumeFile) {
      console.log('Triggering deep analysis after login');
      handleDeepAnalysis();
    }
  }, [isLoggedIn, pendingDeepAnalysis, resumeFile]);

  const handleFileUpload = async (file) => {
    setErrorMessage('');
    setPdfText('');
    setDocxContent('');
    setScore(null);
    setDeepFeedback([]);
    setShowDeepAnalysis(false);
    setJobDescError('');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];

        console.log('Sending request to parse-resume with file type:', file.type);
        console.log('Base64 data length:', base64Data.length);

        const response = await fetch('/.netlify/functions/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileType: file.type,
          }),
        });

        console.log('Function response status:', response.status, 'URL:', response.url);

        if (!response.ok) {
          let errorText = 'Unknown error';
          try {
            const errorResponse = await response.json();
            errorText = errorResponse.error || `HTTP error! Status: ${response.status}`;
            if (response.status === 404) {
              errorText = 'Function not found: Please check Netlify function deployment';
            }
          } catch {
            errorText = `HTTP error! Status: ${response.status}`;
          }
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (data.message) {
          setResumeFile(file);
          if (file.type === 'application/pdf') {
            setPdfText(data.message);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setDocxContent(data.message);
          }
          updateATSScore(data.message, jobTitle, jobDescription);
        } else {
          setErrorMessage(data.error || 'Failed to parse resume: No response from function');
          console.log('No valid response in data:', data);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Error reading file');
        console.error('FileReader error');
      };
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(`Failed to parse file: ${error.message}`);
    }
  };

  const updateATSScore = (text, jobTitle = '', jobDesc = '') => {
    if (!text) {
      setErrorMessage('No text provided for ATS scoring.');
      return;
    }

    const requiredSections = [
      'professional summary',
      'core strengths',
      'technical skills',
      'professional experience',
      'education',
      'skills',
      'certifications',
      'projects',
    ];

    const baseKeywords = [
      'software', 'development', 'coding', 'programming', 'react', 'javascript', 'python', 'java', 'aws', 'cloud',
      'agile', 'scrum', 'devops', 'full-stack', 'frontend', 'backend', 'api', 'database', 'git',
      'design', 'metadata', 'photoshop', 'illustrator', 'ui/ux', 'figma', 'metadata', 'creative', 'visual',
      'management', 'leadership', 'insights', 'team', 'project', 'management', 'communication', 'skills', 'collaboration', 'strategy', 'impact',
      'analytical', 'analytical', 'problem-solving', 'innovation',
      'internship', 'expert', 'data', 'analytics', 'certified', 'course', 'expert', 'data',
      'experience', 'expert', 'expert', 'senior', 'expert', 'expert', 'expert',
      'marketing', 'marketing', 'marketing', 'marketing', 'analytics', 'seo', 'marketing',
      'finance', 'accounting', 'revenue', 'hr', 'finance', 'operations', 'customer',
      'financial', 'data', 'insights',
    ];

    const resumeLower = text.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    const jobDescLower = jobDesc.toLowerCase();

    let jobKeywords = [];
    if (jobDescLower) {
      const descWords = jobDescLower.split(/\s+/).filter(w => w.length > 3 && !['with', 'and', 'the', 'for'].includes(w));
      const keywordFreq = {};
      descWords.forEach(word => {
        keywordFreq[word] = (keywordFreq[word] || 0) + 1;
      });
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
        feedback.push(`➕ Add the "${section}" section to improve your resume's structure.`);
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

    setScore(totalScore);
    setBasicFeedback(feedback);
  };

  const calculateDeepAnalysis = (resumeText, jobTitle, jobDesc) => {
    console.log('calculateDeepAnalysis called with:', { resumeTextLength: resumeText?.length, jobTitle, jobDescLength: jobDesc?.length });
    const feedback = [];

    if (!jobTitle || !jobDesc) {
      feedback.push("⚠️ Please provide both a job title and job description.");
      console.log('Missing job title or description');
      return feedback;
    }

    if (jobDesc.length < 100) {
      feedback.push(`⚠️ Job description must be at least 100 characters (currently ${jobDesc.length} characters). Please provide a detailed description for accurate analysis.`);
      console.log('Job description too short:', jobDesc.length);
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
    const titleMatchPercentage = (titleWords.length > 0 ? (titleMatchCount / titleWords.length) * 100 : 0);
    if (titleMatchPercentage < 100 && titleWords.length > 0) {
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
      feedback.push("⚠️ The job requires experience. Add terms like \"years\" or \"experience\" (e.g., \"3 years of software development\").");
    }

    if (jobTitleLower.includes('developer') && !resumeLower.includes('develop') && !resumeLower.includes('coding')) {
      feedback.push("⚠️ For a \"Software Developer\" role, include \"development\" or \"coding\" to enhance alignment.");
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

    console.log('Deep analysis feedback:', feedback);
    return feedback;
  };

  const handleDeepAnalysis = () => {
    console.log('handleDeepAnalysis called, isLoggedIn:', isLoggedIn, 'resumeFile:', !!resumeFile);
    if (!resumeFile) {
      setErrorMessage('Please upload a resume before performing deep analysis.');
      return;
    }

    if (!isLoggedIn) {
      console.log('User not logged in, opening modal');
      setIsModalOpen(true);
      setPendingDeepAnalysis(true);
      return;
    }

    const textToAnalyze = pdfText || docxContent;
    if (!textToAnalyze) {
      setErrorMessage('No resume text available for analysis.');
      return;
    }

    const deepAnalysis = calculateDeepAnalysis(textToAnalyze, jobTitle, jobDescription);
    if (deepAnalysis.length > 0) {
      setDeepFeedback(deepAnalysis);
      setShowDeepAnalysis(true);
      setAIFeedback(getAIFeedback(deepAnalysis, textToAnalyze, jobDescription));
      updateATSScore(textToAnalyze, jobTitle, jobDescription);
      setPendingDeepAnalysis(false);
      console.log('Deep analysis completed, showDeepAnalysis:', true);
    } else {
      setErrorMessage('Deep analysis failed to generate feedback. Please ensure job title and description are provided.');
      console.log('No feedback generated');
    }
  };

  const getAIFeedback = (analysis, resumeText, jobDesc) => {
    console.log('getAIFeedback called');
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

    console.log('AI feedback:', feedback);
    return feedback;
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const formatPdfText = (text) => {
    const paragraphs = text.split(/\n\n|\.\s+|\n/).filter(line => line.trim());
    return paragraphs.map((para, index) => (
      <p key={index} className="mb-2 text-gray-600">{para.trim()}</p>
    ));
  };

  const handleJobDescriptionChange = (e) => {
    const value = e.target.value;
    setJobDescription(value);
    if (value.length < 100 && value.length > 0) {
      setJobDescError(`Job description must be at least 100 characters (currently ${value.length}).`);
    } else {
      setJobDescError('');
    }
  };

  return (
    <div className="flex flex-col flex-grow p-6">
      <Helmet>
        <title>Webflie - Free ATS Resume Checker & Career Tools</title>
        <meta name="description" content="Webflie helps job seekers improve their resumes with our Free ATS Resume Checker. Boost your LinkedIn, Naukri, and career prospects today!" />
        <meta name="keywords" content="ATS checker, free resume checker, resume optimization, LinkedIn resume, Naukri resume, job portal resume, CV checker, job application tips, online resume checker" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://webflie.com/" />
      </Helmet>

      <div className="flex flex-col md:flex-row md:space-x-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/3 p-6 bg-white shadow-xl rounded-xl mb-6 md:mb-0"
        >
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 rounded-md border-l-4 border-red-500 text-red-600">
              {errorMessage}
            </div>
          )}
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
                  {deepFeedback.length > 0 ? (
                    deepFeedback.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-md border-l-4 border-green-500 text-gray-700"
                      >
                        {point}
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500">No deep analysis feedback available.</p>
                  )}
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
            <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: '#2563eb' }}>
              Free ATS Resume Checker: Upload Your Resume
            </h1>
            <FileUpload onFileUpload={handleFileUpload} />
            {isLoggedIn && resumeFile && (
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Enter Job Title (e.g., Software Engineer)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Paste Job Description Here (minimum 100 characters)"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${jobDescError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {jobDescError && (
                    <p className="mt-1 text-sm text-red-600">{jobDescError}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

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

          {resumeFile && resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6"
              ref={previewRef}
            >
              <h3 className="text-lg mb-3 text-gray-700">DOCX Preview</h3>
              <div className="text-gray-600 whitespace-pre-wrap">{docxContent}</div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}