import { useGetSenderIdsQuery } from '../../../services/api/sender-ids/senderIdsApi'

export function useSenderIds() {
  const query = useGetSenderIdsQuery({ page: 1, perPage: 15 })
  return query.data?.rows ?? []
}
