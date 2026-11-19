import { useState } from 'react'
import { ActionMenu, actionIconTrigger, actionMenuTrigger } from '../../../components/ActionMenu'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  useArchiveSurveyMutation,
  useForceDeleteSurveyMutation,
  useRestoreSurveyMutation,
  useSurveyActionMutation,
} from '../../../services/api/surveys/surveysApi'
import { surveyMenuItems } from './actions'
import { SurveyActionDialog } from './SurveyActionDialog'

export function SurveyActions({ survey, archived = false, iconOnly = true, triggerClassName }) {
  const notify = useNotify()
  const [runAction, actionState] = useSurveyActionMutation()
  const [archive, archiveState] = useArchiveSurveyMutation()
  const [restore, restoreState] = useRestoreSurveyMutation()
  const [discard, discardState] = useForceDeleteSurveyMutation()
  const [confirm, setConfirm] = useState(null)
  const busy = actionState.isLoading || archiveState.isLoading || restoreState.isLoading || discardState.isLoading

  const items = surveyMenuItems(survey, {
    archived,
    busy,
    onAction(id) {
      setConfirm(id)
    },
  })

  async function perform() {
    if (!confirm) return
    try {
      let result
      if (confirm === 'archive') result = await archive(survey.id).unwrap()
      else if (confirm === 'restore') result = await restore(survey.id).unwrap()
      else if (confirm === 'discard') result = await discard(survey.id).unwrap()
      else result = await runAction({ id: survey.id, action: confirm }).unwrap()
      setConfirm(null)
      notify.success(result.message || 'Survey updated.')
    } catch (error) {
      setConfirm(null)
      notify.error(apiErrorMessage(error))
    }
  }

  if (!items.length) return null

  return (
    <>
      <ActionMenu
        label={iconOnly ? `Actions for ${survey.name}` : 'Actions'}
        iconOnly={iconOnly}
        triggerClassName={triggerClassName ?? (iconOnly ? actionIconTrigger : actionMenuTrigger)}
        items={items}
      />
      {confirm ? (
        <SurveyActionDialog
          survey={survey}
          action={confirm}
          busy={busy}
          onConfirm={perform}
          onClose={() => {
            if (busy) return
            setConfirm(null)
          }}
        />
      ) : null}
    </>
  )
}
