import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, Star } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Web2App AI',
    color: 'gray',
    features: [
      '3 app builds per month',
      'Standard build queue',
      'APK download',
      'Community support',
      'Basic Android features',
    ],
    cta: 'Get Started Free',
    variant: 'secondary',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For freelancers and small teams',
    color: 'brand',
    popular: true,
    features: [
      '25 app builds per month',
      'Priority build queue',
      'APK + AAB download',
      'Email support',
      'All Android features',
      'Custom splash screen',
      'Remove Web2App branding',
      'Build history (90 days)',
    ],
    cta: 'Start Pro Trial',
    variant: 'primary',
  },
  {
    name: 'Agency',
    price: '$79',
    period: '/month',
    description: 'For agencies and power users',
    color: 'purple',
    features: [
      'Unlimited builds',
      'Dedicated build runner',
      'APK + AAB + source code',
      'Priority support',
      'All Pro features',
      'White-label apps',
      'Custom signing keystore',
      'Build history (unlimited)',
      'Team members (5 seats)',
      'API access',
    ],
    cta: 'Contact Sales',
    variant: 'secondary',
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
                <Star size={12} className="fill-brand-400" />
                Simple, transparent pricing
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-400 max-w-xl mx-auto">
                Start free. Scale as you grow. No hidden fees.
              </p>
            </motion.div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-brand-600/20 to-dark-800 border-brand-500/50 shadow-glow'
                    : 'bg-dark-800 border-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold shadow-glow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  className="w-full justify-center"
                  onClick={() => navigate('/signup')}
                  icon={plan.popular ? <Zap size={15} /> : undefined}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                {
                  q: 'How long does a build take?',
                  a: 'Typically 3-5 minutes on the free plan. Pro and Agency plans get priority queues for faster builds.',
                },
                {
                  q: 'Is the APK signed and ready for stores?',
                  a: 'Yes! Every APK is signed with a release keystore. Agency users can provide their own keystore.',
                },
                {
                  q: 'Can I publish to Google Play Store?',
                  a: 'Yes. Your APK is production-ready. We also provide AAB (Android App Bundle) on Pro and above.',
                },
                {
                  q: 'What Android features are included?',
                  a: 'WebView, pull-to-refresh, offline screen, dark mode, file upload, camera, location, and more.',
                },
              ].map(faq => (
                <div key={faq.q} className="card">
                  <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
