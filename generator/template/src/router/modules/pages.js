import Layout from '@/frame/layout'

export default [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [
    {
      path: '/user',
      component: () => import('@/pages/user'),
    }
  ]
}]
