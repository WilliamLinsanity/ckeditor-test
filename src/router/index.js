import { createWebHistory, createRouter } from "vue-router";

// Frame
const Main = () => import('@/views/Main')

const mainPage = {
    path: '/',
    name: 'main',
    component: Main,
    redirect: 'editor',
    children: [
        {
          path: `editor`,
          name: 'editor',
          component: () => import('@/views/Index')
        },
        {
          path: `result`,
          name: 'Result',
          component: () => import('@/views/Result')
        },
    ]
}
const router = new createRouter({
  history: createWebHistory(),
    base: process.env.BASE_URL,
    routes: [
      mainPage,
    ]
  })
  export default router
