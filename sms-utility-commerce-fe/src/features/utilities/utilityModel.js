import { FileText, Layers, Radio, Smartphone, Tv, Wifi, Zap } from 'lucide-react'
import Images from '../../utils/Images'
import airtimeArt from '../../assets/images/services/airtime.png'
import dataArt from '../../assets/images/services/data_bundle.png'
import mashupArt from '../../assets/images/services/mtn_mashup.png'
import tvArt from '../../assets/images/services/tv_subscription.png'
import dstvArt from '../../assets/images/services/dstv.png'
import gotvArt from '../../assets/images/services/gotv.png'
import startimesArt from '../../assets/images/services/startimes.png'
import ecgArt from '../../assets/images/services/ecg_prepaid.png'
import ecgLogo from '../../assets/images/services/ecg.png'
import resultsArt from '../../assets/images/services/results_checker.png'
import beceArt from '../../assets/images/services/bece.png'
import wassceArt from '../../assets/images/services/wassce.png'

export const UTILITY_ORDER = ['airtime', 'data', 'mashup', 'tv', 'ecg', 'results']

export const UTILITY_GROUPS = [
  { id: 'mobile', kicker: 'Mobile', title: 'Airtime & data' },
  { id: 'home', kicker: 'Home', title: 'Bills & checkers' },
]

const SERVICE_META = {
  airtime: {
    title: 'Airtime',
    blurb: 'Top up any Ghanaian network in seconds.',
    accent: '#0A5CE5',
    tint: '#E8F1FF',
    glow: 'rgba(10,92,229,0.18)',
    icon: Smartphone,
    artwork: airtimeArt,
    group: 'mobile',
    steps: [
      'Choose the network that matches the phone you are topping up.',
      'Set the amount with the slider, type it in, or pick a popular value.',
      'Stay inside that network’s minimum and maximum. The charge comes from your wallet.',
    ],
  },
  data: {
    title: 'Data bundles',
    blurb: 'Buy MTN, Telecel, and AT packages instantly.',
    accent: '#008859',
    tint: '#E5F6EC',
    glow: 'rgba(0,136,89,0.18)',
    icon: Wifi,
    artwork: dataArt,
    group: 'mobile',
    steps: [
      'Choose MTN, Telecel, or AT.',
      'Pick a bundle. Sizes are listed from smallest to largest.',
      'The price on the card is what leaves your wallet.',
    ],
  },
  mashup: {
    title: 'MTN Mashup',
    blurb: 'Bundled data and voice minutes in one purchase.',
    accent: '#F5A623',
    tint: '#FFF6E5',
    glow: 'rgba(245,166,35,0.22)',
    icon: Layers,
    artwork: mashupArt,
    group: 'mobile',
    steps: [
      'These bundles are MTN Mashup only.',
      'Each option combines data and call minutes.',
      'Compare the size and price, then continue with the one you need.',
    ],
  },
  tv: {
    title: 'TV subscriptions',
    blurb: 'Pay DStv, GOtv, and StarTimes from your wallet.',
    accent: '#E0232E',
    tint: '#FDECEE',
    glow: 'rgba(224,35,46,0.16)',
    icon: Tv,
    artwork: tvArt,
    group: 'home',
    steps: [
      'Choose DStv, GOtv, or StarTimes.',
      'Set the amount with the field, the slider, or a common value for that provider.',
      'Stay inside that provider’s minimum and maximum. The charge comes from your wallet.',
    ],
  },
  ecg: {
    title: 'Electricity',
    blurb: 'Buy ECG prepaid units and keep the lights on.',
    accent: '#003399',
    tint: '#E7EEF8',
    glow: 'rgba(0,51,153,0.16)',
    icon: Zap,
    artwork: ecgArt,
    group: 'home',
    steps: [
      'This is for ECG prepaid units.',
      'Set the amount with the field, the slider, or a common value.',
      'Stay inside the minimum and maximum. The charge comes from your wallet.',
    ],
  },
  results: {
    title: 'Results checkers',
    blurb: 'Get WASSCE and BECE checker cards when you need them.',
    accent: '#5B21B6',
    tint: '#F3E8FF',
    glow: 'rgba(91,33,182,0.16)',
    icon: FileText,
    artwork: resultsArt,
    group: 'home',
    steps: [
      'Choose BECE or WASSCE.',
      'Set how many vouchers you need. Each one has a fixed price.',
      'The total is taken from your wallet.',
    ],
  },
}

