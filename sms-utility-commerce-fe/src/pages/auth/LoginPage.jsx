import { AuthShell } from '../../components/AuthShell'
import Images from '../../utils/Images'
import { PasswordlessForm } from './PasswordlessForm'

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with Google, or use your email or mobile number. We will send a one-time code, so there is no password to remember."
      image={Images.auth}
      caption={{
        title: 'Pick up where you left off.',
        text: 'Your campaigns, wallet balance, and delivery reports are waiting.',
      }}
    >
      <PasswordlessForm />
    </AuthShell>
  )
}
