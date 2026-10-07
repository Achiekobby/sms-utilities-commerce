import { motion, MotionConfig } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router'
import { logout } from '../features/auth/authSlice'
import { paths } from '../routes/paths'
import Images from '../utils/Images'
import { useAuth } from '../utils/hooks/useAuth'

const links = [
  { to: paths.home, label: 'Home', end: true },
  { to: paths.pricing, label: 'Pricing' },
  // { to: paths.help, label: 'Help' },
]

const linkTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] }

const linkVariants = {
  rest: { color: 'rgba(16, 33, 61, 0.55)' },
  hover: { color: '#1473E6' },
  active: { color: '#1473E6' },
}

const underlineVariants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1 },
  active: { scaleX: 1 },
}

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="rounded-sm px-1 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
    >
      {({ isActive }) => (
        <motion.span
          className="relative inline-block"
          initial={false}
          animate={isActive ? 'active' : 'rest'}
          whileHover="hover"
          variants={linkVariants}
          transition={linkTransition}
        >
          {label}
          <motion.span
            aria-hidden="true"
            className="absolute right-0 -bottom-1.5 left-0 h-0.5 origin-left bg-blue"
            variants={underlineVariants}
            transition={linkTransition}
          />
        </motion.span>
      )}
    </NavLink>
  )
}

export function Navbar() {
  const dispatch = useDispatch()
  const { isAuthenticated, isVerified } = useAuth()
  const brandPath = isAuthenticated && isVerified ? paths.app : paths.home
  const showPublicLinks = !isAuthenticated || isVerified

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white">
      <div className="mx-auto flex h-16 max-w-8xl items-center gap-6 px-4 sm:px-6">
        <Link
          to={brandPath}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
        >
          <img src={Images.logo} alt="UtiliSMS" className="h-12 w-auto" />
        </Link>

        {showPublicLinks ? (
          <div className="ml-auto flex items-center gap-6 sm:gap-10">
            <MotionConfig reducedMotion="user">
              <nav className="flex items-center gap-5 sm:gap-8" aria-label="Primary">
                {links.map((link) => (
                  <NavItem key={link.to} to={link.to} label={link.label} end={link.end} />
                ))}
              </nav>
            </MotionConfig>

            {isVerified ? (
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="text-sm font-medium text-ink/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Sign out
              </button>
            ) : (
              <Link
                to={paths.signup}
                className="inline-flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Get Started
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}
