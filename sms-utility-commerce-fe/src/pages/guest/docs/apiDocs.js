const client = {
  id: 1,
  first_name: null,
  last_name: null,
  email: 'owner@example.com',
  phone_number: '233200000000',
  account_type: 'business',
  business_name: 'Cellogent',
  status: 'active',
  is_verified: true,
  profile_image: 'https://example.com/profiles/client.png',
}

const celloBot = {
  id: 2,
  name: 'CelloBot',
  client_id: 1,
  status: 'rejected',
  approved_at: '2026-11-05 17:36:46',
  rejected_at: '2026-11-05 17:40:04',
  rejection_reason: 'You cannot use this sender id',
  created_at: '2026-10-30 15:46:02',
  client,
}

export const listSenderIdsResponse = {
  in_error: false,
  status_code: '200',
  message: 'Sender IDs loaded.',
  reason: 'success',
  data: [
    {
      id: 5,
      name: 'CELLOGENT',
      client_id: 1,
      status: 'approved',
      approved_at: '2026-11-09 14:10:54',
      rejected_at: null,
      rejection_reason: null,
      created_at: '2026-11-09 14:10:27',
      client,
    },
    {
      ...celloBot,
    },
  ],
  pagination: {
    current_page: 1,
    per_page: 15,
    total: 2,
    last_page: 1,
  },
  point_in_time: '2026-11-20 13:37:44',
}

const pointInTime = '2026-11-20 13:37:44'

function envelope({ status, message, reason, data = null, pagination, at = pointInTime }) {
  return {
    in_error: !String(status).startsWith('2'),
    status_code: status,
    message,
    reason,
    data,
    ...(pagination ? { pagination } : {}),
    point_in_time: at,
  }
}

function sharedErrors({ forbidden, notFound, validation }) {
  return [
    {
      status: '401',
      title: 'Unauthenticated',
      detail: 'The API key is missing, expired, or not a Bearer token.',
      body: envelope({ status: '401', message: 'Unauthenticated.', reason: 'unauthenticated' }),
    },
    {
      status: '403',
      title: 'Forbidden',
      detail: forbidden,
      body: envelope({ status: '403', message: 'This action is unauthorized.', reason: 'forbidden' }),
    },
    notFound,
    validation,
    {
      status: '429',
      title: 'Too many requests',
      detail: 'The key has sent more requests than the limit allows.',
      body: envelope({ status: '429', message: 'Too many attempts. Wait a moment, then try again.', reason: 'too_many_requests' }),
    },
    {
      status: '500',
      title: 'Server error',
      detail: 'The request could not be completed. Try again later.',
      body: envelope({ status: '500', message: 'Something went wrong. Try again.', reason: 'server_error' }),
    },
  ].filter(Boolean)
}

export const senderIdResponses = [
  {
    status: '200',
    title: 'Sender IDs found',
    detail: 'The account has at least one sender ID on this page.',
    body: listSenderIdsResponse,
  },
  {
    status: '200',
    title: 'Nothing found',
    detail: 'The request succeeded and the account has no sender IDs. data is an empty list.',
    body: envelope({
      status: '200',
      message: 'Sender IDs loaded.',
      reason: 'success',
      data: [],
      pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1 },
    }),
  },
  ...sharedErrors({
    forbidden: 'The key is valid, but this account cannot read sender IDs.',
    notFound: {
      status: '404',
      title: 'Not found',
      detail: 'The requested page does not exist.',
      body: envelope({ status: '404', message: 'Sender IDs not found.', reason: 'not_found' }),
    },
    validation: {
      status: '422',
      title: 'Validation failed',
      detail: 'A query value is not acceptable, such as a page below 1.',
      body: envelope({
        status: '422',
        message: 'Validation failed.',
        reason: 'validation_failed',
        data: { page: ['The page must be at least 1.'] },
      }),
    },
  }),
]

const senderIdRecord = {
  ...celloBot,
}

export const showSenderIdResponses = [
  {
    status: '200',
    title: 'Sender ID loaded',
    detail: 'The id in the path matches a sender ID on this account.',
    body: envelope({
      status: '200',
      message: 'Sender ID loaded.',
      reason: 'success',
      data: senderIdRecord,
      at: '2026-11-20 13:39:16',
    }),
  },
  {
    status: '404',
    title: 'Nothing found',
    detail: 'No sender ID exists for that id on this account.',
    body: envelope({
      status: '404',
      message: 'Sender ID not found.',
      reason: 'not_found',
      at: '2026-11-20 13:39:16',
    }),
  },
  ...sharedErrors({ forbidden: 'The key is valid, but this account cannot read this sender ID.' }),
]

