const routes = [
  {
    path: '/index',
    component: () => import('@/pages/index.vue')
  }
]

const router = new VueRouter({
  routes: routes
})

export default router