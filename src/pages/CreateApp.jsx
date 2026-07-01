import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Smartphone, Package, Palette, ArrowRight, Info, Loader2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { isValidUrl, generatePackageName } from '../lib/utils'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import DashboardLayout from './DashboardLayout'

const ICON_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
]

const NETLIFY_BASE = import.meta.env.VITE_NETLIFY_URL || ''
const MAX_ICON_FILE_SIZE = 5 * 1024 * 1024

function resizeImageToDataUrl(file, size = 1024) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Unable to process the selected image'))
        return
      }

      const scale = Math.min(size / image.width, size / image.height)
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale
      const offsetX = (size - drawWidth) / 2
      const offsetY = (size - drawHeight) / 2

      context.clearRect(0, 0, size, size)
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/png'))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to load the selected image'))
    }

    image.src = objectUrl
  })
}

export default function CreateApp() {
  const navigate = useNavigate()
  const { user, getSession } = useAuth()

  const [form, setForm] = useState({
    appName: '',
    websiteUrl: '',
    packageName: '',
    iconColor: '#6366f1',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [useWebsiteFavicon, setUseWebsiteFavicon] = useState(true)
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState('')

  useEffect(() => {
    if (!iconFile) {
      setIconPreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(iconFile)
    setIconPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [iconFile])

  // Auto-generate package name from app name + url
  useEffect(() => {
    if (form.appName && form.websiteUrl) {
      const pkg = generatePackageName(form.appName, form.websiteUrl)
      setForm(f => ({ ...f, packageName: pkg }))
    }
  }, [form.appName, form.websiteUrl])

  // Preview website
  useEffect(() => {
    if (isValidUrl(form.websiteUrl)) {
      setPreviewUrl(form.websiteUrl)
    }
  }, [form.websiteUrl])

  const validate = () => {
    const errs = {}
    if (!form.appName.trim()) errs.appName = 'App name is required'
    else if (form.appName.length < 2) errs.appName = 'Must be at least 2 characters'
    else if (form.appName.length > 50) errs.appName = 'Max 50 characters'

    if (!form.websiteUrl) errs.websiteUrl = 'Website URL is required'
    else if (!isValidUrl(form.websiteUrl)) errs.websiteUrl = 'Must be a valid URL (https://...)'

    if (!form.packageName) errs.packageName = 'Package name is required'
    else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(form.packageName)) {
      errs.packageName = 'Must be valid package format (e.g. com.example.app)'
    }

    if (!useWebsiteFavicon) {
      if (!iconFile) errs.iconFile = 'Upload a PNG or JPG icon or enable website favicon mode'
      else if (!['image/png', 'image/jpeg', 'image/jpg'].includes(iconFile.type)) {
        errs.iconFile = 'App icon must be a PNG or JPG image'
      }
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      let iconDataUrl = ''
      if (!useWebsiteFavicon && iconFile) {
        iconDataUrl = await resizeImageToDataUrl(iconFile, 1024)
      }

      const session = await getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`${NETLIFY_BASE}/.netlify/functions/create-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          app_name: form.appName.trim(),
          website_url: form.websiteUrl.trim(),
          package_name: form.packageName.trim(),
          icon_color: form.iconColor,
          icon_source: useWebsiteFavicon ? 'favicon' : 'upload',
          icon_data_url: iconDataUrl,
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create app')
      }

      toast.success('App created! Build started...')
      navigate(`/builds/${data.build_id}`)
    } catch (err) {
      toast.error(err.message)
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const handleIconFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setErrors(e => ({ ...e, iconFile: 'App icon must be a PNG or JPG image' }))
      event.target.value = ''
      return
    }

    if (file.size > MAX_ICON_FILE_SIZE) {
      setErrors(e => ({ ...e, iconFile: 'App icon must be smaller than 5 MB' }))
      event.target.value = ''
      return
    }

    setUseWebsiteFavicon(false)
    setIconFile(file)
    if (errors.iconFile) setErrors(e => ({ ...e, iconFile: '' }))
  }

  const handleUseFaviconChange = (checked) => {
    setUseWebsiteFavicon(checked)
    if (checked) {
      setIconFile(null)
      if (errors.iconFile) setErrors(e => ({ ...e, iconFile: '' }))
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create New App</h1>
          <p className="text-gray-400 text-sm">Enter your website URL and we'll build an Android APK automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* App Name */}
              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone size={16} className="text-brand-400" />
                  App Details
                </h2>
                <div className="space-y-4">
                  <Input
                    label="App Name"
                    placeholder="My Awesome App"
                    value={form.appName}
                    onChange={e => updateField('appName', e.target.value)}
                    error={errors.appName}
                    hint="This will appear as the app name on the device"
                    icon={<Smartphone size={16} />}
                  />
                  <Input
                    label="Website URL"
                    type="url"
                    placeholder="https://web2appconversion.netlify.app/"
                    value={form.websiteUrl}
                    onChange={e => updateField('websiteUrl', e.target.value)}
                    error={errors.websiteUrl}
                    hint="The website to wrap inside the Android app"
                    icon={<Globe size={16} />}
                  />
                </div>
              </div>

              {/* Package */}
              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Package size={16} className="text-brand-400" />
                  Android Configuration
                </h2>
                <Input
                  label="Package Name"
                  placeholder="com.example.myapp"
                  value={form.packageName}
                  onChange={e => updateField('packageName', e.target.value)}
                  error={errors.packageName}
                  hint="Unique identifier for your Android app (auto-generated)"
                  icon={<Package size={16} />}
                />
              </div>

              {/* Icon source */}
              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon size={16} className="text-brand-400" />
                  App Icon
                </h2>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useWebsiteFavicon}
                    onChange={e => handleUseFaviconChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-dark-700 text-brand-500 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      Use website favicon as app icon
                      <Sparkles size={14} className="text-brand-400" />
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      If enabled, we will try to use your website's favicon automatically.
                    </p>
                  </div>
                </label>

                <div className="mt-4 rounded-2xl border border-white/10 bg-dark-900 p-4">
                  {useWebsiteFavicon ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-500/15 border border-brand-500/20 overflow-hidden flex-shrink-0">
                        <Sparkles size={20} className="text-brand-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Website favicon mode</p>
                        <p className="text-xs text-gray-400">The build will fetch the site favicon and generate Android icons from it.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {iconPreview ? (
                          <img src={iconPreview} alt="App icon preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload size={20} className="text-brand-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">Upload custom app icon</p>
                        <p className="text-xs text-gray-400">PNG or JPG. We'll resize it to 1024×1024 before build.</p>
                        {iconFile && <p className="text-xs text-brand-300 mt-1 truncate">Selected: {iconFile.name}</p>}
                      </div>
                      <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Upload size={14} />
                        Choose image
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleIconFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {errors.iconFile && (
                    <p className="text-xs text-red-400 mt-3">{errors.iconFile}</p>
                  )}
                </div>
              </div>

              {/* Color picker */}
              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Palette size={16} className="text-brand-400" />
                  App Icon Color
                </h2>
                <div className="flex flex-wrap gap-3">
                  {ICON_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateField('iconColor', color)}
                      className={`w-9 h-9 rounded-xl transition-all duration-200 ${
                        form.iconColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="color"
                      value={form.iconColor}
                      onChange={e => updateField('iconColor', e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs text-gray-500">Custom</span>
                  </div>
                </div>
              </div>

              {/* Build info */}
              <div className="flex items-start gap-3 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                <Info size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-brand-300 font-medium">Build time: ~3-5 minutes</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    GitHub Actions will build, sign, and package your APK. You'll get a notification when it's ready.
                  </p>
                </div>
              </div>

              {errors.form && (
                <p className="text-sm text-red-400 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  {errors.form}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                loading={loading}
                size="lg"
                iconRight={!loading && <ArrowRight size={16} />}
              >
                {loading ? 'Creating App & Starting Build...' : 'Create App & Build APK'}
              </Button>
            </form>
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">App Preview</h3>

              {/* Phone mockup */}
              <div className="bg-dark-800 border border-white/10 rounded-3xl p-3 shadow-2xl">
                {/* Status bar */}
                <div className="bg-dark-700 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-dark-600">
                    <span className="text-xs text-white font-medium truncate">
                      {form.appName || 'My App'}
                    </span>
                    <div
                        className="w-5 h-5 rounded-md flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: form.iconColor }}
                    >
                        {useWebsiteFavicon ? (
                          <Sparkles size={10} className="text-white" />
                        ) : iconPreview ? (
                          <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                        ) : (
                          <Smartphone size={11} className="text-white" />
                        )}
                    </div>
                  </div>

                  <div className="h-48 bg-dark-900 flex items-center justify-center relative overflow-hidden">
                    {previewUrl ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Globe size={28} className="text-gray-600 mb-2" />
                        <p className="text-xs text-gray-500 text-center px-4 truncate w-full">
                          {previewUrl}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">WebView loads here</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: form.iconColor + '33' }}
                        >
                          {useWebsiteFavicon ? (
                            <Sparkles size={22} style={{ color: form.iconColor }} />
                          ) : iconPreview ? (
                            <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <Smartphone size={22} style={{ color: form.iconColor }} />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Enter URL to preview</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-dark-800">
                    <p className="text-xs text-gray-400 font-mono truncate text-center">
                      {form.packageName || 'com.example.app'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Build steps */}
              <div className="mt-4 card">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Build Pipeline</h4>
                <div className="space-y-2">
                  {[
                    'Clone Android template',
                    'Replace app config',
                    'Build release APK',
                    'Sign with keystore',
                    'Upload to release',
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-2.5 text-xs text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 font-mono">
                        {i + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
