import { motion, useReducedMotion } from 'framer-motion'
import Images from '../../../utils/Images'
import { Journey } from './Journey'
import { ease } from './motion'
import { ServiceHub } from './ServiceHub'

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
}

function Word({ className = '', children }) {
  return (
    <motion.span variants={wordVariants} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  )
}

export function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden">
      <motion.img
        src={Images.hero_background}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={false}
        animate={reduce ? undefined : { scale: [1.03, 1.09, 1.03], x: [0, -14, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative mx-auto w-full max-w-8xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-14 lg:pt-6 lg:pb-14">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h1
            className="text-4xl font-bold tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl [@media(min-width:1024px)_and_(min-height:900px)]:text-7xl"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
          >
            <Word>Everything</Word> <Word>You</Word> <Word>Need,</Word>
            <br />
            <Word className="text-blue">Connected</Word> <Word className="text-green">in</Word>{' '}
            <Word className="text-green">One</Word> <Word className="text-green">Place</Word>
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/65 lg:text-lg lg:leading-7"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.75 }}
          >
            Messaging, payments, and everyday utility services — all in a simple platform.
            <br className="hidden sm:block" />
            Stay connected, keep life running, and get more from your community.
          </motion.p>
        </div>

        <ServiceHub />
        <Journey />
      </div>
    </section>
  )
}
