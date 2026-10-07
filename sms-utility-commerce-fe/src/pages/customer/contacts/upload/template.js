import { MAX_ROWS, columns } from './rules'

// Builds the template in the browser, so it always matches the rules the checker enforces.
// SheetJS is loaded only when someone asks for the template, keeping it out of the main bundle.
export async function downloadTemplate() {
  const XLSX = await import('xlsx')

  const contacts = XLSX.utils.aoa_to_sheet([columns.map((column) => column.label)])
  contacts['!cols'] = columns.map((column) => ({ wch: column.width }))

  const guide = XLSX.utils.aoa_to_sheet([
    ['How to fill in the Contacts sheet'],
    [],
    ['Column', 'Required?', 'What to enter', 'Example'],
    ...columns.map((column) => [column.label, column.required ? 'Yes' : 'No', column.help, column.example]),
    [],
    ['Good to know'],
    ['• Keep the column names in row 1 exactly as they are, and put one contact on each row.'],
    ['• Fill in the “Contacts” sheet, the first tab. This tab is only a guide.'],
    ['• Blank rows are skipped, so gaps will not cause problems.'],
    ['• Each phone number can appear once. Repeats are flagged.'],
    [`• Upload up to ${MAX_ROWS.toLocaleString('en-US')} contacts at a time, saved as an .xlsx file.`],
  ])
  guide['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 70 }, { wch: 26 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, contacts, 'Contacts')
  XLSX.utils.book_append_sheet(workbook, guide, 'How to fill this in')
  XLSX.writeFile(workbook, 'utilisms-contacts-template.xlsx')
}
