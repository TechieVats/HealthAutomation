import Link from 'next/link'

export default function Home() {
  const features = [
    {
      title: 'New Referral',
      description: 'Upload referral PDF and process with OCR',
      href: '/referrals/new',
      icon: '📄',
    },
    {
      title: 'Patients',
      description: 'View and manage patient records',
      href: '/patients',
      icon: '👥',
    },
    {
      title: 'Schedule',
      description: 'Manage visit schedule and EVV',
      href: '/schedule',
      icon: '📅',
    },
    {
      title: 'Timesheets',
      description: 'View and export payroll timesheets',
      href: '/admin/timesheets',
      icon: '💰',
    },
    {
      title: 'Manual Entry',
      description: 'Add manual timesheet entries',
      href: '/admin/timesheets/manual',
      icon: '✏️',
    },
  ]

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-6xl">🏥</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">
            Home Health Automation
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
            Streamline your home health operations with intelligent automation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="feature-card card-gradient p-8 group"
            >
              <div className="flex flex-col items-start">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 text-blue-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Get started →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links Section */}
        <div className="card-gradient p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/referrals/new', label: '📄 Upload New Referral', color: 'from-blue-500 to-cyan-500' },
              { href: '/patients', label: '👥 View Patients', color: 'from-indigo-500 to-purple-500' },
              { href: '/schedule', label: '📅 Visit Schedule', color: 'from-emerald-500 to-teal-500' },
              { href: '/admin/timesheets', label: '💰 Payroll Timesheets', color: 'from-amber-500 to-orange-500' },
              { href: '/admin/timesheets/manual', label: '✏️ Manual Entry', color: 'from-pink-500 to-rose-500' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`bg-gradient-to-r ${link.color} text-white px-6 py-4 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-between group`}
              >
                <span>{link.label}</span>
                <span className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
