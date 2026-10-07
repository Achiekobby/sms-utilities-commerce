// Runs in its own thread so reading and checking a very large sheet never freezes the page.
//
// Protocol
//   page   -> worker  { type: 'analyze', buffer, fileName }   (buffer is transferred, not copied)
//   worker -> page    { type: 'progress', stage, percent, done, total }
//   worker -> page    { type: 'result', result }    every row was checked
//   worker -> page    { type: 'problem', problem }  the file itself cannot be used (missing columns, too big…)
//   worker -> page    { type: 'failure', message }  the file could not be read at all
//   page   -> worker  { type: 'clean' }                       keep only the good rows
//   worker -> page    { type: 'cleaned', buffer, name, kept, removed }
//
// Memory is kept low by reading the sheet in dense mode, never styling or formatting cells, capping the
// rows read, and holding only plain arrays. After 'analyze' the worker keeps the parsed rows so 'clean'
// does not have to read the file again; the page terminates the worker as soon as it is no longer needed.

import * as XLSX from 'xlsx'
import { MAX_ROWS, NAME_MAX, columns, emailPattern, normalizeGhanaPhone } from './rules'

const PROGRESS_EVERY = 2000

let session = null

function send(message, transfer = []) {
  self.postMessage(message, transfer)
}

const normalizeHeader = (value) =>
  String(value ?? '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

// Cells arrive as strings, numbers or null. Phone numbers are often stored as numbers.
function text(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function isBlank(row) {
  if (!row) return true
  for (let index = 0; index < row.length; index += 1) {
    const value = row[index]
    if (value !== null && value !== undefined && String(value).trim() !== '') return false
  }
  return true
}

const preview = (value) => (value.length > 40 ? `${value.slice(0, 40)}…` : value)

function locateColumns(headerRow) {
  const headers = headerRow.map(normalizeHeader)
  const found = {}
  const missing = []

  columns.forEach((column) => {
    const index = headers.findIndex((header) => column.aliases.includes(header))
    if (index === -1) {
      if (column.required) missing.push(column.label)
    } else {
      found[column.key] = index
    }
  })

  return { found, missing, headers }
}

function analyze(buffer, fileName) {
  // An .xlsx file is a zip archive. Checking the signature rejects renamed CSVs, old .xls files and
  // password-protected workbooks, which SheetJS would otherwise try to read as something else.
  const signature = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength))
  const isZip = signature[0] === 0x50 && signature[1] === 0x4b && signature[2] === 0x03 && signature[3] === 0x04
  if (!isZip) {
    send({
      type: 'failure',
      message:
        "This doesn't look like a modern Excel (.xlsx) file. If it is an older .xls file or is password-protected, open it in Excel and save it as “Excel Workbook (.xlsx)”.",
    })
    return
  }

  send({ type: 'progress', stage: 'Reading your file…', percent: 0, done: 0, total: 0 })

  const workbook = XLSX.read(buffer, {
    type: 'array',
    dense: true,
    sheetRows: MAX_ROWS + 3,
    cellFormula: false,
    cellHTML: false,
    cellNF: false,
    cellStyles: false,
    cellText: false,
  })

  const sheetName = workbook.SheetNames[0]
  const sheet = sheetName ? workbook.Sheets[sheetName] : null
  if (!sheet || !sheet['!ref']) {
    send({ type: 'problem', problem: { code: 'empty', title: 'The sheet is empty', detail: 'We could not find any rows in the first sheet of this file.' } })
    return
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, blankrows: true, defval: null })
  const headerRowNumber = XLSX.utils.decode_range(sheet['!ref']).s.r + 1

  // Formatting often leaves hundreds of blank rows at the bottom of a sheet. They are not data.
  let last = rows.length - 1
  while (last > 0 && isBlank(rows[last])) last -= 1
  const trailingBlank = rows.length - 1 - last
  rows.length = last + 1

  const { found, missing, headers } = locateColumns(rows[0] ?? [])
  if (missing.length) {
    send({
      type: 'problem',
      problem: {
        code: 'missing-columns',
        title: `We couldn't find the ${missing.map((name) => `“${name}”`).join(' and ')} column${missing.length > 1 ? 's' : ''}`,
        detail:
          'The first row of your sheet should hold the column names. Download the template to see the layout, or rename the columns in your file to match.',
        found: headers.filter(Boolean),
      },
    })
    return
  }

  const dataRows = rows.length - 1
  if (dataRows < 1) {
    send({ type: 'problem', problem: { code: 'no-rows', title: 'There are no contacts under the column names', detail: 'Add at least one contact below the first row and upload the file again.' } })
    return
  }
  if (dataRows > MAX_ROWS) {
    send({
      type: 'problem',
      problem: {
        code: 'too-many-rows',
        title: `This file has more than ${MAX_ROWS.toLocaleString('en-US')} contacts`,
        detail: `Please split it into smaller files of up to ${MAX_ROWS.toLocaleString('en-US')} contacts each and upload them one at a time.`,
      },
    })
    return
  }

  const firstNameAt = found.firstName
  const lastNameAt = found.lastName
  const phoneAt = found.phone
  const emailAt = found.email

  const seen = new Map()
  const valid = []
  const errors = []
  const issueCounts = {}
  let empty = 0

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]

    if (isBlank(row)) {
      empty += 1
    } else {
      const rowNumber = headerRowNumber + index
      const firstName = text(row[firstNameAt])
      const lastName = lastNameAt === undefined ? '' : text(row[lastNameAt])
      const phone = text(row[phoneAt])
      const email = emailAt === undefined ? '' : text(row[emailAt])
      const issues = []

      if (!firstName) issues.push({ code: 'missing-first-name', field: 'First Name', message: 'First name is empty.' })
      if (firstName.length > NAME_MAX || lastName.length > NAME_MAX) {
        issues.push({ code: 'name-too-long', field: 'Name', message: `Names can be at most ${NAME_MAX} characters.` })
      }

      let normalized = null
      if (!phone) {
        issues.push({ code: 'missing-phone', field: 'Phone Number', message: 'Phone number is empty.' })
      } else {
        normalized = normalizeGhanaPhone(phone)
        if (!normalized) {
          issues.push({
            code: 'invalid-phone',
            field: 'Phone Number',
            message: `“${preview(phone)}” is not a valid Ghana mobile number.`,
          })
        } else if (seen.has(normalized)) {
          issues.push({
            code: 'duplicate-phone',
            field: 'Phone Number',
            message: `Same number as row ${seen.get(normalized)}.`,
          })
        }
      }

      if (email && !emailPattern.test(email)) {
        issues.push({ code: 'invalid-email', field: 'Email', message: `“${preview(email)}” is not a valid email address.` })
      }

      if (issues.length) {
        errors.push({
          row: rowNumber,
          name: preview(`${firstName} ${lastName}`.trim()),
          phone: preview(phone),
          issues,
        })
        issues.forEach((issue) => {
          issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1
        })
      } else {
        // Only fully valid rows claim a number, so removing the bad rows can never orphan a duplicate.
        seen.set(normalized, rowNumber)
        valid.push(index)
      }
    }

    if (index % PROGRESS_EVERY === 0) {
      send({
        type: 'progress',
        stage: 'Checking your contacts…',
        percent: Math.round((index / rows.length) * 100),
        done: index,
        total: dataRows,
      })
    }
  }

  session = { rows, valid, sheetName, fileName }

  send({
    type: 'result',
    result: {
      fileName,
      sheetName,
      total: dataRows,
      valid: valid.length,
      failed: errors.length,
      empty,
      trailingBlank,
      errors,
      issueCounts,
    },
  })
}

function clean() {
  if (!session) {
    send({ type: 'failure', message: 'The file is no longer loaded. Please upload it again.' })
    return
  }

  const { rows, valid, sheetName, fileName } = session
  const kept = [rows[0], ...valid.map((index) => rows[index])]

  const sheet = XLSX.utils.aoa_to_sheet(kept)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31))
  const written = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  // Only a plain ArrayBuffer can be handed to the page without copying.
  const buffer =
    written instanceof ArrayBuffer
      ? written
      : written.buffer.slice(written.byteOffset, written.byteOffset + written.byteLength)

  const base = fileName.replace(/\.xlsx$/i, '')
  const removed = rows.length - 1 - valid.length
  session = null

  send({ type: 'cleaned', buffer, name: `${base}-cleaned.xlsx`, kept: valid.length, removed }, [buffer])
}

self.onmessage = ({ data }) => {
  try {
    if (data.type === 'analyze') analyze(data.buffer, data.fileName)
    else if (data.type === 'clean') clean()
  } catch {
    send({
      type: 'failure',
      message: "We couldn't read this file. It may be damaged. Try opening it in Excel, saving it again as .xlsx, and uploading the new copy.",
    })
  }
}
