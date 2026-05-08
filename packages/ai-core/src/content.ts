export function stringifyAiContent(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (
          typeof item === 'object' &&
          item !== null &&
          'text' in item &&
          typeof item.text === 'string'
        ) {
          return item.text
        }

        return JSON.stringify(item)
      })
      .join('')
  }

  if (content == null) {
    return ''
  }

  return String(content)
}
