# S&A Santander y Asociados

Sitio web institucional y sistema administrativo de **S&A Santander y Asociados**, desarrollado con React, Vite, Express y MySQL. La página presenta la empresa, sus servicios, proyectos, experiencia y noticias. El panel administrativo permite gestionar contenido, imágenes, slider, usuarios, roles, mensajes, SEO y analítica.

## Contenido de la página

- **Inicio:** presentación principal y accesos rápidos a las secciones del sitio.
- **Nosotros:** información institucional de S&A Santander y Asociados.
- **Servicios:** servicios de ingeniería ofrecidos por la empresa.
- **Proyectos:** proyectos realizados y sus detalles.
- **Experiencia:** trayectoria y capacidades de la organización.
- **Noticias:** listado y detalle de publicaciones.
- **Contacto:** datos de contacto y formulario para enviar solicitudes.
- **Login:** acceso al área administrativa.
- **Admin:** listado de mensajes, contador de estados, actualización, marcado como leído y eliminación.
- **Panel administrativo:** dashboard, proyectos, servicios, Blog/Noticias, slider principal, clientes, galería de experiencia, mensajes, usuarios y configuración.

## Tecnologías

- React 19
- Vite
- React Router
- Express
- MySQL
- JSON Web Tokens (JWT)
- bcryptjs
- EmailJS opcional
- SweetAlert2
- Lucide React

## Regla de documentación

Cada cambio nuevo del proyecto debe quedar documentado en este README. Esto incluye:

- Nuevas funciones del sitio o del panel administrativo.
- Cambios en tablas, seed, migraciones o datos de MySQL.
- Nuevas rutas o modificaciones de la API.
- Roles, permisos y restricciones de usuarios.
- Configuración de EmailJS, SEO, Analytics o variables de entorno.
- Nuevos comandos de instalación, ejecución o mantenimiento.
- Cambios en imágenes, carga de archivos y recursos públicos.

Antes de cerrar una funcionalidad se debe actualizar la sección correspondiente y validar que los comandos y nombres documentados coincidan con el código actual.

## Persistencia de datos

El contenido administrable se guarda en MySQL. El frontend no usa `localStorage` como fuente principal para proyectos, servicios, noticias, experiencia o slider.

La tabla `contenido` utiliza el campo `tipo` para separar:

- `proyectos`
- `servicios`
- `noticias`
- `clientes`
- `experiencia`
- `slider`

Los mensajes se guardan en `mensajes`, los accesos en `admin_users` (contraseñas cifradas con bcrypt) y los ajustes generales del sitio, Google Analytics y SEO en `configuracion`.

### Carga inicial

Al iniciar el backend se lee [backend/data/content-seed.json](backend/data/content-seed.json). Cada registro se inserta con `INSERT IGNORE`, por lo que:

- Los proyectos, servicios, noticias y fotografías existentes se agregan automáticamente a MySQL.
- Reiniciar el backend no duplica registros.
- El contenido creado posteriormente desde el panel se conserva.
- El seed no reemplaza ni borra cambios realizados desde el administrador.

Para agregar nuevos datos iniciales, añade un registro al archivo seed con un `tipo` y un `slug` únicos.

## Requisitos

Instala en el computador:

- Node.js 18 o superior
- npm
- MySQL Server 8 o compatible
- HeidiSQL, opcional, para administrar visualmente MySQL

HeidiSQL **no almacena la base de datos**. Es una herramienta para conectarse a MySQL y consultar sus tablas.

## Instalación en otro computador (Paso a paso)

Sigue estos pasos para clonar y levantar el proyecto completo en cualquier otro equipo:

### 1. Clonar el repositorio e instalar dependencias

Abre una terminal en la carpeta de tus proyectos:

```powershell
# 1. Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd SYA

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd backend
npm install
cd ..
```

> [!NOTE]
> En Windows PowerShell, si el comando `npm` muestra un error de políticas de script (`npm.ps1 cannot be loaded`), puedes usar `npm.cmd` (por ejemplo: `npm.cmd install`) o habilitar la ejecución de scripts ejecutando una sola vez:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

### 2. Configurar variables de entorno (.env)

El proyecto incluye archivos de ejemplo `.env.example` listos para usar:

```powershell
# En Windows PowerShell / CMD:
copy backend\.env.example backend\.env
copy .env.example .env

# O en Linux / Mac / Git Bash:
cp backend/.env.example backend/.env
cp .env.example .env
```

Abre `backend/.env` y revisa la configuración de conexión a MySQL:

```env
PORT=4000
JWT_SECRET=sya_santander_clave_secreta_2026
ADMIN_USER=admin
ADMIN_PASSWORD=123

# Configuración de base de datos MySQL:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sya

# Origen permitido del frontend
FRONTEND_URL=http://localhost:5173
```