function rankService(service) {
  const index = UTILITY_ORDER.indexOf(service)
  return index === -1 ? 99 : index
}

export function serviceMeta(service) {
  const key = String(service ?? '').toLowerCase()
  return (
    SERVICE_META[key] ?? {
      title: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Utility',
      blurb: 'Pay bills and buy digital services from your wallet.',
      accent: '#0B63F6',
      tint: '#E7F1FC',
      glow: 'rgba(11,99,246,0.16)',
      icon: Radio,
      artwork: null,
      group: 'home',
      steps: ['Review what is available.', 'Check the price or amount range.', 'Payment is taken from your wallet.'],
    }
  )
}

export function isServiceOpen(row) {
  return Boolean(row?.supported && row?.available)
}

export function mapUtilityCatalog(payload) {
  const data = payload && typeof payload === 'object' ? payload : {}
  const services = (Array.isArray(data.services) ? data.services : [])
    .map((row) => {
      const key = String(row?.service ?? '').toLowerCase()
      const meta = serviceMeta(key)
      return {
        key,
        orderType: row?.order_type ?? null,
        productType: row?.product_type ?? null,
        supported: Boolean(row?.supported),
        available: Boolean(row?.available),
        open: isServiceOpen(row),
        reason: row?.reason ? String(row.reason) : null,
        ...meta,
      }
    })
    .sort((left, right) => rankService(left.key) - rankService(right.key) || left.title.localeCompare(right.title))

  return {
    currency: data.currency || 'GHS',
    providerReachable: data.provider_reachable !== false,
    services,
    categories: data.categories && typeof data.categories === 'object' ? data.categories : {},
    networks: Array.isArray(data.networks) ? data.networks : [],
    plans: Array.isArray(data.plans) ? data.plans : [],
    airtime: data.airtime && typeof data.airtime === 'object' ? data.airtime : null,
    tv: data.tv && typeof data.tv === 'object' ? data.tv : null,
    ecg: data.ecg && typeof data.ecg === 'object' ? data.ecg : null,
    results: data.results && typeof data.results === 'object' ? data.results : null,
  }
}

export function openServiceCount(catalog) {
  return (catalog?.services ?? []).filter((row) => row.open).length
}

export function groupServices(services) {
  const rows = Array.isArray(services) ? services : []
  return UTILITY_GROUPS.map((group) => ({
    ...group,
    services: rows.filter((service) => service.group === group.id),
  })).filter((group) => group.services.length)
}

const TELCOS = {
  mtn: { label: 'MTN', image: Images.mtn, color: '#FFCC00', ink: '#8A6A00', tint: '#FFF8D6' },
  yello: { label: 'MTN', image: Images.mtn, color: '#FFCC00', ink: '#8A6A00', tint: '#FFF8D6' },
  'mtn mash up': { label: 'MTN Mashup', image: Images.mtn, color: '#FFCC00', ink: '#8A6A00', tint: '#FFF8D6' },
  telecel: { label: 'Telecel', image: Images.telecel, color: '#E30613', ink: '#E30613', tint: '#FDECEE', fit: 'contain' },
  at: { label: 'AT', image: Images.at, color: '#0033A0', ink: '#0033A0', tint: '#E7EEF8' },
  airteltigo: { label: 'AT', image: Images.at, color: '#0033A0', ink: '#0033A0', tint: '#E7EEF8' },
  glo: { label: 'Glo', image: Images.glo, color: '#00A651', ink: '#007A3D', tint: '#E7F8F0' },
}

