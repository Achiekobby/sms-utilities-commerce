import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { adminName } from '../../features/auth/session'

function initials(user) {
  const letters = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
  return letters || 'A'
}

export function SidebarUser({ iconOnly }) {
  const user = useSelector(selectCurrentUser)
  const name = adminName(user)
  const roleName = user?.role?.name || 'Admin'
  const image = typeof user?.profileImage === 'string' && user.profileImage ? user.profileImage : ''

  return (
    <div className={`flex shrink-0 items-center gap-2.5 border-t border-ink/10 px-3 py-3 ${iconOnly ? 'lg:justify-center lg:px-0' : ''}`}>
      {image ? (
        <img src={image} alt="" className="size-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
          {initials(user)}
        </span>
      )}
      <span className={iconOnly ? 'min-w-0 lg:sr-only' : 'min-w-0'}>
        <span className="block truncate text-[13px] font-semibold text-navy">{name}</span>
        <span className="block truncate text-[11px] text-ink/50">{roleName}</span>
      </span>
    </div>
  )
}
