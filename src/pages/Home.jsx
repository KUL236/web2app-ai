import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Smartphone, Zap, Shield, Globe, Code, Download,
  CheckCircle, ArrowRight, Star, Github, Play
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

const features = [
  {
    icon: <Globe size={22} />,
    title: 'Any Website → Android App',
    description: 'Paste any URL. We wrap it in a production-grade native Android WebView app automatically.',
    color: '#6366f1',
  },
  {
    icon: <Zap size={22} />,
    title: 'CI/CD Powered Builds',
    description: 'GitHub Actions handles every build. Your APK is signed, optimized, and ready for distribution.',
    color: '#8b5cf6',
  },
  {
    icon: <Shield size={22} />,
    title: 'Production-Grade Security',
    description: 'APK signing, HTTPS enforcement, secure headers, and RLS-protected user data.',
    color: '#10b981',
  },
  {
    icon: <Smartphone size={22} />,
    title: 'Native Android Features',
    description: 'Pull-to-refresh, offline screen, dark mode, file upload, camera, location, and more.',
    color: '#f59e0b',
  },
  {
    icon: <Code size={22} />,
    title: 'Custom Package Name',
    description: 'Full control over your app\'s package identifier. Ready for Google Play Store submission.',
    color: '#ef4444',
  },
  {
    icon: <Download size={22} />,
    title: 'Instant APK Download',
    description: 'Download your signed APK directly. Share it, sideload it, or publish to any app store.',
    color: '#06b6d4',
  },
]

const steps = [
  { number: '01', title: 'Enter Your URL', description: 'Paste the website URL you want to convert into an Android app.' },
  { number: '02', title: 'Configure Your App', description: 'Set your app name, package name, and icon color.' },
  { number: '03', title: 'We Build It', description: 'Our GitHub Actions pipeline builds, signs, and packages your APK automatically.' },
  { number: '04', title: 'Download & Ship', description: 'Download your production-ready signed APK instantly.' },
]

const testimonials = [
  { name: 'Rahul Sharma', role: 'SaaS Founder', text: 'Converted my SaaS dashboard to Android in under 5 minutes. Incredible.', rating: 5 },
  { name: 'Priya Patel', role: 'Freelance Developer', text: 'My clients love getting native Android apps for their websites. Game changer.', rating: 5 },
  { name: 'Arjun Mehta', role: 'Digital Agency', text: 'We use Web2App AI for every client project now. Saves hours of development time.', rating: 5 },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
            <Star size={12} className="fill-brand-400" />
            AI-Powered Android App Builder
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Turn Any Website Into an{' '}
            <span className="gradient-text">Android App</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Enter your website URL. Receive a downloadable, signed Android APK in minutes.
            No coding. No Android Studio. No DevOps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
              iconRight={<ArrowRight size={18} />}
              className="shadow-glow"
            >
              Start Building Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/pricing')}
              icon={<Play size={16} />}
            >
              Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              Free tier available
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              APK in ~3 minutes
            </div>
          </div>
        </motion.div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mt-16 max-w-3xl w-full mx-auto"
        >
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 bg-dark-700 rounded-lg px-3 py-1.5 mx-2">
                <p className="text-xs text-gray-500 font-mono">web2app.ai/dashboard</p>
              </div>
            </div>
            <div className="bg-dark-900 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['Total Apps', 'Builds', 'Downloads'].map((label, i) => (
                  <div key={label} className="bg-dark-800 rounded-xl p-3 border border-white/5">
                    <div className="text-2xl font-bold text-white mb-1">{[12, 47, 231][i]}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { name: 'My Store App', url: 'mystore.com', status: 'complete', color: '#6366f1' },
                  { name: 'Portfolio App', url: 'portfolio.dev', status: 'building', color: '#10b981' },
                  { name: 'Blog App', url: 'myblog.com', status: 'queued', color: '#f59e0b' },
                ].map(app => (
                  <div key={app.name} className="flex items-center gap-3 p-2.5 bg-dark-700/50 rounded-lg">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: app.color + '22' }}>
                      <Smartphone size={13} style={{ color: app.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white">{app.name}</div>
                      <div className="text-xs text-gray-500">{app.url}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                      app.status === 'building' ? 'bg-brand-500/20 text-brand-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Production-ready Android apps with all the features users expect.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-hover group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: feature.color + '22', color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From URL to APK in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex gap-4 p-5 rounded-2xl bg-dark-800 border border-white/5"
              >
                <div className="text-2xl font-black gradient-text flex-shrink-0 font-mono">{step.number}</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Loved by Developers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-brand-600/20 to-purple-600/10 border-brand-500/20">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
              <Smartphone size={26} className="text-brand-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to Build Your First App?
            </h2>
            <p className="text-gray-400 mb-6">
              Join thousands of developers turning websites into Android apps.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
              iconRight={<ArrowRight size={18} />}
              className="mx-auto shadow-glow"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
