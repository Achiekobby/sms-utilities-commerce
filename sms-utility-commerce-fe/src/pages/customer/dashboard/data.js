import { RiBarChartFill, RiChat3Fill, RiGroupFill, RiSendPlaneFill, RiWallet3Fill } from 'react-icons/ri'

// Illustrative figures matching the client dashboard reference, until live traffic is connected.

// `color` is the icon. `tint` is the soft tile behind it. `prefix` is a currency before the figure.
export const metrics = [
  {
    label: 'Total Campaigns',
    value: '128',
    change: 12,
    icon: RiChat3Fill,
    color: '#062047',
    tint: '#D6E4FA',
  },
  {
    label: 'Messages Sent',
    value: '245,892',
    change: 18,
    icon: RiSendPlaneFill,
    color: '#008859',
    tint: '#C8F3DE',
  },
  {
    label: 'Wallet Balance',
    prefix: 'GHS',
    value: '482,750',
    change: 5,
    icon: RiWallet3Fill,
    color: '#B34D00',
    tint: '#FFD0A8',
  },
  {
    label: 'Active Sender IDs',
    value: '12',
    change: 20,
    icon: RiGroupFill,
    color: '#0B63F6',
    tint: '#D6E6FF',
  },
  {
    label: 'Survey Responses',
    value: '8,421',
    change: 35,
    icon: RiBarChartFill,
    color: '#A81220',
    tint: '#F6C4CA',
  },
]

