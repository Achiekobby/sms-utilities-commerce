export const ghanaRegions = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
]

export const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const OTHER_CITY = 'Other'

// Popular towns and cities for each region. Keep the stored city value as the
// place name itself; "Other" is only a UI choice that opens a free-text field.
export const citiesByRegion = {
  Ahafo: ['Goaso', 'Hwidiem', 'Kukuom', 'Duayaw Nkwanta', 'Mim', 'Bechem'],
  Ashanti: ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong', 'Bekwai', 'Offinso', 'Ejura'],
  Bono: ['Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Wenchi', 'Nsoatre', 'Fiapre'],
  'Bono East': ['Techiman', 'Kintampo', 'Nkoranza', 'Atebubu', 'Yeji', 'Prang'],
  Central: ['Cape Coast', 'Winneba', 'Kasoa', 'Elmina', 'Dunkwa-on-Offin', 'Assin Fosu', 'Mankessim'],
  Eastern: ['Koforidua', 'Nkawkaw', 'Suhum', 'Akim Oda', 'Asamankese', 'Aburi', 'Somanya', 'Nsawam'],
  'Greater Accra': [
    'Accra',
    'Tema',
    'Madina',
    'Ashaiman',
    'Teshie',
    'Nungua',
    'Dansoman',
    'Adenta',
    'Lapaz',
    'Dodowa',
  ],
  'North East': ['Nalerigu', 'Walewale', 'Gambaga', 'Langbensi', 'Chereponi'],
  Northern: ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla', 'Tolon', 'Kumbungu'],
  Oti: ['Dambai', 'Jasikan', 'Kadjebi', 'Nkwanta', 'Kete Krachi'],
  Savannah: ['Damongo', 'Bole', 'Salaga', 'Sawla', 'Buipe'],
  'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo', 'Zebilla', 'Paga', 'Bongo'],
  'Upper West': ['Wa', 'Lawra', 'Jirapa', 'Nadowli', 'Tumu', 'Lambussie'],
  Volta: ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Kpando', 'Anloga', 'Sokode'],
  Western: ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Prestea', 'Agona Nkwanta'],
  'Western North': ['Sefwi Wiawso', 'Bibiani', 'Enchi', 'Juaboso', 'Asawinso'],
}

export function citiesForRegion(region) {
  return citiesByRegion[region] ?? []
}

export function isListedCity(region, city) {
  if (!city) return false
  return citiesForRegion(region).some((item) => item.toLowerCase() === city.trim().toLowerCase())
}

// Saved/API city values that are not in the popular list are treated as custom ("Other").
export function isCustomCity(region, city) {
  const trimmed = String(city ?? '').trim()
  return Boolean(trimmed) && !isListedCity(region, trimmed)
}