> **Contraseña de MySQL:**
> - Si utilizas **XAMPP / Laragon**: la contraseña (`DB_PASSWORD`) normalmente se deja vacía (`DB_PASSWORD=`).
> - Si instalaste **MySQL Server / MySQL Workbench**: escribe la contraseña que creaste para el usuario `root` durante la instalación.

---

### 3. Iniciar el servicio de MySQL

Asegúrate de que MySQL esté activo en el equipo (por ejemplo, encendiendo el módulo MySQL desde el panel de XAMPP o iniciando el servicio en Windows).

> [!TIP]
> **No necesitas crear la base de datos ni importar tablas manualmente**.
> Al iniciar el backend por primera vez, este detecta automáticamente si la base `sya` no existe, la crea, genera todas las tablas (`admin_users`, `contenido`, `mensajes`, `configuracion`), inserta el catálogo inicial de contenido desde [content-seed.json](backend/data/content-seed.json) y registra al usuario administrador inicial (`admin` / `123`).
> Si prefieres inspeccionar o crear la base manualmente, puedes usar [backend/data/schema.sql](backend/data/schema.sql) en HeidiSQL o MySQL Workbench.

## Configurar el frontend

La URL del backend está centralizada en [src/config/api.js](src/config/api.js). Por defecto usa:

```text
http://localhost:4000
```

Para usar otra dirección, crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:4000
```

## EmailJS

El formulario siempre guarda el mensaje en MySQL. EmailJS es un envío adicional de correo y es opcional.

Para activarlo, crea un `.env` en la raíz del frontend. Los valores se leen desde [src/config/email.js](src/config/email.js):

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_key_completa
```

El formulario envía las variables `nombre`, `email`, `telefono`, `asunto` y `mensaje`. Primero guarda el mensaje en MySQL; EmailJS es un canal adicional. Si EmailJS falla, la solicitud permanece guardada.

Para usar una plantilla visual corporativa, copia el contenido de [docs/emailjs-template.html](docs/emailjs-template.html) en el editor HTML de EmailJS. La plantilla usa `{{name}}`, `{{email}}`, `{{telefono}}`, `{{title}}`, `{{message}}` y `{{time}}`, que el formulario envía directamente.

## Gestión de contenido

Desde `/admin` los perfiles autorizados pueden crear o editar contenido para proyectos, servicios, noticias, clientes, experiencia y slider. Cada registro incluye título, resumen, descripción, categoría, ubicación, slug, autor, fecha, estado e imagen.

Los estados de contenido son:

- `Publicado (Visible en la web)`: aparece inmediatamente en la página pública correspondiente (`/proyectos`, `/servicios`, `/noticias` o `/experiencia`).
- `Borrador (Oculto)`: se almacena de forma privada en el panel para revisión; no se muestra en la web pública.
- `Archivado (Oculto)`: permanece almacenado en la base de datos como histórico pero no se muestra a los visitantes.

El formulario de edición adapta dinámicamente el botón principal de acción:
- Al seleccionar **Publicado**, el botón indica expresamente **Publicar [proyecto/servicio/artículo/registro]**.
- Al seleccionar **Borrador**, el botón muestra **Guardar borrador**.
- Al editar un contenido existente, muestra **Actualizar contenido**.

Las tablas del panel cuentan con etiquetas visuales por color para cada estado (verde para Publicado, ámbar para Borrador y gris para Archivado) y se actualizan automáticamente en tiempo real al guardar o eliminar sin necesidad de recargar la página en el navegador.

### Imágenes

El campo de imagen acepta:

- Rutas del proyecto, por ejemplo `/images/Fotos/Puentes/Puente Sisga - BTS.jfif`.
- Rutas escritas como `public/images/...`; se convierten automáticamente.
- URLs directas de imágenes externas.
- Enlaces compartidos de Google Drive, siempre que el archivo tenga permiso “Cualquier persona con el enlace puede ver”.
- Imágenes seleccionadas desde el computador mediante “Subir imagen”. Se comprimen en el navegador y se guardan en MySQL.

El botón “Quitar imagen” guarda el campo vacío. La página pública muestra un estado limpio de “Sin imagen” y el Hero utiliza su fotografía de respaldo cuando corresponde.

### Slider principal

El módulo **Slider principal** administra las diapositivas del Hero de Home. Sus cambios publicados se leen desde `/api/contenido/slider` y se reflejan en la portada automáticamente. Desde el interruptor **Activar carrusel automático** puedes decidir si las diapositivas cambian cada 6,5 segundos; aunque se desactive, permanecen disponibles los botones y puntos de navegación manual.

