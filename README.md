# 🍽️ Sittara - Sistema de Gestión de Reservas para Restaurantes

> Plataforma moderna y completa para la gestión de reservas, mesas, menús y reseñas de restaurantes.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)

## 🚀 Características

### Para Clientes
- 🗓️ **Reservas en línea** con selección visual de mesas
- 📱 **Códigos QR** para check-in rápido
- ⭐ **Sistema de reseñas** con calificaciones por categoría
- 💰 **Ofertas y promociones** exclusivas
- ❤️ **Favoritos** para guardar restaurantes preferidos
- 🔔 **Notificaciones** en tiempo real

### Para Restaurantes
- 🏢 **Panel de administración** completo
- 📊 **Dashboard** con métricas y estadísticas
- 🪑 **Mapa visual de mesas** arrastra y suelta
- 📋 **Gestión de menú** con categorías
- 💵 **Control de anticipos** y depósitos
- 👥 **Gestión de personal** con permisos
- 📈 **Reportes** de ocupación y ventas

### Para Staff
- ✅ **Check-in** de reservas con QR
- 📱 **App móvil** para tablets
- 🔄 **Actualización de estado** de mesas
- 📋 **Lista de espera** en tiempo real

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** + **Shadcn UI**
- **React Query** (gestión de estado)
- **React Router DOM** (routing)
- **Framer Motion** (animaciones)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Supabase** (PostgreSQL)
- **JWT** (autenticación)
- **bcrypt** (encriptación)

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** (servidor web)
- **GitHub Actions** (CI/CD - próximamente)

## 📋 Requisitos Previos

- **Node.js** v20 o superior
- **npm** v9 o superior
- **Docker** y **Docker Compose** (opcional)
- Cuenta de **Supabase**

## ⚡ Instalación Rápida

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-ORGANIZACION/sittara.git
cd sittara

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Levantar servicios
docker-compose up -d

# 4. Acceder a la aplicación
# Frontend: http://localhost:8080
# Backend: http://localhost:3001
```

### Opción 2: Instalación Manual

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-ORGANIZACION/sittara.git
cd sittara

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar con tus credenciales

# 5. Ejecutar base de datos
# Ir a Supabase SQL Editor y ejecutar: backend/src/scripts/schema.sql

# 6. Iniciar backend
npm start

# 7. En otra terminal, iniciar frontend
cd ..
npm run dev
```

## 🗃️ Configuración de Base de Datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ir a **SQL Editor**
3. Ejecutar el script: `backend/src/scripts/schema.sql`
4. Copiar tus credenciales al archivo `.env`

## 📁 Estructura del Proyecto

```
sittara/
├── backend/                # API Backend
│   ├── src/
│   │   ├── routes/        # Endpoints API
│   │   ├── middleware/    # Auth, CORS, etc.
│   │   ├── scripts/       # Schema SQL
│   │   └── index.ts       # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── src/                   # Frontend React
│   ├── components/        # Componentes reusables
│   ├── pages/            # Páginas/vistas
│   ├── contexts/         # Context API
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls
│   └── types/            # TypeScript types
│
├── public/               # Assets estáticos
├── docker-compose.yml    # Orquestación Docker
├── nginx.conf           # Configuración Nginx
└── README.md
```

## 🔐 Variables de Entorno

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-publica

# JWT
JWT_SECRET=tu-secreto-jwt-seguro

# CORS
CORS_ORIGIN=http://localhost:8080

# Ports
BACKEND_PORT=3001
FRONTEND_PORT=8080
```

## 🎯 Comandos Disponibles

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # Linter
```

### Backend
```bash
npm start            # Desarrollo
npm run build        # Compilar TypeScript
npm run serve        # Producción
```

### Docker
```bash
docker-compose up -d              # Levantar servicios
docker-compose down               # Detener servicios
docker-compose logs -f            # Ver logs
docker-compose up -d --build      # Rebuild y levantar
```

## 🧪 Testing (Próximamente)

```bash
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run coverage     # Code coverage
```

## 📸 Screenshots

### Vista Cliente
![Home](docs/screenshots/home.png)
![Restaurante](docs/screenshots/restaurant-profile.png)
![Reserva](docs/screenshots/reservation.png)

### Panel Admin
![Dashboard](docs/screenshots/admin-dashboard.png)
![Mesas](docs/screenshots/table-management.png)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [x] Sistema de reservas con mapa visual
- [x] Panel de administración completo
- [x] Sistema de reseñas
- [x] Gestión de personal
- [x] Dockerización
- [ ] Pagos con Stripe
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Sistema de puntos de lealtad
- [ ] Integración con WhatsApp

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Autores

- **Tu Nombre** - *Desarrollo Full Stack* - [GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Shadcn UI](https://ui.shadcn.com) - Componentes UI
- [Lucide](https://lucide.dev) - Iconos

---

**Hecho con ❤️ para la industria restaurantera**
