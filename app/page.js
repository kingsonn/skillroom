'use client';

import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to SkillRoom
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 mb-4">
            <p className="mb-4">
              Welcome to SkillRoom! Please sign in to access your personalized dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-xl font-semibold mb-2">Features</h2>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Personalized learning experience</li>
                  <li>Track your progress</li>
                  <li>Interactive tutorials</li>
                  <li>Community support</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
                <p className="text-gray-600">
                  Sign in or create an account to start your learning journey with SkillRoom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
