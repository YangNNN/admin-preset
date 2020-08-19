import Layout from '@/frame/layout'

export default [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [
    {
      path: '/page/memberManage',
      component: () => import('@/pages/user'),
    }
  ]
}]
