const req = require.context('./svg', false, /\.svg$/)
export const keys = req.keys()
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