export const createSenderIdBody = {
  name: 'Cellance',
}

export const createSenderIdResponses = [
  {
    status: '201',
    title: 'Submitted for approval',
    detail: 'The sender ID is created with status pending until it is reviewed.',
    body: envelope({
      status: '201',
      message: 'Sender ID submitted for approval.',
      reason: 'created',
      data: {
        id: 11,
        name: 'Cellance',
        client_id: 1,
        status: 'pending',
        approved_at: null,
        rejected_at: null,
        rejection_reason: null,
        created_at: '2026-11-20 13:43:51',
        client,
      },
      at: '2026-11-20 13:43:51',
    }),
  },
  ...sharedErrors({
    forbidden: 'The key is valid, but this account cannot create a sender ID.',
    validation: {
      status: '422',
      title: 'Validation failed',
      detail: 'The name is missing or breaks a sender ID rule.',
      body: envelope({
        status: '422',
        message: 'Validation failed.',
        reason: 'validation_failed',
        data: { name: ['Sender ID is required.'] },
      }),
    },
  }),
]

export const docGroups = [
  {
    id: 'sender-ids',
    title: 'Sender ID management',
    summary: 'Create, retrieve, and manage sender IDs for Ghana. A sender ID is the name recipients see on their phone.',
    endpoints: [
      {
        id: 'list-sender-ids',
        name: 'List sender IDs',
        method: 'GET',
        path: '/api/v1/sender-ids',
        description: 'Returns the sender IDs on the authenticated account, one page at a time.',
        query: [
          { name: 'page', type: 'integer', detail: 'Page number. Defaults to 1.' },
          { name: 'per_page', type: 'integer', detail: 'Number of sender IDs per page. The sample uses 15.' },
        ],
        fields: [
          { name: 'id', detail: 'Sender ID record.' },
          { name: 'name', detail: 'The name recipients see as the sender.' },
          { name: 'status', detail: 'Review state. pending is waiting, approved can be used, and rejected cannot.' },
          { name: 'approved_at', detail: 'When the name was approved, or null.' },
          { name: 'rejected_at', detail: 'When the name was rejected, or null.' },
          { name: 'rejection_reason', detail: 'Why a rejected name cannot be used, or null.' },
          { name: 'created_at', detail: 'When the sender ID was submitted.' },
          { name: 'client', detail: 'The account that owns the sender ID.' },
        ],
        responses: senderIdResponses,
      },
      {
        id: 'show-sender-id',
        name: 'Get a sender ID',
        method: 'GET',
        path: '/api/v1/sender-ids/{id}',
        description: 'Returns one sender ID by its ID. The sample loads id 2.',
        params: [{ name: 'id', type: 'integer', detail: 'The unique ID of the sender ID. The sample uses 2.' }],
        responses: showSenderIdResponses,
      },
      {
        id: 'create-sender-id',
        name: 'Create a sender ID',
        method: 'POST',
        path: '/api/v1/sender-ids',
        description: 'Submits a sender name for review. It stays pending until it is approved. The name follows the same rules as the add-sender form.',
        body: createSenderIdBody,
        fields: [{ name: 'name', type: 'string', required: true, detail: 'Sender name to submit. 11 characters or fewer. The sample uses Cellance.' }],
        rules: [
          { rule: 'Sender ID is required.', example: 'Cellance', avoid: '' },
          { rule: 'Maximum 11 characters.', example: 'UTILISMS', avoid: 'UTILISMS123' },
          { rule: 'Must start with a letter. No space at the start or the end.', example: 'Cellance', avoid: ' Cellance' },
          { rule: 'Letters, numbers, and single spaces only. No symbols.', example: 'UTILISMS', avoid: 'UTILISMS!123' },
          { rule: 'Use one space between words.', example: 'MENSAH MKT', avoid: 'MENSAH  MKT' },
          { rule: 'Must include at least one letter. Numbers alone are not allowed.', example: 'UTILISMS123', avoid: '1234567890' },
          { rule: 'Use a business name or a recognizable brand name.', example: 'UTILISMS', avoid: '1234567890' },
          { rule: 'Telco names, bank service names, and status messages are not allowed.', example: 'UTILISMS', avoid: 'MTN, Telecel, AT, Access Bank' },
          { rule: 'Phrases such as MTN, MoMo, and Telecel Cash are not allowed.' },
        ],
        responses: createSenderIdResponses,
      },
    ],
  },
  {
    id: 'sms',
    title: 'SMS management',
    summary: 'Send messages and read delivery results.',
    endpoints: [],
  },
]
