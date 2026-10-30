import { motion, MotionConfig } from 'framer-motion'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import Images from '../utils/Images'

const ease = [0.22, 1, 0.36, 1]

// The screen is exactly one viewport tall. Only the form column scrolls;
// the illustration panel on the right stays put.
export function AuthShell({ eyebrow, title, subtitle, image, caption, dense = false, children }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="grid h-svh w-full overflow-hidden lg:grid-cols-2">
        <section className="min-h-0 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            <Link
              to={paths.home}
              className="self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            >
              <img src={Images.logo} alt="UtiliSMS" className={dense ? 'h-10 w-auto' : 'h-12 w-auto'} />
            </Link>

            <motion.div
              className={dense ? 'my-auto py-6' : 'my-auto py-10'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
            >
              {eyebrow ? <div className="mb-6">{eyebrow}</div> : null}
              <h1
                className={`font-bold tracking-tight text-navy ${
                  dense ? 'text-2xl sm:text-[1.65rem]' : 'text-3xl sm:text-4xl'
                }`}
              >
                {title}
              </h1>
              <p className={dense ? 'mt-2 text-sm leading-6 text-ink/65' : 'mt-3 text-base leading-7 text-ink/65'}>
                {subtitle}
              </p>
              <div className={dense ? 'mt-6' : 'mt-8'}>{children}</div>
            </motion.div>
          </div>
        </section>

        <aside className="relative hidden min-h-0 overflow-hidden lg:block" aria-hidden="true">
          <img
            src={Images.hero_background}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative flex h-full flex-col items-center justify-center px-12 py-12">
            <motion.img
              src={image}
              alt=""
              className="max-h-[55svh] w-full max-w-md object-contain"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease, delay: 0.15 }}
            />
            <motion.div
              className="mt-8 max-w-sm text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
            >
              <p className="text-xl font-semibold text-navy">{caption.title}</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">{caption.text}</p>
            </motion.div>
          </div>
        </aside>
      </main>
    </MotionConfig>
  )
}
