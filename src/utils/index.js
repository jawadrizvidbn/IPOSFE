export const checkPermission = (permissionName, user) => {
  return user?.role === 'admin' ? user?.permissions?.includes(permissionName) : true
}
