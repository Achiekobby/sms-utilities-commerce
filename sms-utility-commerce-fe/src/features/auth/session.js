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
