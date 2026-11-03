// Runs the spreadsheet checker in its own thread so reading and checking a very large sheet never freezes
// the page. All of the logic lives in sheetCheck.js; this file only connects it to postMessage.
//
//   page   -> worker  { type: 'analyze', buffer, fileName }   (buffer is transferred, not copied)
//   page   -> worker  { type: 'clean' }                        keep only the good rows
//   worker -> page    progress | result | problem | failure | cleaned   (see sheetCheck.js)

import { createSheetChecker } from './sheetCheck'

const checker = createSheetChecker((message, transfer = []) => self.postMessage(message, transfer))

self.onmessage = ({ data }) => checker.handle(data)
