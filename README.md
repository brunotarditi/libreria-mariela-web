# Librería Mariela - Frontend Web

Frontend de administración y gestión de inventario para **Librería Mariela**, un negocio familiar especializado en útiles escolares e insumos de papelería.

## 📋 Descripción

Aplicación web desarrollada con **Angular 19** que proporciona una interfaz moderna y responsiva para la gestión integral del stock e inventario de productos de útiles escolares y papelería. La aplicación consume una API REST desarrollada en Go que maneja toda la lógica de negocio y persistencia de datos.

## 🎯 Funcionalidades Principales

- **Gestión de Inventario**: Visualizar, crear, editar y eliminar productos del catálogo
- **Control de Stock**: Monitoreo en tiempo real del inventario disponible
- **Categorización de Productos**: Organización de útiles escolares y artículos de papelería
- **Búsqueda y Filtrado**: Herramientas avanzadas para localizar productos rápidamente
- **Reportes**: Visualización de datos de inventario y movimientos
- **Interfaz Intuitiva**: Diseño moderno basado en Material Design

## 🛠️ Stack Tecnológico

### Frontend
- **Angular**: 19.2.0 - Framework principal
- **Material Design**: 19.2.18 - Componentes UI profesionales
- **TypeScript**: 5.7.2 - Lenguaje tipado
- **RxJS**: 7.8.0 - Gestión reactiva
- **Angular CDK**: 19.2.18 - Componentes avanzados

### Backend
- **Go**: API REST que maneja la lógica de negocio
- **Base de datos**: Configurada en la API

## 📦 Requisitos Previos

- **Node.js**: v18.x o superior
- **npm**: v9.x o superior
- **Angular CLI**: v19.x
- **Go API**: Servidor backend ejecutándose en `http://localhost:8080`

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/libreria-mariela-web.git
cd libreria-mariela-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Las variables de entorno se encuentran en `src/environments/`:

- **environment.ts** (desarrollo): API en `http://localhost:8080/api/v1/`
- **environment.prod.ts** (producción): Configuración para producción

Edita estos archivos según tu configuración local.

## 💻 Comandos Disponibles

```bash
# Servidor de desarrollo (http://localhost:4200)
npm start
# o
npm run ng serve

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Compilar en modo observador
npm run watch
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/              # Servicios y componentes centrales
│   ├── features/          # Módulos de funcionalidades
│   ├── shared/            # Componentes y utilidades compartidas
│   ├── app.routes.ts      # Configuración de rutas
│   ├── app.config.ts      # Configuración principal
│   ├── app.component.*    # Componente raíz
├── environments/          # Configuración de entornos
├── styles.scss            # Estilos globales
└── index.html            # HTML principal
```

## 🔌 Integración con API

### Configuración de la API

La aplicación se conecta a una API REST desarrollada en Go en:

```
http://localhost:8080/api/v1/
```

### Endpoints Principales

La API proporciona endpoints para:
- Gestión de productos
- Control de inventario
- Búsqueda y filtrado
- Reportes y estadísticas

Consulta la documentación del backend para más detalles sobre los endpoints disponibles.

## 🎨 Diseño y Estilos

- **Tema**: Azure Blue (Material Design prebuilt theme)
- **Preprocesador**: SCSS
- **Responsive**: Diseño adaptable a dispositivos móviles y escritorio


## 📦 Compilación

```bash
# Build de producción
npm run build
```

El output se genera en `dist/libreria-mariela-fe/`

### Presupuesto de Size (Limites configurados)

- **Initial Bundle**: Máximo 1MB (warning: 700kB)
- **Component Styles**: Máximo 8kB por componente (warning: 4kB)

## 🔧 Desarrollo

### Crear un nuevo componente

```bash
npm run ng generate component features/products
```

### Crear un nuevo servicio

```bash
npm run ng generate service core/services/product
```

## 📋 Convenciones de Código

- **TypeScript Strict Mode**: Activado
- **Estilos**: SCSS con BEM methodology
- **Componentes**: Standalone components (Angular 19)
- **Servicios**: Inyección de dependencias

## 🔐 Consideraciones de Seguridad

- Variables sensibles deben almacenarse en archivos de ambiente
- No commitear credenciales o tokens en el repositorio
- Usar HTTPS en producción
- Implementar autenticación y autorización en la API

## 📝 Notas de Desarrollo

- La aplicación utiliza Angular standalone components
- Los servicios inyectables están configurados globalmente
- Material Design proporciona los componentes UI
- Asegúrate de que el servidor Go esté ejecutándose antes de iniciar el desarrollo

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo o abre un issue en el repositorio.

## 📄 Licencia

Proyecto privado para Librería Mariela - Derechos reservados.
