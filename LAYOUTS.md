# 🏗️ Sistema de Layouts con Navbar Dinámico

Sistema de layouts similar a React que permite manejar diferentes tipos de navbar según el usuario (aspirante, admin, o sin navbar para login).

## 📁 Estructura de Archivos

```
src/
├── layouts/
│   └── MainLayout.vue          # Layout principal
├── components/
│   ├── aspirante/
│   │   └── AspiranteNavbar.vue # Navbar para aspirantes
│   └── admin/
│       └── AdminNavbar.vue     # Navbar para administradores
└── views/
    ├── login/
    │   └── Login.vue           # Vista con navbar-type="login"
    ├── register/
    │   └── Register.vue        # Vista con navbar-type="login"
    └── aspirante/
        └── Home.vue            # Vista con navbar-type="aspirante"
```

## 🎯 Cómo Usar el MainLayout

### 1. **Vista sin Navbar (Login/Register)**
```vue
<template>
  <MainLayout navbar-type="login">
    <div class="tu-contenido">
      <!-- Tu contenido aquí -->
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
</script>
```

### 2. **Vista de Aspirante**
```vue
<template>
  <MainLayout navbar-type="aspirante">
    <TuComponente />
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import TuComponente from '@/components/TuComponente.vue'
</script>
```

### 3. **Vista de Admin**
```vue
<template>
  <MainLayout navbar-type="admin">
    <AdminDashboard />
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
</script>
```

## 🔧 Tipos de Navbar Disponibles

| Tipo | Descripción | Navbar Mostrado |
|------|-------------|-----------------|
| `"login"` | Para login/register | Ninguno |
| `""` (vacío) | Sin navbar | Ninguno |
| `"aspirante"` | Para estudiantes | AspiranteNavbar |
| `"admin"` | Para administradores | AdminNavbar |

## 🎨 Características del Sistema

### **MainLayout.vue**
- ✅ **Navbar dinámico** según el tipo
- ✅ **Contenido responsive** con max-width
- ✅ **Background gradient** automático
- ✅ **Slot para contenido** flexible

### **AspiranteNavbar.vue**
- ✅ Logo UPQROO + "Test Vocacional"
- ✅ Navegación a resultados
- ✅ Botón cerrar sesión con SweetAlert2
- ✅ Colores azules (tema aspirante)

### **AdminNavbar.vue**
- ✅ Logo UPQROO + "Panel Admin"
- ✅ Navegación a dashboard, usuarios, tests
- ✅ Botón cerrar sesión con SweetAlert2
- ✅ Colores rojos (tema admin)

## 🚀 Ventajas del Sistema

### **Reutilización**
- Un solo layout para toda la app
- Navbars modulares y mantenibles
- Menos duplicación de código

### **Flexibilidad**
- Fácil añadir nuevos tipos de navbar
- Componentes independientes
- Configuración por vista

### **Mantenibilidad**
- Cambios centralizados en el layout
- Estilos consistentes
- Fácil testing y debugging

## 📝 Ejemplo de Uso Completo

```vue
<!-- Nueva vista de admin -->
<template>
  <MainLayout navbar-type="admin">
    <div class="admin-dashboard">
      <h1>Dashboard Administrativo</h1>
      <div class="dashboard-content">
        <!-- Contenido del dashboard -->
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'

onMounted(() => {
  // Verificar permisos de admin
  const userRole = localStorage.getItem('role')
  if (userRole !== 'admin') {
    router.push('/login')
  }
})
</script>

<style scoped>
.admin-dashboard {
  /* Tus estilos específicos aquí */
}
</style>
```

## 🔄 Migración de Vistas Existentes

### **Antes (sin layout):**
```vue
<template>
  <div class="vista">
    <MiNavbar />
    <div class="contenido">
      <!-- contenido -->
    </div>
  </div>
</template>
```

### **Después (con layout):**
```vue
<template>
  <MainLayout navbar-type="aspirante">
    <div class="contenido">
      <!-- contenido -->
    </div>
  </MainLayout>
</template>
```

## 🎯 Próximos Pasos

- [ ] Añadir más tipos de navbar según necesidades
- [ ] Implementar breadcrumbs en el layout
- [ ] Añadir sidebar lateral para admin
- [ ] Crear layouts específicos para móvil
- [ ] Integrar con sistema de permisos
