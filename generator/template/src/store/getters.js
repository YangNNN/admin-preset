const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  totalMenus: state => state.user.totalMenus,
  permissionMenus: state => state.user.permissionMenus,
  name: state => state.user.name,
  userInfo: state => state.user.userInfo,
  errorLogs: state => state.errorLog.logs
}
export default getters
