// The one place the page hands a checked file over to be imported.
//
// `formData` is built from the real <form>, so it already carries the file the page is showing
// (the original, or the cleaned copy) under the "file" field, plus `groupId`.
//
// Until the contacts API exists this resolves locally with the number of contacts that passed the
// check. To connect the backend, replace the body with a POST of `formData` and return the count
// the server reports; nothing else on the page needs to change.
export async function importContacts({ formData, expected }) {
  void formData
  await new Promise((resolve) => setTimeout(resolve, 900))
  return { added: expected }
}
