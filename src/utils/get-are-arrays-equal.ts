import _ from 'lodash'

/**
 * Проверяет, равны ли два массива.
 */
export const getAreArraysEqual = (arr1: unknown, arr2: unknown): boolean => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
  if (arr1.length !== arr2.length) return false

  return arr1.every((item, index) => _.isEqual(item, arr2[index]))
}
