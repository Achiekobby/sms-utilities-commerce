import { MotionConfig } from 'framer-motion'
import { HeroSection } from './home/HeroSection'
import { PaymentsSection } from './home/PaymentsSection'
import { RewardsSection } from './home/RewardsSection'
import { SmsCampaignsSection } from './home/SmsCampaignsSection'
import { UtilitiesSection } from './home/UtilitiesSection'

export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <HeroSection />
      <SmsCampaignsSection />
      <PaymentsSection />
      <UtilitiesSection />
      <RewardsSection />
    </MotionConfig>
  )
}