const NETWORK_RANK = ['yello', 'mtn', 'mtn mash up', 'telecel', 'at', 'airteltigo', 'glo']

const TV_BRANDS = {
  dstv: { label: 'DStv', image: dstvArt, color: '#00A0E4', ink: '#0077A8', tint: '#E7F6FC', well: '#FFFFFF' },
  gotv: { label: 'GOtv', image: gotvArt, color: '#E10600', ink: '#B00000', tint: '#FDECEE', well: '#FFFFFF' },
  startimes: { label: 'StarTimes', image: startimesArt, color: '#F58220', ink: '#C45E00', tint: '#FFF3E6', well: '#FFFFFF' },
}

const CHECKERS = {
  bece: { label: 'BECE', image: beceArt, color: '#4C1D95', ink: '#4C1D95', tint: '#F3E8FF', bar: '#F5C518' },
  wassce: { label: 'WASSCE', image: wassceArt, color: '#4C1D95', ink: '#4C1D95', tint: '#F3E8FF', bar: '#F5C518' },
}

const CHECKER_RANK = ['bece', 'wassce']

function purchaseCap(value) {
  const cap = Number(value)
  if (!Number.isFinite(cap) || cap < 1) return null
  return Math.floor(cap)
}

function checkerBrand(type, name) {
  const key = String(type || name || '').trim().toLowerCase().replace(/[\s_-]+/g, '')
  const known = CHECKERS[key]
  if (known) return { key, ...known }
  const label = String(name || type || 'Checker').trim() || 'Checker'
  return { key, label, image: null, color: '#4C1D95', ink: '#4C1D95', tint: '#F3E8FF', bar: '#F5C518' }
}

function tvBrand(code, name) {
  const key = String(code || name || '').trim().toLowerCase().replace(/[\s_-]+/g, '')
  const known = TV_BRANDS[key]
  if (known) return known
  const label = String(name || code || 'TV').trim() || 'TV'
  return { label, image: null, color: '#E0232E', ink: '#E0232E', tint: '#FDECEE', well: '#FFFFFF' }
}

export function telcoMark(network) {
  const key = String(network ?? '').trim().toLowerCase()
  const known = TELCOS[key]
  if (known) return { key, ...known }
  const name = String(network ?? '').trim()
  return { key, label: name || 'Network', image: null, color: '#0B1F5B', ink: '#0B1F5B', tint: '#F3F6FB' }
}

function rankNetwork(network) {
  const index = NETWORK_RANK.indexOf(String(network ?? '').trim().toLowerCase())
  return index === -1 ? 50 : index
}

function mapPlan(plan) {
  const sizeGb = Number(plan?.size_gb)
  return {
    id: String(plan?.package_id ?? ''),
    network: plan?.network ?? '',
    size: plan?.size || '',
    sizeGb: Number.isFinite(sizeGb) ? sizeGb : Number.POSITIVE_INFINITY,
    price: plan?.price,
    available: plan?.available !== false,
    productType: plan?.product_type ?? '',
  }
}

function planGroups(catalog, productType) {
  const fromNetworks = (Array.isArray(catalog?.networks) ? catalog.networks : []).filter(
    (row) => row?.product_type === productType && Array.isArray(row.plans),
  )
  const source = fromNetworks.length
    ? fromNetworks
    : Object.entries(catalog?.categories && typeof catalog.categories === 'object' ? catalog.categories : {})
        .map(([network, plans]) => ({
          network,
          product_type: productType,
          plans: (Array.isArray(plans) ? plans : []).filter((plan) => plan?.product_type === productType),
        }))
        .filter((row) => row.plans.length)

  return source
    .map((row) => {
      const mark = telcoMark(row.network)
      return {
        id: String(row.network),
        label: mark.label,
        image: mark.image,
        color: mark.color,
        ink: mark.ink,
        tint: mark.tint,
        fit: mark.fit,
        plans: row.plans.map(mapPlan).sort((left, right) => left.sizeGb - right.sizeGb || Number(left.price) - Number(right.price)),
      }
    })
    .sort((left, right) => rankNetwork(left.id) - rankNetwork(right.id) || left.label.localeCompare(right.label))
}

