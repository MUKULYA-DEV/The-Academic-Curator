import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

const AMBASSADOR_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCY145wlgWxVjsT-o0UF9RihVlBRiy0WQrshozuNXGRcY9ljbYXJFTFoDktxj--RAL4BD1ZkJlTXQg7Z8AxDYjf38Wq4SQM7crezoTGQp12zP8VR6hiMtnYaTqmmtgE0iAJXYMdhq7MVJvlmRvdnsGSFfW--QnC5h_e2tbEGaCocwvRXlqyTmo5ZNETqKL2bYUYo0DwVnKITwWm0WtKiBNXJjFLZSEuvf_ncHw2aculTjkMvHzzx5cwze9Qjme6XiCvjebmtb0KktEd',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIXUpQZKXPXLy8Fv-xNBiD-h25SICYuc_zL6I9oXcqp-Zaf4L_eolxHhjHz_lERX_PCc3kPj32niuwNuALcirSo15oqZQqD4GRJycrnhYXOOVShqpSQoAVaufseeCnuSjL-jIlSzqafRXQ427cCJvrTsaokoSrI9oisyX_ldSYdWXElj-iu0I9yY197BBvQxrI-Voz7wE9E27snALNsK-Ejr6elYSGxBdM75FJ7NEb0UGKnPirdB1IG0N03_ku8QkVjg4QabFkxpeY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAkKM4lsDtuwDxM7IniQO1hJTUqveOv-KHoxyc0isS6mdSdFWVjOmEaufNuIPBWilH41AzNJiOglxOqCmZNYjxnkIlSb-rWviLqXq1S33W-n_kjUQFLTXU8f4QipSl1UhDonAK4IdDsOBLiBd6v6sDk_IR0ar01nSzTLPaMG1afDAfBjWJ5sQI23Df-SQQmW_1wlCMbCt913v98CY9QnGYO72yczVubE8r7nxXNKL1TXrHmAC0c9Q00idwSM-wYxd7GejC8jIAk1HUO',
]

const CAMPUS_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwwmMJys36C_KvpafbqZn49tULQTeTsJlUQJmHNxnSmTKW0iOykLnkypa_oXEWqrIpNZTQVlyDIwMcY_e7tXp01rQjpmzGSNUDIhlR8HhDPWt9rkmka1wj7MhJ8UEgunxHKIuc9NPSQieBqLiixVpeKKqY1ZoldfZTDwTAq6Ebhnc_h2K7rEWU0a272E7Qwm7YmvFe5FZLA0kBZSeLGKjmcMtUG3x7kwNUOSBPKBnDcO0T7Iz4yEYH9xGZRDR6RwJc4vkZ1q7Zv6YT'