## Configuración del sitio, SEO y Analítica

El módulo **Configuración** guarda los parámetros de forma persistente en la tabla `configuracion` de MySQL a través del endpoint `/api/admin/configuracion`. Además, mantiene una sincronización en `localStorage` como respaldo y caché local de carga instantánea.

Permite administrar:

1. **Preferencias del sitio:**
   - Nombre corporativo de la empresa.
   - Correo electrónico para la recepción de notificaciones de nuevos mensajes.
   - Interruptor para habilitar o pausar alertas de contacto.
2. **Google Analytics 4:**
   - ID de medición (formato `G-XXXXXXXXXX`).
   - Interruptor para activar/desactivar el seguimiento analítico.
   - Opción para anonimizar datos personales de los visitantes.
3. **SEO y redes sociales:**
   - Título SEO (con indicador de caracteres recomendados hasta 60).
   - Meta descripción (hasta 160 caracteres).
   - URL canónica del sitio web.
   - Imagen Open Graph para enlaces compartidos en WhatsApp, LinkedIn, etc.
   - Interruptor de indexación para permitir o restringir el rastreo de motores de búsqueda.
   - Vista previa interactiva en tiempo real del resultado en Google.

## Experiencia móvil y panel responsivo

El panel administrativo incluye optimizaciones específicas para dispositivos móviles y pantallas táctiles:

- **Navegación y menú lateral:**
  - Desplazamiento vertical fluido (`overflow-y: auto`, altura dinámica `100dvh` y compatibilidad con `safe-area-inset-bottom`) que permite bajar sin bloqueos hasta el final del menú en cualquier teléfono celular.
  - Botón de **Cerrar sesión** accesible y destacado en la parte inferior del menú lateral.
  - Botón directo de **Cerrar sesión** (<LogOut />) en la barra superior (topbar) para salir en un solo toque sin abrir el menú.
  - Botón de cierre rápido **"X"** en el encabezado del menú móvil.
  - Bloqueo de desplazamiento del fondo cuando el menú está abierto para evitar movimientos involuntarios de la página.
- **Cabecera fija (`sticky`):** La barra superior se mantiene fija durante el scroll, garantizando acceso constante a la navegación, alertas y cuenta.
- **Tablas y modales adaptativos:** Las listas de contenidos, mensajes y usuarios reorganizan sus botones de acción en áreas táctiles amplias (mínimo 44px) para facilitar la pulsación con el pulgar.

## Usuarios y roles

El módulo **Usuarios** usa la tabla `admin_users` y permite crear usuarios, cifrar contraseñas, cambiar roles y eliminar cuentas. El usuario actual no puede eliminarse a sí mismo.

Permisos actuales:

| Rol | Permisos |
| --- | --- |
| Administrador | Acceso completo, usuarios, configuración del sitio, contenido, publicación y mensajes |
| Editor | Crear, editar, publicar y eliminar contenido; gestionar mensajes |
| Autor | Crear, editar y publicar contenido; no elimina |
| Colaborador | Crear contenido como borrador; no edita ni elimina |
| Suscriptor | Consulta básica; sin acciones de edición |

La matriz se aplica en el frontend para ocultar acciones y en el backend para bloquear solicitudes no autorizadas.

## API principal

Rutas públicas:

```text
GET  /api/health
GET  /api/contenido/:tipo
GET  /api/configuracion
POST /api/mensajes
POST /api/login
```

Rutas protegidas con `Authorization: Bearer <token>`:

```text
GET    /api/admin/contenido/:tipo
POST   /api/admin/contenido/:tipo
PATCH  /api/admin/contenido/:tipo/:id
DELETE /api/admin/contenido/:tipo/:id

GET    /api/admin/configuracion
PUT    /api/admin/configuracion

GET    /api/mensajes
PATCH  /api/mensajes/:id
DELETE /api/mensajes/:id

GET    /api/admin/usuarios
POST   /api/admin/usuarios
PATCH  /api/admin/usuarios/:id
DELETE /api/admin/usuarios/:id
```

Las utilidades cliente centralizan la comunicación:
- [src/utils/contentApi.js](src/utils/contentApi.js) para contenido.
- [src/utils/usersApi.js](src/utils/usersApi.js) para usuarios y roles.
- [src/utils/configApi.js](src/utils/configApi.js) para configuración del sitio, analítica y SEO.

## Ejecutar el proyecto

Necesitas dos terminales.

### Terminal 1: backend

```powershell
cd backend
npm start
```

El backend quedará disponible en:

```text
http://localhost:4000
```

Puedes comprobar la conexión con MySQL visitando:

```text
http://localhost:4000/api/health
```

La respuesta esperada indica `status: "ok"` y `database: "connected"`.

