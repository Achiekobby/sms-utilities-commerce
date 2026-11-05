export const permissionItems = [
  {
    id: 'camera',
    query: 'camera',
    title: 'Camera',
    description: 'Allow the app to use your camera for photos, video, or scanning.',
  },
  {
    id: 'microphone',
    query: 'microphone',
    title: 'Microphone',
    description: 'Allow microphone access for audio recording and calls.',
  },
  {
    id: 'location',
    query: 'geolocation',
    title: 'Location',
    description: 'Allow the app to access your location when needed.',
  },
  {
    id: 'notifications',
    query: 'notifications',
    title: 'Notifications',
    description: 'Receive important alerts, messages, and updates.',
  },
  {
    id: 'files',
    query: null,
    title: 'Photos & files',
    description: 'Allow access to selected photos and files for uploads.',
  },
  {
    id: 'contacts',
    query: null,
    title: 'Contacts',
    description: 'Allow access to contacts when using contact-related features.',
  },
  {
    id: 'calendar',
    query: null,
    title: 'Calendar',
    description: 'Allow the app to read or create calendar events.',
  },
]

function fromState(state) {
  if (state === 'granted') return 'allowed'
  if (state === 'denied') return 'blocked'
  if (state === 'prompt') return 'ask'
  return 'unavailable'
}

export async function readBrowserPermission(name) {
  if (!name || !navigator.permissions?.query) return 'unavailable'
  try {
    const status = await navigator.permissions.query({ name })
    return fromState(status.state)
  } catch {
    return 'unavailable'
  }
}

export async function readBrowserPermissions() {
  const entries = await Promise.all(
    permissionItems.map(async (item) => [item.id, item.query ? await readBrowserPermission(item.query) : 'unavailable']),
  )
  return Object.fromEntries(entries)
}

export async function requestBrowserPermission(id) {
  if (id === 'notifications' && 'Notification' in window) {
    const result = await Notification.requestPermission()
    return fromState(result)
  }

  if ((id === 'camera' || id === 'microphone') && navigator.mediaDevices?.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: id === 'camera',
      audio: id === 'microphone',
    })
    stream.getTracks().forEach((track) => track.stop())
    return readBrowserPermission(id)
  }

  if (id === 'location' && navigator.geolocation) {
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 60000, timeout: 8000 })
    })
    return readBrowserPermission('geolocation')
  }

  return 'unavailable'
}

export function currentDevice() {
  const agent = navigator.userAgent
  const browser = /Edg\//.test(agent)
    ? 'Edge'
    : /Chrome\//.test(agent)
      ? 'Chrome'
      : /Firefox\//.test(agent)
        ? 'Firefox'
        : /Safari\//.test(agent)
          ? 'Safari'
          : 'This browser'
  const system = /Windows/.test(agent)
    ? 'Windows'
    : /Mac OS/.test(agent)
      ? 'macOS'
      : /Android/.test(agent)
        ? 'Android'
        : /iPhone|iPad/.test(agent)
          ? 'iOS'
          : /Linux/.test(agent)
            ? 'Linux'
            : 'this device'

  return { label: `${browser} on ${system}` }
}
