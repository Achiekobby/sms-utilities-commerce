import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import Images from '../utils/Images'

const ease = [0.22, 1, 0.36, 1]

export function AuthShell({ image, caption, children }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="grid h-svh w-full overflow-hidden bg-canvas lg:grid-cols-2">
        <section className="min-h-0 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            <Link
              to={paths.login}
              aria-label="UtiliSMS"
              className="self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            >
              <img src={Images.logo} alt="" className="h-12 w-auto" />
            </Link>

            <div className="py-8 sm:py-12">{children}</div>
          </div>
        </section>

        <aside className="relative hidden min-h-0 overflow-hidden lg:block" aria-hidden="true">
          <img src={Images.hero_background} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative flex h-full flex-col items-center justify-center px-12 py-12">
            <motion.img
              src={image}
              alt=""
              className="max-h-[55svh] w-full max-w-md object-contain"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease, delay: 0.15 }}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={caption.title}
                className="mt-8 max-w-sm text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
              >
                <p className="text-xl font-semibold text-navy">{caption.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">{caption.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </main>
    </MotionConfig>
  )
}
