import Layout from '../../components/Layout';

export default function Profile() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* Profile Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold">John Doe</h1>
                <p className="text-gray-600">Frontend Developer</p>
                <p className="text-sm text-gray-500 mt-1">San Francisco, CA</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About Me</h2>
                <p className="text-gray-600">
                  Passionate frontend developer with 5 years of experience in building 
                  modern web applications. Specialized in React and Next.js development.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Experience</h2>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4">
                    <h3 className="font-medium">Senior Frontend Developer</h3>
                    <p className="text-sm text-gray-500">Tech Corp • 2020 - Present</p>
                    <p className="text-gray-600 mt-2">
                      Led the frontend development team in building modern web applications.
                    </p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-4">
                    <h3 className="font-medium">Frontend Developer</h3>
                    <p className="text-sm text-gray-500">Web Solutions Inc • 2018 - 2020</p>
                    <p className="text-gray-600 mt-2">
                      Developed and maintained client websites using React.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="space-y-2">
                  {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'].map((skill) => (
                    <div key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm inline-block mr-2 mb-2">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Contact</h2>
                <div className="space-y-2">
                  <p className="text-gray-600">📧 john.doe@email.com</p>
                  <p className="text-gray-600">📱 (123) 456-7890</p>
                  <p className="text-gray-600">🔗 github.com/johndoe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
