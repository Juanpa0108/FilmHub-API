# FlimHub Backend API

Backend API para la plataforma de películas FlimHub desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

- **Autenticación JWT**: Sistema completo de registro, login y logout
- **Catálogo de Películas**: API RESTful con paginación y filtros
- **Middleware de Seguridad**: Validaciones y autenticación
- **Base de Datos MongoDB**: Modelos optimizados con índices
- **Documentación JSDoc**: API completamente documentada

## 📋 Requisitos del Sprint 1

### ✅ Registro de Usuarios
- [x] Endpoint `POST /api/users/register`
- [x] Validación de email y contraseña (mínimo 8 caracteres)
- [x] Encriptación de contraseñas con bcrypt
- [x] Mensaje de confirmación y redirección al login

### ✅ Inicio y Cierre de Sesión
- [x] Endpoint `POST /api/auth/login`
- [x] Endpoint `POST /api/auth/logout`
- [x] JWT implementado y configurado
- [x] Middleware de autenticación
- [x] Manejo de sesiones con cookies

### ✅ Catálogo de Películas
- [x] Endpoint `GET /api/movies` con paginación
- [x] Endpoint `GET /api/movies/:id` para detalles
- [x] Grid responsive (1, 2, 3, 4 columnas según dispositivo)
- [x] Base de datos poblada con 10+ películas
- [x] Estados de carga y error manejados

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd BACK-FlimHub
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
MONGODB_URI=mongodb://localhost:27017/flimhub
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=development
PORT=4000
```

4. **Poblar la base de datos**
```bash
npm run seed
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Autenticación

#### Registro de Usuario
```http
POST /api/users/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "age": 25,
  "password": "MiPassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "MiPassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Verificar Usuario Actual
```http
GET /api/auth/user
Authorization: Bearer <token>
```

### Películas

#### Obtener Todas las Películas
```http
GET /api/movies?page=1&limit=12&genre=Acción&search=titanic
Authorization: Bearer <token>
```

#### Obtener Película por ID
```http
GET /api/movies/:id
Authorization: Bearer <token>
```

#### Películas Destacadas
```http
GET /api/movies/featured?limit=6
Authorization: Bearer <token>
```

#### Películas por Género
```http
GET /api/movies/genre/:genre?page=1&limit=12
Authorization: Bearer <token>
```

#### Obtener Géneros Disponibles
```http
GET /api/movies/genres
Authorization: Bearer <token>
```

## 🗄️ Modelos de Datos

### User
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  age: Number (required),
  password: String (required, hashed),
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date
}
```

### Movie
```javascript
{
  title: String (required),
  description: String (required),
  shortDescription: String (required),
  poster: String (required),
  backdrop: String,
  genre: [String] (required),
  year: Number (required),
  duration: Number (required, minutes),
  rating: Number (0-10),
  director: String (required),
  cast: [String],
  trailer: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm start` - Inicia el servidor en modo producción
- `npm run seed` - Pobla la base de datos con películas de ejemplo
- `npm run docs` - Genera documentación JSDoc

## 🏗️ Estructura del Proyecto

```
src/
├── config/          # Configuración de BD, CORS, etc.
├── handlers/        # Controladores de la API
├── middleware/      # Middlewares de autenticación y validación
├── models/          # Modelos de MongoDB
├── scripts/         # Scripts de utilidad (seed, etc.)
├── utils/           # Utilidades (auth, etc.)
├── emails/          # Templates de email
├── interfaces/      # Interfaces TypeScript
├── router.js        # Rutas principales
├── movie.routes.js  # Rutas de películas
├── server.js        # Configuración del servidor
└── index.js         # Punto de entrada
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- JWT para autenticación
- Validación de entrada con express-validator
- CORS configurado
- Cookies seguras en producción
- Rate limiting en intentos de login

## 🚀 Despliegue

Para desplegar en producción:

1. Configurar variables de entorno de producción
2. `npm install --production`
3. `npm run seed` (opcional, para datos iniciales)
4. `npm start`

## 📝 Notas de Desarrollo

- El proyecto usa ES6 modules
- MongoDB con Mongoose ODM
- Validaciones tanto frontend como backend
- Manejo de errores centralizado
- Logs estructurados
- Documentación JSDoc completa

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request