### Terminal 2: frontend

Desde la raíz del proyecto:

```powershell
npm run dev
```

Abre la dirección que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Acceso administrativo

La pantalla de login usa usuario y contraseña, no correo electrónico. Los valores iniciales son los definidos en `backend/.env`:

```text
Usuario: admin
Contraseña: 123
```

Después de iniciar sesión, entra a `/admin`. El token JWT se guarda únicamente en el `localStorage` del navegador y caduca después de 8 horas.

## Flujo de mensajes

1. Una persona completa el formulario de `/contacto`.
2. El frontend envía el mensaje a `POST /api/mensajes`.
3. El backend guarda el registro en la tabla `mensajes` de MySQL.
4. Si EmailJS está configurado, también se envía el correo.
5. El administrador inicia sesión en `/login`.
6. El panel `/admin` consulta los mensajes protegidos mediante JWT.
7. La campana del panel muestra las cinco notificaciones más recientes y permite abrir la bandeja completa.

## Comandos útiles

Desde la raíz:

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

Desde `backend/`:

```powershell
npm start
npm run dev
```

## Solución de problemas

### El backend no inicia y dice que no puede conectar con MySQL

Verifica que MySQL esté iniciado, que los datos de `backend/.env` sean correctos y que el puerto `3306` esté disponible.

### El frontend muestra error de conexión

Confirma que el backend esté ejecutándose en el puerto indicado por `VITE_API_URL` o, por defecto, en `http://localhost:4000`.

### El login devuelve error

Comprueba que exista la tabla `admin_users` y que el usuario de `backend/.env` coincida con el usuario creado en MySQL. Revisa también que `JWT_SECRET` tenga un valor.

### El mensaje se guarda pero no llega por correo

Eso significa que EmailJS no está configurado o que sus credenciales/template no son válidos. El mensaje seguirá disponible en la tabla `mensajes` de MySQL.

### Error en PowerShell: `File npm.ps1 cannot be loaded because running scripts is disabled`

En equipos con Windows nuevo, PowerShell bloquea la ejecución de scripts por seguridad. Se soluciona ejecutando una sola vez en PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

O bien puedes usar el ejecutable directo `npm.cmd` (por ejemplo: `npm.cmd run dev`).

### Vite muestra un error relacionado con `public`

Los archivos dentro de `public/` se referencian desde la raíz. Por ejemplo:

```text
public/Logo/logo.png -> /Logo/logo.png
```

## Checklist para trabajar en otro computador

Cuando vayas a cambiar de computador, asegúrate de seguir esta lista para que todo funcione sin contratiempos:

### En el computador actual (antes de salir):
1. Confirma que los cambios estén guardados en Git:
   ```powershell
   git status
   git add .
   git commit -m "Actualizaciones del proyecto"
   git push origin master
   ```
2. Recuerda que los archivos `.env` **no viajan en Git** por seguridad, pero ya dejamos creadas las plantillas `.env.example` y `backend/.env.example` en el repositorio para que el nuevo equipo tenga la configuración lista.

### En el nuevo computador:
1. Tener instalado **Node.js (v18+)** y **MySQL** (o **XAMPP**).
2. Clonar el repositorio: `git clone <URL_DEL_REPOSITORIO>` y entrar a la carpeta.
3. Instalar paquetes:
   ```powershell
   npm install
   cd backend
   npm install
   cd ..
   ```
4. Copiar los archivos `.env`:
   ```powershell
   copy backend\.env.example backend\.env
   copy .env.example .env
   ```
5. Iniciar el servicio de MySQL (en XAMPP dar clic en "Start" en MySQL).
6. Iniciar el backend (`cd backend; npm start`). Automáticamente creará la base de datos `sya`, todas las tablas y el usuario administrador `admin` / `123`.
7. Iniciar el frontend en otra terminal (`npm run dev`). Listo, abre `http://localhost:5173`.

## Estructura principal

```text
src/
  components/       Componentes reutilizables de la página
  config/           Configuración de API y EmailJS
  data/             Datos estáticos de la página
  utils/            Clientes de API para contenido y usuarios
  pages/            Vistas y rutas
  styles/           Estilos globales y por sección
backend/
  data/schema.sql   Estructura de la base MySQL
  data/content-seed.json  Catálogo inicial idempotente
  server.js         API, autenticación, permisos y endpoints
public/             Imágenes y recursos públicos
```

## Seguridad

- No subas `backend/.env` al repositorio.
- Usa una contraseña administrativa distinta de `123` en producción.
- Usa una clave `JWT_SECRET` larga y privada.
- En producción, restringe `FRONTEND_URL` al dominio real.
- Configura un usuario MySQL específico para la aplicación en lugar de usar `root`.
