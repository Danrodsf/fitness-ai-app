# 💪 Fitness Dashboard - React App

Una aplicación moderna de seguimiento de fitness desarrollada con React, TypeScript y las mejores prácticas de desarrollo.

## 🚀 Características

### ✨ **Funcionalidades principales**
- **🏋️ Entrenamiento completo** - Plan de 3 días/semana con ejercicios seguros en máquinas
- **🍽️ Plan alimenticio** - Menús semanales con seguimiento nutricional  
- **📊 Seguimiento de progreso** - Registro de peso, objetivos y estadísticas
- **🎯 Sistema de objetivos** - Metas personalizables con seguimiento automático
- **💾 Almacenamiento persistente** - Datos guardados automáticamente con backup

### 🎨 **Experiencia de usuario**
- **🌙 Tema oscuro/claro** - Automático según preferencias del sistema
- **📱 Responsive** - Funciona perfectamente en móvil y desktop
- **🔔 Notificaciones** - Feedback inmediato de acciones
- **⚡ Rendimiento optimizado** - Carga rápida y navegación fluida

### 🏗️ **Arquitectura técnica**
- **Domain Driven Design** - Código organizado por dominios de negocio
- **TypeScript estricto** - Tipado completo para mayor robustez
- **Context API + useReducer** - Gestión de estado predecible
- **Componentes reutilizables** - Sistema de UI consistente

## 🛠️ Instalación y uso

### Prerrequisitos
- Node.js 18+ 
- npm 9+

### Instalación

1. **Navega a la carpeta del proyecto**
   ```bash
   cd react-fitness
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador en** http://localhost:3000

### Comandos disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Previsualiza build de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Corrige errores de ESLint automáticamente
npm run type-check   # Verifica tipos de TypeScript
npm run format       # Formatea código con Prettier

# Testing
npm run test         # Ejecuta tests
npm run test:ui      # Ejecuta tests con interfaz visual
npm run test:coverage # Ejecuta tests con reporte de cobertura
```

## 📂 Estructura del proyecto

```
src/
├── domains/           # Dominios de negocio (DDD)
│   ├── training/      # 🏋️ Entrenamiento
│   │   ├── components/
│   │   ├── data/
│   │   └── types/
│   ├── nutrition/     # 🍽️ Alimentación
│   ├── progress/      # 📊 Progreso
│   └── user/          # 👤 Usuario
├── shared/            # Infraestructura compartida
│   ├── components/    # Componentes UI reutilizables
│   ├── services/      # Servicios (almacenamiento, etc.)
│   └── types/         # Tipos compartidos
├── store/             # Gestión de estado global
└── styles/            # Estilos globales
```

## 🎯 Dominios de la aplicación

### 🏋️ **Training (Entrenamiento)**
- Plan de 3 días por semana
- Ejercicios con videos de YouTube
- Seguimiento de series y repeticiones
- Advertencias de seguridad para asmáticos
- Sistema de completado con celebraciones

### 🍽️ **Nutrition (Alimentación)**  
- Plan semanal de comidas
- Opciones rápidas para cenas (máx 10 min)
- Guía de batidos de proteína
- Lista de compras automática
- Trucos para meal prep

### 📊 **Progress (Progreso)**
- Registro diario de peso
- Cálculo automático de IMC
- Sistema de objetivos/metas
- Estadísticas y rachas
- Insights motivacionales

### 👤 **User (Usuario)**
- Perfil personalizable
- Preferencias de tema
- Estadísticas generales

## 🔧 Tecnologías utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas
- **Vitest** - Testing framework

## 📱 PWA Ready

La aplicación está configurada como PWA (Progressive Web App):
- Funciona offline
- Instalable en dispositivos móviles
- Actualizaciones automáticas
- Caché optimizado

## 🎨 Sistema de diseño

### Colores principales
- **Primary**: Violeta/Púrpura - Para acciones principales
- **Secondary**: Rosa/Magenta - Para elementos secundarios  
- **Success**: Verde - Para confirmaciones y logros
- **Warning**: Amarillo/Naranja - Para advertencias
- **Danger**: Rojo - Para errores y eliminaciones

### Componentes UI
- **Button** - Botones con múltiples variantes
- **Card** - Tarjetas con efecto glass
- **Badge** - Etiquetas informativas
- **Input** - Campos de entrada con validación

## 🚀 Despliegue

```bash
# Construir para producción
npm run build

# Los archivos optimizados estarán en /dist
```

## 🤝 Contribuir

El proyecto sigue Domain Driven Design y principios de código limpio:

1. Cada dominio es independiente
2. Componentes reutilizables en `/shared`
3. Estado inmutable con reducers
4. TypeScript estricto
5. Tests para funcionalidad crítica

---

## 💡 Próximas funcionalidades

- 📈 Gráficos de progreso avanzados
- 🏆 Sistema de logros y badges
- 📸 Fotos de progreso
- 🔄 Sincronización en la nube
- 📊 Análisis nutricional detallado
- 🤖 IA para recomendaciones personalizadas

---

**¡Desarrollado con ❤️ y las mejores prácticas de React!**