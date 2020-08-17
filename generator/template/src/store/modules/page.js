const state = {
  scrollTop: {}
}

const mutations = {
  SET_SCROLL_TOP: (state, payload) => {
    state.scrollTop[payload.name] = payload.scrollTop
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
