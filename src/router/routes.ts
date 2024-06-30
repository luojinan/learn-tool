import type { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "root",
    redirect: { name: "Home" },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: {
          title: "主页"
        }
      },
      {
        path: "jap50yin",
        name: "jap50yin",
        component: () => import("@/views/jap50yin/index.vue"),
        meta: {
          title: "工具"
        }
      },
      {
        path: "write",
        name: "Write",
        component: () => import("@/views/write/index.vue"),
        meta: {
          title: "工具"
        }
      },
      {
        path: "income",
        name: "income",
        component: () => import("@/views/income/index.vue"),
        meta: {
          title: "工具"
        }
      },
      {
        path: "wumei",
        name: "wumei",
        component: () => import("@/views/wumei/index.vue"),
        meta: {
          title: "物美传单"
        }
      },
      {
        path: "readgh",
        name: "readgh",
        component: () => import("@/views/readgh/index.vue"),
        meta: {
          title: "readgh"
        }
      },
      {
        path: "readgh/detail",
        name: "readghdetail",
        component: () => import("@/views/readgh/detail/index.vue"),
        meta: {
          title: "readgh",
          noCache: true
        }
      },
      {
        path: "book",
        name: "book",
        component: () => import("@/views/book/index.vue"),
        meta: {
          title: "图书信息"
        }
      },
    ]
  }
];

export default routes;