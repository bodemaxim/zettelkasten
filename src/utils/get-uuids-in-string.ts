/**
 * Возвращает найденные в тексте uuid.
 */
export const getUuidsInString = (str: string): string[] => {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const matches = Array.from(str.matchAll(regex))
  const uuids = matches.map((match) => match[2])

  return uuids
}
