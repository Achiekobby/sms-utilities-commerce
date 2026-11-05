import { POSITIONS, setUpNotifications } from 'reapop'

setUpNotifications({
  defaultProps: {
    position: POSITIONS.topRight,
    dismissible: true,
    dismissAfter: 4500,
    allowHTML: false,
  },
})
