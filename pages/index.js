import { useState } from 'react';
import Home from './Home';
import Layout from '../components/Layout';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingDeepAnalysis, setPendingDeepAnalysis] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
      <Home
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        pendingDeepAnalysis={pendingDeepAnalysis}
        setPendingDeepAnalysis={setPendingDeepAnalysis}
        setIsModalOpen={setIsModalOpen}
      />
    </Layout>
  );
}