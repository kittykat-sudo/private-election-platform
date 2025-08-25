import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVoteYea, FaUniversity, FaShieldAlt, FaUsers, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <FaUniversity className="text-xl text-white" />
                </div>
                <span className="text-2xl font-bold text-white">EduVote</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors font-medium">How It Works</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors font-medium">About</a>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 glass-card mt-2 rounded-lg">
                <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg">How It Works</a>
                <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg">About</a>
                <button
                  onClick={() => navigate('/login')}
                  className="block w-full text-left px-3 py-2 text-white font-medium rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="block w-full text-left px-3 py-2 text-purple-400 font-medium rounded-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center glass px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium text-purple-400">Next-Gen Voting Platform</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="text-purple-500">Digital</span>
            <br />
            <span className="text-white">Democracy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Secure, transparent, and efficient digital elections for universities and organizations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Voting
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-lg px-8 py-4"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-white">
              Why Choose EduVote
            </h2>
            <p className="text-xl text-gray-300">Built for modern institutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaShieldAlt,
                title: "Secure",
                description: "Advanced security measures protect every vote"
              },
              {
                icon: FaUsers,
                title: "Multi-Tenant",
                description: "Perfect for multiple organizations"
              },
              {
                icon: FaChartBar,
                title: "Real-Time",
                description: "Instant results and live tracking"
              },
              {
                icon: FaVoteYea,
                title: "Easy to Use",
                description: "Intuitive interface for everyone"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover:glow-primary transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-300 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-white">How It Works</h2>
            <p className="text-xl text-gray-300">Three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register",
                description: "Sign up your organization"
              },
              {
                step: "02", 
                title: "Create Elections",
                description: "Set up candidates and voting periods"
              },
              {
                step: "03",
                title: "Vote & Results",
                description: "Secure voting with instant results"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-6xl font-black text-purple-500 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 rounded-3xl">
            <h2 className="text-5xl font-black mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the future of digital democracy
            </p>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-xl px-12 py-4"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center mr-2">
                  <FaUniversity className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">EduVote</span>
              </div>
              <p className="text-gray-400">Digital democracy platform</p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Security", "Pricing"]
              },
              {
                title: "Support",
                links: ["Documentation", "Contact", "Help Center"]
              },
              {
                title: "Company",
                links: ["About", "Privacy", "Terms"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 EduVote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}