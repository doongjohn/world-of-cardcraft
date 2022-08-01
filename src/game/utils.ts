export function tuplesEqual<T, U>(x: [T, U], y: [T, U]) {
  if (x === null || y === null) return false
  if (x === undefined || y === undefined) return false
  return x.every((xVal, i) => xVal === y[i])
}
