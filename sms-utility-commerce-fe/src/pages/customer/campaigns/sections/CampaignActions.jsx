import { useState } from 'react'
import { ActionMenu, actionIconTrigger, actionMenuTrigger } from '../../../../components/ActionMenu'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import { useCampaignActionMutation } from '../../../../services/api/campaigns/campaignsApi'
import { campaignMenuItems } from '../actions'
import { CampaignActionDialog } from './CampaignActionDialog'

export function CampaignActions({ campaign, includeView = false, iconOnly = false, triggerClassName }) {
  const notify = useNotify()
  const [run, state] = useCampaignActionMutation()
  const [confirm, setConfirm] = useState(null)
  const items = campaignMenuItems(campaign, {
    includeView,
    busy: state.isLoading,
    onAction(id) {
      setConfirm(id)
    },
  })

  async function perform() {
    if (!confirm) return
    try {
      const result = await run({ id: campaign.id, action: confirm }).unwrap()
      setConfirm(null)
      notify.success(result.message || 'Campaign updated.')
    } catch (error) {
      setConfirm(null)
      notify.error(apiErrorMessage(error))
    }
  }

  if (!items.length) return null

  return (
    <>
      <ActionMenu
        label={iconOnly ? `Actions for ${campaign.name}` : 'Actions'}
        iconOnly={iconOnly}
        items={items}
        triggerClassName={triggerClassName ?? (iconOnly ? actionIconTrigger : actionMenuTrigger)}
      />
      {confirm ? (
        <CampaignActionDialog
          campaignName={campaign.name}
          action={confirm}
          busy={state.isLoading}
          onConfirm={perform}
          onClose={() => {
            if (state.isLoading) return
            setConfirm(null)
          }}
        />
      ) : null}
    </>
  )
}
