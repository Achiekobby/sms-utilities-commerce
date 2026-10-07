import { RiBarChartFill, RiChat3Fill, RiGroupFill, RiSendPlaneFill, RiWallet3Fill } from 'react-icons/ri'

// Illustrative figures matching the client dashboard reference, until live traffic is connected.

// `color` is the icon. `tint` is the soft tile behind it. `prefix` is a currency before the figure.
export const metrics = [
  {
    label: 'Total Campaigns',
    value: '128',
    change: 12,
    icon: RiChat3Fill,
    color: '#07153F',
    tint: '#C9D5F0',
  },
  {
    label: 'Messages Sent',
    value: '245,892',
    change: 18,
    icon: RiSendPlaneFill,
    color: '#08632C',
    tint: '#B7E4C7',
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
    color: '#0C56B0',
    tint: '#C3DCF6',
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

export const recentCampaigns = [
  { name: 'Product Launch', type: 'Promotional', messages: 12450, rate: '98.7%', status: 'Completed', created: 'Mar 28, 2024' },
  { name: 'Customer Feedback', type: 'Survey', messages: 8920, rate: '98.1%', status: 'Completed', created: 'Mar 25, 2024' },
  { name: 'Utility Bill Reminder', type: 'Transactional', messages: 45230, rate: '99.2%', status: 'Completed', created: 'Mar 20, 2024' },
  { name: 'Holiday Promo', type: 'Promotional', messages: 22410, rate: '97.8%', status: 'Completed', created: 'Mar 15, 2024' },
  { name: 'KYC Verification', type: 'Transactional', messages: 18992, rate: '99.5%', status: 'In Progress', created: 'Mar 12, 2024' },
]

export const scheduledMessages = [
  { message: 'Payment Reminder', recipients: 5200, sendTime: 'Mar 30, 9:00 AM', status: 'Scheduled' },
  { message: 'Promo Campaign', recipients: 12000, sendTime: 'Mar 31, 10:00 AM', status: 'Scheduled' },
  { message: 'Survey Follow-up', recipients: 3500, sendTime: 'Mar 31, 2:00 PM', status: 'Scheduled' },
  { message: 'Event Invitation', recipients: 8400, sendTime: 'Apr 1, 9:00 AM', status: 'Scheduled' },
  { message: 'Feedback Request', recipients: 6200, sendTime: 'Apr 1, 4:00 PM', status: 'Scheduled' },
]
