import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { ContactStats } from './sections/ContactStats'
import { ContactsHeader } from './sections/ContactsHeader'
import { CreateGroupDrawer } from './sections/CreateGroupDrawer'
import { GroupsList } from './sections/GroupsList'
import { useGroups } from './useGroups'

export function ContactsPage() {
  useDocumentTitle('Contacts')
  const groups = useGroups()
  const create = useDisclosure()

  return (
    <div>
      <ContactsHeader onCreateGroup={create.open} />
      <ContactStats />
      <GroupsList groups={groups} />

      {create.isOpen ? <CreateGroupDrawer groups={groups} onClose={create.close} /> : null}
    </div>
  )
}
