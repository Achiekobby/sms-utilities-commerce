import { AnimatePresence, motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router'
import { AuthShell } from '../../components/AuthShell'
import { selectPendingVerification } from '../../features/auth/authSlice'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'

const ease = [0.22, 1, 0.36, 1]

function maskEmail(email) {
  if (!email?.includes('@')) return 'your email'
  const [name, domain] = email.split('@')
  return `${name.slice(0, 1)}${'•'.repeat(Math.max(name.length - 1, 2))}@${domain}`
}

export function AuthLayout() {
  const { pathname } = useLocation()
  const pending = useSelector(selectPendingVerification)
  const verifying = pathname === paths.verify

  const title = verifying ? 'Enter your code' : 'Welcome back'
  const subtitle = verifying
    ? `We sent a 6-digit code to ${maskEmail(pending?.email)}. It may take a moment to arrive.`
    : 'Sign in with your admin email. We will send a one-time code, so there is no password to remember.'

  return (
    <AuthShell
      image={Images.auth}
      caption={
        verifying
          ? {
              title: 'Almost there.',
              text: 'The code confirms it is you before the admin workspace opens.',
            }
          : {
              title: 'Admin access, kept simple.',
              text: 'A one-time code is sent to your email. No password to store or reset.',
            }
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-ink/65">{subtitle}</p>
          <div className="mt-8">
            <Outlet />
          </div>
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  )
}
