import { ActionMenu, actionIconTrigger, actionMenuTrigger } from '../../../../components/ActionMenu'
import { messageMenuItems } from '../actions'

export function MessageActions({
  message,
  actions,
  includeView = false,
  onView,
  iconOnly = false,
  triggerClassName,
  label,
}) {
  const items = messageMenuItems(message, {
    includeView,
    onView,
    busy: actions.busy,
    onAction: (type, next, options) => actions.ask(type, next, options),
  })

  if (!items.length) return null

  return (
    <ActionMenu
      label={label ?? (iconOnly ? `Actions for ${message.name || 'message'}` : 'Actions')}
      iconOnly={iconOnly}
      items={items}
      triggerClassName={triggerClassName ?? (iconOnly ? actionIconTrigger : actionMenuTrigger)}
    />
  )
}
