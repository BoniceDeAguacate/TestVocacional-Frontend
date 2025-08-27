import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const token = localStorage.getItem('token')
        const userRole = localStorage.getItem('userRole')
        
        if (token) {
          // Si el usuario está logueado, redirigir según su rol
          return userRole === 'admin' ? '/admin' : '/aspirante'
        } else {
          // Si no está logueado, ir al login
          return '/login'
        }
      },
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
    // Rutas de administración
    {
      path: '/admin',
      component: MainLayout,
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Admin.vue'),
        },
        {
            path: 'usuarios',
            name: 'GestionUsuarios',
            component: () => import('@/views/admin/Usuarios.vue'),
            meta: { requiredRole: 'admin' }
          },
        {
          path: 'usuarios/:usuarioId/reporte',
          name: 'UsuarioReporte',
          component: () => import('../views/admin/UsuarioReporte.vue'),
          props: true
        },
        {
          path: 'usuarios/:usuarioId/resultados',
          name: 'admin-resultados-usuario',
          component: () => import('../views/admin/ResultadosUsuario.vue'),
          props: true
        },
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
  const userRole = localStorage.getItem('userRole');
  
  // Verificar autenticación
  if (to.meta.requiresAuth && (!token || !curp)) {
    next('/login');
    return;
  }
  
  // Verificar permisos de administrador
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    // Si no es admin, redirigir a la vista de aspirante
    next('/aspirante');
    return;
  }
  
  next();
});

export default router
