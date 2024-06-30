import {
  type RouteLocationNormalized,
  createRouter,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
// import setPageTitle from "@/utils/set-page-title";

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export interface toRouteType extends RouteLocationNormalized {
  meta: {
    title?: string
    noCache?: boolean
  }
}

router.beforeEach((to: toRouteType, from, next) => {
  // 页面 title
  // setPageTitle(to.meta.title);
  next()
})

router.afterEach(() => {
})

export default router
