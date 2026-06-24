import { Link } from 'react-router-dom'
import { Smartphone, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <Smartphone size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">Web2App<span className="gradient-text">AI</span></span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Turn any website URL into a production-ready Android APK. No coding required.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com" className="text-gray-500 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Docs', 'Changelog'].map(item => (
                <li key={item}>
                  <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}>
                  <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Web2App AI. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built with ❤️ using React, Supabase & GitHub Actions
          </p>
        </div>
      </div>
    </footer>
  )
}
