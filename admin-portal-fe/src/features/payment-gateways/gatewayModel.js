import { formatWhen, labelize } from '../clients/clientModel'

export { formatWhen, labelize }

export function sortedGateways(records) {
  return [...records].sort((left, right) => (Number(left?.priority) || 0) - (Number(right?.priority) || 0))
}

export function validateGateway(values) {
  const priority = String(values?.priority ?? '').trim()
  if (!/^\d+$/.test(priority) || Number(priority) < 1 || Number(priority) > 99) {
    return { priority: 'Use a priority from 1 to 99.' }
  }
  return {}
}

export function gatewayBody(code, values) {
  return {
    code,
    is_enabled: Boolean(values.enabled),
    priority: Number(values.priority),
  }
}

export function gatewayDirty(gateway, values) {
  if (!gateway) return false
  if (Boolean(values.enabled) !== Boolean(gateway.is_enabled)) return true
  return String(values.priority ?? '').trim() !== String(gateway.priority ?? '')
}
