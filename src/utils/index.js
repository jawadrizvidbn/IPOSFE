export const checkPermission = (permissionName, user) => {
  return user?.role === 'admin' ? user?.permissions?.includes(permissionName) : true
}

export const removeKeys = (obj, keys) => {
  let newObj = Object.assign({}, obj)
  for (let key of keys) {
    delete newObj[key]
  }
  return newObj
}

export function sum(numbers) {
  return numbers.reduce((acc, num) => acc + num, 0)
}

export function zeroTotals(data) {
  return data.map(record =>
    Object.fromEntries(
      Object.entries(record).map(([key, value]) => {
        if (/Total (Cost|Selling)$/.test(key) && typeof value === 'number' && value < 0) {
          return [key, 0]
        }
        return [key, value]
      })
    )
  )
}
