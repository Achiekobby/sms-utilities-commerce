import templateUrl from '../../../../assets/docs/contacts-upload-template.xlsx?url'

const templateName = 'contacts-upload-template.xlsx'

// Hands the user the Excel file shipped in src/assets/docs.
export function downloadTemplate() {
  const link = document.createElement('a')
  link.href = templateUrl
  link.download = templateName
  document.body.appendChild(link)
  link.click()
  link.remove()
}
