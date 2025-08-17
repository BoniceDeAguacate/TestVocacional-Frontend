import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

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
      meta: { layout: 'login' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/Register.vue'),
      meta: { layout: 'login' }
    },
    {
      path: '/aspirante',
      component: MainLayout,
      meta: { requiresAuth: true, layout: 'aspirante' },
      children: [
        {
          path: '',
          name: 'aspirante-home',
          component: () => import('../views/aspirante/Home.vue'),
        },
        {
          path: 'test',
          name: 'aspirante-test',
          component: () => import('../views/aspirante/TestVocacional.vue'),
        },
        {
          path: 'resultados',
          name: 'aspirante-resultados',
          component: () => import('../views/aspirante/Resultados.vue'),
        }
      ]
    },
    // Ruta de compatibilidad (se puede eliminar después)
    {
      path: '/test-vocacional',
      redirect: '/aspirante/test'
    }
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