export function serviceOffer(catalog, serviceKey) {
  const key = String(serviceKey ?? '').toLowerCase()
  const currency = catalog?.currency || 'GHS'

  if (key === 'data' || key === 'mashup') {
    return { kind: 'plans', service: key, currency, groups: planGroups(catalog, key === 'mashup' ? 'mashup' : 'data_bundle') }
  }

  if (key === 'airtime') {
    return {
      kind: 'networks',
      currency,
      items: (Array.isArray(catalog?.airtime?.networks) ? catalog.airtime.networks : []).map((row) => {
        const mark = telcoMark(row?.code || row?.name)
        return {
          id: String(row?.code ?? row?.name ?? ''),
          label: row?.name || mark.label,
          image: mark.image,
          color: mark.color,
          ink: mark.ink,
          tint: mark.tint,
          fit: mark.fit,
          min: row?.min_amount,
          max: row?.max_amount,
        }
      }),
    }
  }

  if (key === 'tv') {
    return {
      kind: 'bills',
      currency,
      items: (Array.isArray(catalog?.tv?.bill_types) ? catalog.tv.bill_types : []).map((row) => {
        const brand = tvBrand(row?.code, row?.name)
        return {
          id: String(row?.code ?? row?.name ?? ''),
          name: brand.label,
          image: brand.image,
          color: brand.color,
          ink: brand.ink,
          tint: brand.tint,
          well: brand.well,
          orderType: row?.order_type ?? '',
          min: row?.min_amount,
          max: row?.max_amount,
        }
      }),
    }
  }

  if (key === 'ecg') {
    return {
      kind: 'amount',
      currency,
      min: catalog?.ecg?.min_amount,
      max: catalog?.ecg?.max_amount,
      name: 'ECG',
      image: ecgLogo,
      color: '#003399',
      ink: '#002B7A',
      tint: '#E7EEF8',
      bar: '#F5C518',
    }
  }

  if (key === 'results') {
    return {
      kind: 'checkers',
      currency,
      maxQuantity: purchaseCap(catalog?.results?.max_quantity),
      items: (Array.isArray(catalog?.results?.checkers) ? catalog.results.checkers : [])
        .map((row) => {
          const brand = checkerBrand(row?.type, row?.name)
          return {
            id: String(row?.type ?? row?.name ?? ''),
            name: brand.label,
            image: brand.image,
            color: brand.color,
            ink: brand.ink,
            tint: brand.tint,
            bar: brand.bar,
            price: row?.unit_price,
            available: row?.available !== false,
            rank: CHECKER_RANK.indexOf(brand.key),
          }
        })
        .sort((left, right) => (left.rank === -1 ? 50 : left.rank) - (right.rank === -1 ? 50 : right.rank)),
    }
  }

  return { kind: 'empty', currency, groups: [], items: [] }
}

function quoteText(value) {
  const text = String(value ?? '').trim()
  return text || null
}

export function quotePayload(input) {
  const service = String(input?.service ?? '').toLowerCase()
  const body = { service }

  if (service === 'data' || service === 'mashup') {
    const packageId = quoteText(input?.packageId)
    if (packageId) body.package_id = packageId
  }

  if (service === 'airtime') {
    const network = quoteText(input?.network)
    if (network) body.network = network.toUpperCase()
    if (input?.amount != null && input.amount !== '') body.amount = Number(input.amount)
  }

  if (service === 'ecg') {
    if (input?.amount != null && input.amount !== '') body.amount = Number(input.amount)
  }

  if (service === 'tv') {
    const billType = quoteText(input?.billType)
    if (billType) body.bill_type = billType.toUpperCase()
    if (input?.amount != null && input.amount !== '') body.amount = Number(input.amount)
  }

  if (service === 'results') {
    const checkerType = quoteText(input?.checkerType)
    if (checkerType) body.checker_type = checkerType.toUpperCase()
    if (input?.quantity != null && input.quantity !== '') body.quantity = Number(input.quantity)
  }

  return body
}

