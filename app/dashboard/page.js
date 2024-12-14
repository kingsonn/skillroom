import Layout from '../../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex gap-6 max-w-6xl mx-auto">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Views</h3>
              <p className="text-3xl font-bold mt-2">2,405</p>
              <p className="text-sm text-gray-500 mt-2">+2.5% from last week</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
              <p className="text-3xl font-bold mt-2">$4,290</p>
              <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">New Users</h3>
              <p className="text-3xl font-bold mt-2">94</p>
              <p className="text-sm text-gray-500 mt-2">+0.5% from last week</p>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="font-medium">User Activity {item}</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-blue-500 text-sm">View Details</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80">
          <div className="space-y-4">
            {/* Upcoming Classes */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Upcoming Classes</h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">English Grammar</h3>
                    <span className="text-sm text-purple-600">9:00 am</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Mr. John Smith</span>
                    <span className="mx-2">•</span>
                    <span>Room 101</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Speaking Club</h3>
                    <span className="text-sm text-purple-600">2:30 pm</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Ms. Sarah Johnson</span>
                    <span className="mx-2">•</span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Events */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Featured Events</h2>
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img src="https://source.unsplash.com/random/400x200/?london" alt="London" className="w-full h-32 object-cover"/>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-medium">London Walking Tour</h3>
                    <p className="text-white/80 text-sm">Next Friday at 3 PM</p>
                  </div>
                </div>
                <div className="relative rounded-lg overflow-hidden">
                  <img src="https://source.unsplash.com/random/400x200/?culture" alt="Culture" className="w-full h-32 object-cover"/>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-medium">Cultural Exchange</h3>
                    <p className="text-white/80 text-sm">This Saturday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
