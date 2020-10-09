import Layout from '@/frame/layout'

export default [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [
    {
      path: '/edu/config/class-type',
      component: () => import('@/pages/education/config/class-type/index.vue'),
    },
    {
      path: '/edu/student/student',
      component: () => import('@/pages/education/student/student/index.vue')
    }
  ]
}]