export function purchasePayload({
  service,
  packageId,
  network,
  amount,
  billType,
  checkerType,
  quantity,
  method,
  phoneNumber,
  beneficiary,
  beneficiaries,
  contactGroupIds,
  customerPhone,
  accountName,
}) {
  const body = quotePayload({ service, packageId, network, amount, billType, checkerType, quantity })
  body.method = method === 'momo' ? 'momo' : 'wallet'
  const groups = (Array.isArray(contactGroupIds) ? contactGroupIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id))
  const phones = (Array.isArray(beneficiaries) ? beneficiaries : [])
    .map((phone) => String(phone ?? '').replace(/\s/g, ''))
    .filter(Boolean)
    .slice(0, 50)
  if (groups.length) {
    body.contact_group_ids = groups
  } else if (phones.length > 1) {
    body.beneficiaries = phones.join(',')
  } else {
    const who = String(phones[0] || beneficiary || '').replace(/\s/g, '')
    if (who) body.beneficiary = who
  }
  if (body.method === 'momo') {
    const phone = String(phoneNumber ?? '').replace(/\s/g, '')
    if (phone) body.phone_number = phone
  }
  if (body.service === 'ecg') {
    const mobile = String(customerPhone ?? '').replace(/\s/g, '')
    if (mobile) body.customer_phone = mobile
  }
  const name = String(accountName ?? '').trim()
  if ((body.service === 'ecg' || body.service === 'tv') && name) body.account_name = name
  return body
}

export function mapUtilityPurchase(data) {
  const row = data && typeof data === 'object' ? data : {}
  const nextUrl = String(row.next_action?.url || row.payment_link || '').trim()
  return {
    referenceId: quoteText(row.reference_id),
    status: quoteText(row.status),
    currency: quoteText(row.currency) || 'GHS',
    totalAmount: row.total_amount ?? row.amount ?? null,
    paymentLink: quoteText(row.payment_link),
    nextUrl: nextUrl || null,
  }
}

export function lookupPayload({ service, beneficiary, billType }) {
  const body = {
    service: String(service ?? '').toLowerCase(),
    beneficiary: String(beneficiary ?? '').trim(),
  }
  if (body.service === 'tv') {
    const type = String(billType ?? '').trim()
    if (type) body.bill_type = type.toUpperCase()
  }
  return body
}

export function mapUtilityLookup(data) {
  const row = data && typeof data === 'object' ? data : {}
  const amount = Number(row.validated_amount)
  return {
    service: quoteText(row.service),
    beneficiary: quoteText(row.beneficiary),
    customerName: quoteText(row.customer_name),
    validatedAmount: Number.isFinite(amount) ? amount : null,
  }
}

export function mapUtilityQuote(data) {
  const row = data && typeof data === 'object' ? data : {}
  return {
    service: quoteText(row.service),
    orderType: quoteText(row.order_type),
    productType: quoteText(row.product_type),
    name: quoteText(row.name) || 'Quote',
    network: quoteText(row.network),
    packageId: quoteText(row.package_id),
    size: quoteText(row.size),
    billType: quoteText(row.bill_type),
    checkerType: quoteText(row.checker_type),
    quantity: row.quantity == null || row.quantity === '' ? null : row.quantity,
    beneficiary: quoteText(row.beneficiary),
    amount: row.amount,
    currency: quoteText(row.currency) || 'GHS',
  }
}
