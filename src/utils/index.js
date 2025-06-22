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
