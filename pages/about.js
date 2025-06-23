import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="flex-grow p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">About Webflie</h1>
          <p className="text-gray-700">This is the About page for ATS Checker.</p>
        </div>
      </div>
    </Layout>
  );
}