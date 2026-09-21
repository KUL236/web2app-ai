import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Copy, Smartphone, ShieldCheck, Zap } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

const UPI_ID = '6375593042-2@ybl'
const PLAN_PRICE_INR = 99

export default function Payment() {
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const plan = searchParams.get('plan') === 'pro' ? 'Pro' : 'Pro'

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'Web2App AI',
      tn: `${plan} plan`,
      am: String(PLAN_PRICE_INR),
      cu: 'INR',
    })
    return `upi://pay?${params.toString()}`
  }, [plan])

  const copyUpiId = async () => {
    await navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl" />
        <div className="card w-full max-w-md text-center relative">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
            <ArrowLeft size={16} /> Back to pricing
          </Link>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/25 to-purple-500/20 text-brand-400 flex items-center justify-center mb-4 border border-brand-500/20 shadow-glow-sm">
            <Smartphone size={26} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-400 mb-3">
            <ShieldCheck size={13} /> Secure UPI checkout
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pay for {plan} plan</h1>
          <p className="text-gray-400 text-sm mb-6">
            Open the payment app on your phone and complete the ₹{PLAN_PRICE_INR} UPI payment.
          </p>

          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent p-5 mb-5">
            <p className="text-xs text-gray-500 mb-1">UPI ID</p>
            <p className="text-sm font-mono text-white break-all">{UPI_ID}</p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-white">₹{PLAN_PRICE_INR} / month</span>
            </div>
          </div>

          <div className="space-y-3">
            <a href={upiUrl} className="block">
              <Button variant="primary" className="w-full justify-center" icon={<Smartphone size={16} />}>
                Open UPI payment
              </Button>
            </a>
            <Button
              variant="secondary"
              className="w-full justify-center"
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={copyUpiId}
            >
              {copied ? 'UPI ID copied' : 'Copy UPI ID'}
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Zap size={13} className="text-yellow-400" />
            Payment opens directly in your UPI app
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Payment verification requires a merchant gateway callback. This UPI flow only opens the payment app.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
