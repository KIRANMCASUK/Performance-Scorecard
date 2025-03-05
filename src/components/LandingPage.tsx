import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  BarChart2, 
  TrendingUp, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Users,
  LineChart,
  FileBarChart,
  Download
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Easy Data Input',
    description: 'Upload data via Excel/CSV or input manually through our intuitive interface.'
  },
  {
    icon: BarChart2,
    title: 'Dynamic Dashboard',
    description: 'Visualize performance metrics with interactive charts and graphs.'
  },
  {
    icon: Users,
    title: 'Comparative Analysis',
    description: 'Compare performance across teams, departments, or projects.'
  },
  {
    icon: LineChart,
    title: 'Performance Tracking',
    description: 'Monitor progress and identify trends over time.'
  },
  {
    icon: FileBarChart,
    title: 'Custom Metrics',
    description: 'Define your own categories and scoring criteria.'
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download reports in PDF, Excel, or CSV formats.'
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-secondary-900">
                Performance Scorecard
              </span>
            </div>
            <Link
              to="/app"
              className="btn-animate inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-secondary-900 sm:text-5xl md:text-6xl">
              <span className="block">Transform Your</span>
              <span className="block text-primary-600">Performance Management</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-secondary-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A comprehensive tool for evaluating, tracking, and improving performance across your organization.
              Make data-driven decisions with powerful analytics and insights.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/app"
                className="btn-animate inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="btn-animate inline-flex items-center px-6 py-3 border border-secondary-300 text-base font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 md:text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-secondary-900">
              Powerful Features for Better Performance Management
            </h2>
            <p className="mt-4 text-lg text-secondary-500">
              Everything you need to evaluate, track, and improve performance effectively.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="hover-card relative bg-white p-6 rounded-lg shadow-soft"
                >
                  <div className="absolute top-6 left-6">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-secondary-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to improve your performance management?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Start using our performance scorecard tool today and make data-driven decisions.
            </p>
            <Link
              to="/app"
              className="btn-animate mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 md:text-lg"
            >
              Launch Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-secondary-900">
                Performance Scorecard
              </span>
            </div>
            <p className="text-secondary-500">
              © {new Date().getFullYear()} Performance Scorecard Tool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;