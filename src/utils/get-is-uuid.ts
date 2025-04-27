/**
 * Проверяет, является ли строка UUID.
 */
export const getIsUuid = (value: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(value)
}
