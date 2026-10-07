import { NavLink } from 'react-router'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'

// The logo cell is the same height as the top bar, so the two read as one white surface.
export function SidebarBrand({ collapsed }) {
  return (
    <div
      className={`hidden h-18 shrink-0 items-center lg:flex ${
        collapsed ? 'justify-center' : 'px-5'
      }`}
    >
      <NavLink
        to={paths.dashboard}
        aria-label="UtiliSMS dashboard"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
      >
        {collapsed ? (
          <img src={Images.favicon} alt="" className="size-9 object-contain" />
        ) : (
          <img src={Images.logo} alt="UtiliSMS" className="h-13 w-auto" />
        )}
      </NavLink>
    </div>
  )
}
