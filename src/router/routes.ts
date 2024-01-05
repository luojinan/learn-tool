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
      }
    ]
  }
];

export default routes;