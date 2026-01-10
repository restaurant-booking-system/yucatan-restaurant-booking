# 🍽️ Mesa Feliz

> **Sistema de reservación y gestión de mesas para restaurantes de alta demanda en Mérida, Yucatán.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 📋 Descripción

**Mesa Feliz** es una plataforma web moderna que conecta a comensales con los mejores restaurantes de Mérida, Yucatán. El sistema permite a los clientes descubrir restaurantes, seleccionar mesas visualmente en un mapa interactivo y realizar reservaciones en segundos. Para los restaurantes, ofrece un panel de administración completo para gestionar reservas, mesas, ofertas y analizar el rendimiento del negocio.

### 🎯 Problema que resuelve

- Restaurantes con alta demanda que necesitan gestionar reservaciones eficientemente
- Clientes que desean elegir su mesa preferida antes de llegar
- Reducción de no-shows mediante anticipos en horarios pico
- Optimización de la ocupación del restaurante en tiempo real

---

## ✨ Características Principales

### 👤 Para Clientes

| Característica | Descripción |
|----------------|-------------|
| 🔍 **Descubrimiento** | Busca restaurantes por zona, tipo de cocina, calificación y disponibilidad |
| 🗓️ **Reservación rápida** | Proceso de 3 pasos: fecha → hora → mesa |
| 🪑 **Selección visual** | Mapa interactivo del restaurante para elegir tu mesa favorita |
| 💳 **Pagos seguros** | Anticipos requeridos en horarios de alta demanda |
| ⭐ **Calificaciones** | Sistema de reseñas con aspectos específicos y fotos |
| 🎁 **Ofertas** | Promociones exclusivas de los restaurantes |
| 👤 **Perfil personal** | Historial de reservas, favoritos y preferencias |
| 🔐 **Autenticación** | Registro e inicio de sesión seguro |

### 🏪 Para Restaurantes

| Característica | Descripción |
|----------------|-------------|
| 📊 **Dashboard** | Métricas en tiempo real: reservas, ocupación, ingresos |
| 🗺️ **Mapa operativo** | Vista en vivo del estado de todas las mesas |
| 📝 **Gestión de reservas** | Aceptar, rechazar, confirmar llegadas |
| 📱 **Escaneo QR** | Validación rápida de reservas con código QR |
| ⏳ **Lista de espera** | Gestión de walk-ins con prioridades |
| 🍽️ **Menú digital** | CRUD completo de platillos y categorías |
| 🎯 **Ofertas** | Crear y gestionar promociones |
| 📈 **Reportes** | Estadísticas de ocupación, no-shows y revenue |
| 🤖 **Sugerencias IA** | Recomendaciones inteligentes para optimizar operación |
| ⚙️ **Configuración** | Horarios, anticipos, notificaciones y usuarios |

---

## 🎨 Diseño y UX

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| 🟢 **Verde Jade** | `#1F7A6B` | Color primario, botones principales |
| 🟠 **Terracota** | `#C85C3A` | Color secundario, acentos |
| 🏖️ **Arena Claro** | `#F5F1EB` | Fondo principal |
| ⬛ **Gris Oscuro** | `#2E2E2E` | Texto principal |

### Estados de Mesa

| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟢 Disponible | Verde | Mesa libre para reservar |
| 🔴 Ocupada | Rojo | Mesa con clientes |
| 🟡 Pendiente | Amarillo | Esperando confirmación |
| 🟣 Reservada | Jade | Mesa con reserva confirmada |

### Principios de Diseño

- ✅ Flujo lineal e intuitivo
- ✅ Máximo 3 clics para completar reserva
- ✅ Mensajes claros y confirmaciones visibles
- ✅ Botones grandes con estados visuales
- ✅ Tipografía legible (Inter + Playfair Display)
- ✅ Animaciones suaves con Framer Motion
- ✅ Totalmente responsivo

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **React Router DOM** - Navegación SPA

### Estilos
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Componentes accesibles
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconografía moderna

### Estado y Datos
- **React Query** - Cache y sincronización
- **Context API** - Estado global (autenticación)
- **LocalStorage** - Persistencia de sesión

