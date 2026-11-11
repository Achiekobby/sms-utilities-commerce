import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { ArrowRight, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, NavLink, useLocation } from 'react-router'
import { signOut } from '../features/auth/signOut'
import { paths } from '../routes/paths'
import { useAuth } from '../utils/hooks/useAuth'
import Images from '../utils/Images'

const links = [
  { to: paths.home, label: 'Home', end: true },
  { to: paths.pricing, label: 'Pricing' },
]

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const linkTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] }

const linkVariants = {
  rest: { color: 'rgba(16, 33, 61, 0.55)' },
  hover: { color: '#0B63F6' },
  active: { color: '#0B63F6' },
}

const underlineVariants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1 },
  active: { scaleX: 1 },
}

function NavItem({ to, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={`rounded-sm px-1 py-1 text-sm font-medium ${focusClass}`}
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

function MobileNavItem({ to, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${focusClass} ${
          isActive ? 'bg-blue/[0.08] text-blue' : 'text-navy hover:bg-canvas'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function Navbar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const menuId = useId()
  const { isAuthenticated, isVerified } = useAuth()
  const [menuPath, setMenuPath] = useState(null)
  const open = menuPath === location.pathname
  const brandPath = isAuthenticated && isVerified ? paths.app : paths.home
  const showPublicLinks = !isAuthenticated || isVerified

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuPath(null)
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function closeMenu() {
    setMenuPath(null)
  }

  function toggleMenu() {
    setMenuPath((current) => (current === location.pathname ? null : location.pathname))
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-8xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link
          to={brandPath}
          className={`shrink-0 rounded-sm ${focusClass}`}
          onClick={closeMenu}
        >
          <img src={Images.logo} alt="UtiliSMS" className="h-9 w-auto sm:h-12" />
        </Link>

        {showPublicLinks ? (
          <>
            <div className="ml-auto hidden items-center gap-6 md:flex md:gap-10">
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
                  onClick={() => dispatch(signOut())}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink ${focusClass}`}
                >
                  <LogOut size={15} strokeWidth={2.2} aria-hidden="true" />
                  Sign out
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to={paths.login}
                    className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to={paths.signup}
                    className={`inline-flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-medium text-white hover:bg-[#006B46] ${focusClass}`}
                  >
                    Get Started
                    <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2 md:hidden">
              {!isVerified ? (
                <Link
                  to={paths.signup}
                  className={`inline-flex h-9 items-center rounded-lg bg-green px-3 text-[13px] font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
                >
                  Get Started
                </Link>
              ) : null}
              <button
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls={menuId}
                onClick={toggleMenu}
                className={`inline-flex size-10 items-center justify-center rounded-lg text-navy hover:bg-canvas ${focusClass}`}
              >
                {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {showPublicLinks && open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-16 bottom-0 z-20 bg-navy/25 md:hidden"
              onClick={closeMenu}
            />
            <motion.div
              id={menuId}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-30 border-b border-ink/10 bg-white shadow-[0_18px_40px_-20px_rgba(11,31,91,0.35)] md:hidden"
            >
              <nav aria-label="Mobile" className="mx-auto flex max-w-8xl flex-col gap-1 px-4 py-3 sm:px-6">
                {links.map((link) => (
                  <MobileNavItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    end={link.end}
                    onNavigate={closeMenu}
                  />
                ))}
              </nav>

              <div className="mx-auto flex max-w-8xl flex-col gap-2 border-t border-ink/10 px-4 py-4 sm:px-6">
                {isVerified ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      dispatch(signOut())
                    }}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink/15 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                  >
                    <LogOut size={16} strokeWidth={2.2} aria-hidden="true" />
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link
                      to={paths.login}
                      onClick={closeMenu}
                      className={`inline-flex h-11 items-center justify-center rounded-xl border border-ink/15 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                    >
                      Sign in
                    </Link>
                    <Link
                      to={paths.signup}
                      onClick={closeMenu}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
                    >
                      Get Started
                      <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
