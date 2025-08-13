import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/Register.vue'),
    },
    {
      path: '/aspirante',
      name: 'aspirante-home',
      component: () => import('../views/aspirante/Home.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Guard para rutas protegidas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const curp = localStorage.getItem('curp');
  
  if (to.meta.requiresAuth && (!token || !curp)) {
    next('/login');
  } else {
    next();
  }
});

export default router