function BrandingPanel({ mode }) {
  const isSignUp = mode === 'signup'
  return (
    <div className="scholar-gradient relative hidden w-1/2 items-center justify-center overflow-hidden p-12 md:flex">
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern height="10" id="auth-grid" patternUnits="userSpaceOnUse" width="10">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect fill="url(#auth-grid)" height="100" width="100" />
        </svg>
      </div>
      <div className="relative z-10 max-w-lg text-white">
        <div className="mb-8">
          <span className="font-headline text-sm font-bold tracking-[0.2em] text-tertiary uppercase">
            Curating Excellence
          </span>
          {isSignUp ? (
            <>
              <h1 className="mt-4 font-headline text-5xl leading-tight font-extrabold tracking-tighter">
                Begin Your <br />
                Academic Legacy.
              </h1>
              <p className="mt-6 font-body text-lg leading-relaxed text-on-primary-container opacity-90">
                Join an elite network of prospective students and university
                ambassadors. Experience campus tours through a lens of prestige and
                curated insights.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 font-headline text-5xl leading-tight font-extrabold tracking-tighter">
                Your Curated <br />
                Journey to <br />
                Academic Excellence.
              </h1>
              <p className="mt-6 font-body text-lg leading-relaxed text-on-primary-container opacity-90">
                Join the most prestigious network of campus ambassadors and discover
                your future university experience.
              </p>
            </>
          )}
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="-space-x-4 flex">
            {AMBASSADOR_IMAGES.map((src, i) => (
              <img
                key={i}
                alt={`Ambassador ${i + 1}`}
                className="h-12 w-12 rounded-full border-2 border-primary shadow-lg"
                src={src}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-white/80 italic">
            &quot;The most immersive tour experience I&apos;ve had.&quot; — Sarah,
            Ivy Applicant
          </p>
        </div>
      </div>
      <div className="absolute -right-20 -bottom-20 h-96 w-96 opacity-20">
        <img
          alt="Campus Architecture"
          className="h-full w-full rotate-12 transform rounded-xl object-cover"
          src={CAMPUS_IMG}
        />
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  const [showPwSignup, setShowPwSignup] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)

  const [signInAuthStep, setSignInAuthStep] = useState('email')
  const [signInEmail, setSignInEmail] = useState('')
  const [signInOtp, setSignInOtp] = useState('')
  const [signInOtpToast, setSignInOtpToast] = useState(null)

  const [signUpAuthStep, setSignUpAuthStep] = useState('email')
  const [signUpOtp, setSignUpOtp] = useState('')
  const [signUpOtpToast, setSignUpOtpToast] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [otpError, setOtpError] = useState('')

  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signUpPhoneCountry, setSignUpPhoneCountry] = useState('+91')
  const [signUpPhone, setSignUpPhone] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authInfo, setAuthInfo] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/explore', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    if (signUpAuthStep !== 'otp') return undefined
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [signUpAuthStep])

  const goTab = (tab) => {
    setAuthError(null)
    setAuthInfo(null)
    setSignInAuthStep('email')
    setSignUpAuthStep('email')
    setSignInOtp('')
    setSignUpOtp('')
    setSignInOtpToast(null)
    setSignUpOtpToast(null)
    setTimeLeft(60)
    setOtpError('')
    if (tab === 'signup') setSearchParams({ tab: 'signup' })
    else setSearchParams({})
  }

  async function handleSendOTP(context) {
    const emailAddress =
      context === 'signin' ? signInEmail.trim() : signUpEmail.trim()
    if (!emailAddress) {
      setAuthError('Please enter your email address.')
      return
    }

    setAuthLoading(true)
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOtp({ email: emailAddress })
    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    const toast = 'OTP sent to your email!'
    if (context === 'signin') {
      setSignInAuthStep('otp')
      setSignInOtpToast(toast)
    } else {
      setSignUpAuthStep('otp')
      setSignUpOtpToast(toast)
      setTimeLeft(60)
      setOtpError('')
    }
  }

  async function handleVerifyOTP(context) {
    const emailAddress =
      context === 'signin' ? signInEmail.trim() : signUpEmail.trim()
    const otp = context === 'signin' ? signInOtp : signUpOtp

    if (context === 'signup') {
      setOtpError('')
    }
    setAuthLoading(true)
    setAuthError(null)
    const { error } = await supabase.auth.verifyOtp({
      email: emailAddress,
      token: otp,
      type: 'email',
    })
    setAuthLoading(false)

    if (error) {
      if (context === 'signup') {
        setOtpError('Incorrect OTP. Please try again.')
      } else {
        setAuthError(error.message)
      }
      return
    }

    navigate('/explore')
  }

  async function handleResendOTP(context) {
    await handleSendOTP(context)
  }

  function handleEditEmail(context) {
    if (context === 'signin') {
      setSignInAuthStep('email')
      setSignInOtp('')
      setSignInOtpToast(null)
    } else {
      setSignUpAuthStep('email')
      setSignUpOtp('')
      setSignUpOtpToast(null)
      setTimeLeft(60)
      setOtpError('')
    }
  }

  const tabBtnBase =
    'flex-1 rounded-full px-6 py-3 font-label text-sm font-semibold transition-all duration-300'
  const tabInactive = `${tabBtnBase} text-secondary hover:text-primary`
  const tabActive = `${tabBtnBase} bg-white text-primary shadow-sm`

  async function handleSignInSubmit(e) {
    e.preventDefault()
    setAuthError(null)
    if (signInAuthStep === 'email') {
      await handleSendOTP('signin')
    } else {
      await handleVerifyOTP('signin')
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setAuthError(null)
    setAuthInfo(null)

    if (!firstName.trim()) {
      setAuthError('First name is required.')
      return
    }
    if (!lastName.trim()) {
      setAuthError('Last name is required.')
      return
    }
    if (!signUpPhone.trim()) {
      setAuthError('Phone number is required.')
      return
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }
    if (signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    if (signUpAuthStep === 'email') {
      await handleSendOTP('signup')
      return
    }

    if (signUpAuthStep === 'otp') {
      if (!termsAccepted) {
        setAuthError('Please agree to the Terms of Service and Privacy Policy.')
        return
      }
      await handleVerifyOTP('signup')
      return
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/explore`,
      },
    })
  }

  return (
    <main className="font-body flex min-h-screen flex-col bg-surface text-on-surface md:flex-row">
      <BrandingPanel mode={activeTab} />

      <section
        className={`flex w-full flex-1 items-center justify-center p-6 md:w-1/2 md:p-12 lg:p-20 ${activeTab === 'signin' ? 'bg-surface-container-low' : 'bg-surface'}`}
      >
        <div className="w-full max-w-md space-y-8">
          <div
            className={`border bg-surface-container-lowest p-8 md:p-10 ${activeTab === 'signin' ? 'ghost-shadow rounded-3xl border-outline-variant/10' : 'rounded-2xl border-surface-container-high shadow-xl shadow-primary/5'}`}
          >
            {activeTab === 'signup' && (
              <div className="mb-12 flex flex-col items-center md:hidden">
                <Link
                  to="/"
                  className="font-headline text-2xl font-extrabold tracking-tighter text-[#002045]"
                >
                  The Academic Curator
                </Link>
                <div className="mt-2 h-1 w-12 bg-tertiary" />
              </div>
            )}

            <div className="bg-surface-container-high mb-8 flex rounded-full p-1.5 md:mb-10">
              <button
                type="button"
                className={activeTab === 'signin' ? tabActive : tabInactive}
                onClick={() => goTab('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={activeTab === 'signup' ? tabActive : tabInactive}
                onClick={() => goTab('signup')}
              >
                Sign Up
              </button>
            </div>

            {activeTab === 'signin' ? (
              <>
                <div className="mb-10 text-center">
                  <h1 className="font-headline mb-2 text-3xl font-extrabold text-primary">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-secondary">
                    Please enter your details to access your account.
                  </p>
                </div>
                <form className="space-y-6" onSubmit={handleSignInSubmit}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label
                        className="block font-label text-xs font-bold tracking-wider text-secondary uppercase"
                        htmlFor="signin-email"
                      >
                        Email Address
                      </label>
                      {signInAuthStep === 'otp' && (
                        <button
                          type="button"
                          className="flex items-center gap-1 font-label text-xs font-bold text-primary hover:underline"
                          onClick={() => handleEditEmail('signin')}
                          aria-label="Edit email address"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit email
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline">
                        mail
                      </span>
                      <input
                        className="w-full rounded-xl border-none bg-surface-container-high py-3.5 pr-4 pl-12 text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                        id="signin-email"
                        placeholder="name@university.edu"
                        type="email"
                        autoComplete="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        disabled={signInAuthStep === 'otp'}
                        required={signInAuthStep === 'email'}
                      />
                    </div>
                  </div>

                  {signInAuthStep === 'otp' && (
                    <>
                      {signInOtpToast && (
                        <p
                          className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300"
                          role="status"
                        >
                          {signInOtpToast}
                        </p>
                      )}
                      <div className="space-y-2">
                        <label
                          className="block px-1 font-label text-xs font-bold tracking-wider text-secondary uppercase"
                          htmlFor="signin-otp"
                        >
                          Enter 6-digit OTP
                        </label>
                        <input
                          className="w-full rounded-xl border-none bg-surface-container-high px-4 py-3.5 text-center font-mono text-lg tracking-[0.4em] text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20"
                          id="signin-otp"
                          placeholder="••••••"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={signInOtp}
                          onChange={(e) =>
                            setSignInOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          required
                        />
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            className="font-label text-xs font-bold text-primary hover:underline"
                            onClick={() => handleResendOTP('signin')}
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {authError && activeTab === 'signin' && (
                    <p
                      className="rounded-lg bg-error-container/30 px-3 py-2 text-center text-sm text-error"
                      role="alert"
                    >
                      {authError}
                    </p>
                  )}
                  <button
                    className="scholar-gradient w-full rounded-xl py-4 font-headline font-bold text-white shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
                    type="submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? 'Please wait…'
                      : signInAuthStep === 'email'
                        ? 'Send Email OTP'
                        : 'Verify & Login'}
                  </button>
                </form>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30" />
                  </div>
                  <div className="relative flex justify-center font-label text-xs">
                    <span className="bg-surface-container-lowest px-4 font-bold tracking-widest text-outline uppercase">
                      Or continue with
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-transparent bg-surface-container-high py-4 font-semibold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-[0.98]"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
                <div className="mt-10 text-center">
                  <p className="text-sm text-secondary">
                    New to the platform?{' '}
                    <button
                      type="button"
                      className="ml-1 font-bold text-primary hover:underline"
                      onClick={() => goTab('signup')}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
                    Create Account
                  </h2>
                  <p className="mt-2 font-body text-sm text-secondary">
                    Step into the future of campus exploration.
                  </p>
                </div>
                <form className="space-y-5" onSubmit={handleSignUp}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                        htmlFor="first_name"
                      >
                        First Name
                      </label>
                      <div className="group relative">
                        <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                          person
                        </span>
                        <input
                          className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-4 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                          id="first_name"
                          name="first_name"
                          placeholder="Alexander"
                          type="text"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                        htmlFor="last_name"
                      >
                        Last Name
                      </label>
                      <div className="group relative">
                        <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                          person
                        </span>
                        <input
                          className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-4 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                          id="last_name"
                          name="last_name"
                          placeholder="Hamilton"
                          type="text"
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="ml-1 flex items-center justify-between">
                        <label
                          className="font-label block text-xs font-bold tracking-wide text-primary/70 uppercase"
                          htmlFor="signup-email"
                        >
                          Email Address
                        </label>
                        {signUpAuthStep === 'otp' && (
                          <button
                            type="button"
                            className="flex items-center gap-1 font-label text-xs font-bold text-primary hover:underline"
                            onClick={() => handleEditEmail('signup')}
                            aria-label="Edit email address"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit email
                          </button>
                        )}
                      </div>
                      <div className="group relative">
                        <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                          mail
                        </span>
                        <input
                          className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-4 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                          id="signup-email"
                          name="email"
                          placeholder="name@university.edu"
                          type="email"
                          autoComplete="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          disabled={signUpAuthStep === 'otp'}
                          required={signUpAuthStep === 'email'}
                        />
                      </div>
                    </div>
                    {signUpAuthStep === 'otp' && (
                      <div className="space-y-3">
                        {signUpOtpToast && (
                          <p
                            className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300"
                            role="status"
                          >
                            {signUpOtpToast}
                          </p>
                        )}
                        <div className="space-y-2">
                          <label
                            className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                            htmlFor="signup-otp"
                          >
                            Enter 6-digit OTP
                          </label>
                          <input
                            className="w-full rounded-xl border-none bg-surface-container-low py-3.5 text-center font-mono text-lg tracking-[0.4em] text-on-surface transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                            id="signup-otp"
                            placeholder="••••••"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={signUpOtp}
                            onChange={(e) => {
                              setOtpError('')
                              setSignUpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }}
                            required
                          />
                          {otpError ? (
                            <p className="px-1 text-center text-sm text-red-500" role="alert">
                              {otpError}
                            </p>
                          ) : null}
                          <div className="flex justify-end pt-0.5">
                            <button
                              type="button"
                              disabled={timeLeft > 0 || authLoading}
                              className={`font-label text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                                timeLeft > 0
                                  ? 'text-secondary/70'
                                  : 'text-primary hover:underline'
                              }`}
                              onClick={() => handleResendOTP('signup')}
                            >
                              {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative min-w-[100px]">
                        <select
                          className="font-body w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container-low py-3.5 pr-8 pl-3 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                          value={signUpPhoneCountry}
                          onChange={(e) => setSignUpPhoneCountry(e.target.value)}
                          disabled={signUpAuthStep === 'otp'}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+61">🇦🇺 +61</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-sm text-outline">
                          expand_more
                        </span>
                      </div>
                      <div className="group relative flex-1">
                        <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                          call
                        </span>
                        <input
                          className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-4 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                          id="phone"
                          name="phone"
                          placeholder="(555) 000-0000"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          disabled={signUpAuthStep === 'otp'}
                          required={signUpAuthStep === 'email'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="group relative">
                      <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                        lock
                      </span>
                      <input
                        className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-12 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type={showPwSignup ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                        onClick={() => setShowPwSignup((v) => !v)}
                        aria-label={showPwSignup ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="font-label ml-1 block text-xs font-bold tracking-wide text-primary/70 uppercase"
                      htmlFor="confirm_password"
                    >
                      Confirm Password
                    </label>
                    <div className="group relative">
                      <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                        lock_clock
                      </span>
                      <input
                        className="font-body w-full rounded-xl border-none bg-surface-container-low py-3.5 pr-12 pl-12 text-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
                        id="confirm_password"
                        name="confirm_password"
                        placeholder="••••••••"
                        type={showPwConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                        onClick={() => setShowPwConfirm((v) => !v)}
                        aria-label={showPwConfirm ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <input
                      className="mt-1 h-4 w-4 rounded-md border-outline-variant text-primary transition-all focus:ring-primary"
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label className="font-body text-xs leading-relaxed text-secondary" htmlFor="terms">
                      I agree to the{' '}
                      <a className="font-bold text-primary hover:underline" href="#">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a className="font-bold text-primary hover:underline" href="#">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                  {authError && activeTab === 'signup' && (
                    <p
                      className="rounded-lg bg-error-container/30 px-3 py-2 text-center text-sm text-error"
                      role="alert"
                    >
                      {authError}
                    </p>
                  )}
                  {authInfo && activeTab === 'signup' && !authError && (
                    <p className="text-center text-sm text-secondary">{authInfo}</p>
                  )}
                  <button
                    className="scholar-gradient mt-2 w-full rounded-xl py-4 font-headline text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                    type="submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? 'Please wait…'
                      : signUpAuthStep === 'email'
                        ? 'Send OTP to Email'
                        : 'Verify & Sign Up'}
                  </button>
                </form>
                <div className="relative mt-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-container-high" />
                  </div>
                  <div className="relative flex justify-center font-label text-[10px] font-bold tracking-widest">
                    <span className="bg-surface-container-lowest px-4 text-outline uppercase">
                      Or Sign Up With
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-surface-container-high bg-surface-container-low py-3.5 font-headline text-sm font-semibold text-primary transition-all hover:bg-surface-container-high active:scale-[0.98]"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
                <p className="mt-8 text-center font-body text-sm text-secondary">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="ml-1 font-extrabold text-primary transition-colors hover:text-tertiary"
                    onClick={() => goTab('signin')}
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>

          {activeTab === 'signin' && (
            <div className="flex justify-center gap-6 px-4">
              <a
                className="text-[10px] font-bold tracking-widest text-outline uppercase transition-colors hover:text-primary"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-[10px] font-bold tracking-widest text-outline uppercase transition-colors hover:text-primary"
                href="#"
              >
                Terms of Service
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="fixed right-6 bottom-6 z-50 hidden md:block">
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full border border-primary/5 bg-surface-container-lowest p-4 shadow-2xl transition-all hover:bg-surface-bright"
        >
          <span className="material-symbols-outlined text-tertiary">help_outline</span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-semibold text-sm transition-all duration-300 group-hover:max-w-xs">
            Need Help?
          </span>
        </button>
      </div>
    </main>
  )
}