---

## 📁 Estructura del Proyecto

```
mesa-feliz/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── admin/           # Componentes del panel admin
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── TableMap.tsx
│   │   └── ...
│   │
│   ├── pages/               # Páginas de la aplicación
│   │   ├── admin/           # Páginas del panel admin
│   │   │   ├── RestaurantDashboard.tsx
│   │   │   ├── ReservationsManagementPage.tsx
│   │   │   ├── TableMapOperativePage.tsx
│   │   │   └── ...
│   │   ├── Index.tsx
│   │   ├── RestaurantsPage.tsx
│   │   ├── ReservationPage.tsx
│   │   └── ...
│   │
│   ├── contexts/            # Contextos de React
│   │   └── AuthContext.tsx
│   │
│   ├── data/                # Datos mock
│   │   └── mockData.ts
│   │
│   ├── types/               # Definiciones TypeScript
│   │   └── restaurant.ts
│   │
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilidades
│   ├── App.tsx              # Rutas principales
│   └── index.css            # Estilos globales
│
├── public/                  # Assets estáticos
├── tailwind.config.ts       # Configuración Tailwind
├── vite.config.ts           # Configuración Vite
└── package.json
```

---

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/canulcua123-source/restaurant.git

# Entrar al directorio
cd restaurant

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## 🗺️ Rutas de la Aplicación

### Rutas del Cliente

| Ruta | Página |
|------|--------|
| `/` | Inicio - Descubrimiento de restaurantes |
| `/login` | Inicio de sesión / Registro |
| `/restaurantes` | Listado de restaurantes |
| `/ofertas` | Ofertas y promociones activas |
| `/restaurante/:id` | Perfil del restaurante |
| `/reservar/:id` | Proceso de reservación |
| `/pago/:id` | Pago de anticipo |
| `/mis-reservas` | Mis reservaciones |
| `/perfil` | Perfil del usuario |
| `/calificar/:id` | Calificar restaurante |

### Rutas del Administrador

| Ruta | Página |
|------|--------|
| `/admin/login` | Login del restaurante |
| `/admin/dashboard` | Panel principal |
| `/admin/reservas` | Gestión de reservas |
| `/admin/mesas` | Mapa de mesas operativo |
| `/admin/llegadas` | Registro de llegadas |
| `/admin/espera` | Lista de espera |
| `/admin/ofertas` | Gestión de ofertas |
| `/admin/menu` | Menú digital |
| `/admin/opiniones` | Opiniones y calificaciones |
| `/admin/reportes` | Reportes y estadísticas |
| `/admin/ia-sugerencias` | Sugerencias de IA |
| `/admin/configuracion` | Configuración |

---

## 🔐 Credenciales de Prueba

### Cliente
| Email | Contraseña |
|-------|------------|
| `juan@email.com` | `123456` |
| `maria@email.com` | `123456` |

### Restaurante
| Email | Contraseña |
|-------|------------|
| `admin@restaurante.com` | `admin123` |

---

## 📸 Capturas de Pantalla

### Vista del Cliente

**Página de Inicio**
> Descubrimiento de restaurantes con búsqueda y filtros

**Selección de Mesa**
> Mapa visual interactivo para elegir tu mesa favorita

**Proceso de Reservación**
> Flujo intuitivo en 3 pasos

### Panel de Administración

**Dashboard**
> Métricas en tiempo real y alertas

**Mapa Operativo**
> Estado de mesas en vivo

**Gestión de Reservas**
> Tabla filtrable con acciones rápidas

---

## 🔮 Roadmap

- [ ] Integración con backend real (Node.js + PostgreSQL)
- [ ] Notificaciones push en tiempo real
- [ ] App móvil con React Native
- [ ] Integración con pasarelas de pago (Stripe/OpenPay)
- [ ] Sistema de fidelización con puntos
- [ ] IA predictiva para demanda
- [ ] Integración con WhatsApp Business API

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ para la gastronomía yucateca

---

<p align="center">
  <strong>Mesa Feliz</strong> - Reserva tu mesa en los mejores restaurantes de Mérida 🇲🇽
</p>
