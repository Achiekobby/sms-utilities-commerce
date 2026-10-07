function createToken() {
  return crypto.randomUUID()
}

export function passwordlessSession(identifier, intent) {
  return {
    user: {
      identifier,
      intent,
      provider: 'passwordless',
    },
    token: createToken(),
    verified: false,
  }
}

// A new account. Business accounts also carry the business name and address.
export function signupSession(profile) {
  const { accountType, firstName, lastName, email, phone, businessName, address } = profile

  return {
    user: {
      identifier: email,
      intent: 'signup',
      provider: 'passwordless',
      accountType,
      firstName,
      lastName,
      email,
      phone,
      ...(accountType === 'business' ? { businessName, address } : {}),
    },
    token: createToken(),
    verified: false,
  }
}

export function googleSession({ accountType } = {}) {
  return {
    user: {
      name: 'Google account',
      provider: 'google',
      ...(accountType ? { accountType } : {}),
    },
    token: createToken(),
    verified: true,
  }
}
