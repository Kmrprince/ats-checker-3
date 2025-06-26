import { useState } from 'react';
import Layout from '../components/Layout';
import Home from './Home';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingDeepAnalysis, setPendingDeepAnalysis] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  return (
    <Layout parentSetIsLoggedIn={setIsLoggedIn}>
      <Home
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        pendingDeepAnalysis={pendingDeepAnalysis}
        setPendingDeepAnalysis={setPendingDeepAnalysis}
        setIsModalOpen={setIsModalOpen}
        setIsLogin={setIsLogin}
      />
    </Layout>
  );
}