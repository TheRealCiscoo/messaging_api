<h1 align="center">
  Sistema de Mensajería en Tiempo Real
</h1>


  <p align="center">Una API desarrollada con <b>NestJS</b> que implementa un sistema de <b>chat en tiempo real mediante WebSockets</b> y <b>un mecanismo de autenticación seguro basado en JWT</b>. El proyecto está diseñado siguiendo buenas prácticas de arquitectura backend, priorizando la escalabilidad, la seguridad y el rendimiento para aplicaciones de mensajería en tiempo real..</p>

  <p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSockets" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
</p>

## Instalación de Dependencia

```bash
$ yarn install
```
## Creación de Archivo .env

```bash
$ mkdir .env
```

## Contenido del .env
### Lista de variables de entorno (Rellenala con los valores correspondientes)

```bash
DEBUG_MODE=true

MONGO_USER=
MONGO_PWD=
MONGO_URI= # Ej: MONGO_URI='mongodb://USUARIO_MONGO:PASSWORD_MONGO@localhost:27017/auth_db?authSource=admin'
MONGO_AUTH_DB=messaging_api_db
MONGO_APP_DB=messaging_api_app

MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=

JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
```

## Inicialización de Base de Datos

```bash
$ docker-compose up -d
```

## Compilación y Ejecución del Proyecto

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Registro de Nuevo Usuario

```bash
(POST) /api/v1/auth/signup
body:
  {
      "firstname": "Maria Helena",
      "lastname": "Jerez Guzmán",
      "email": "mjerez@google.com",
      "password": "P4s$w0Rd51234",
      "phone": 628123457,
      "phoneCode": 34,
      "state": "Barcelona",
      "country": "Spain",
      "lang": "ES"
  }
```

## Inicio de Sesión

#### El campo `identityValue` recibe el _correo_ o el _número de teléfono_.

```bash
(POST) /api/v1/auth/signin
body:
  {
      "identityValue": "mjerez@google.com",
      "password": "P4s$w0Rd51234"
  }

response (Este es un ejemplo de lo que podría venir en la respuesta):
  {
    "data": {
        "_id": "6a490a6af1214adac9d9b4bd",
        "firstname": "Maria Helena",
        "lastname": "Jerez Guzmán",
        "email": "mjerez@google.com",
        "phone": 628123457,
        "phoneCode": 34,
        "isActive": true,
        "isVerified": false,
        "state": "barcelona",
        "country": "spain",
        "lang": "es",
        "roles": [
            "user"
        ],
        "isLogged": false,
        "createdAt": "2026-07-04T13:28:10.609Z",
        "updatedAt": "2026-07-04T13:28:10.609Z"
    },
    "access_token": {JWT_ACCESS_TOKEN}
  }
```

## Acceso a Ruta Protegida

```bash
(GET) /api/v1/auth/private
headers:
  Authorization: Bearer {JWT_ACCESS_TOKEN}
```

## Mensajería
#### La conexión debe hacerse usando `Websocket` NO `HTTP`. (Si usas Postman para testear la API utiliza la opción _Socket.io_ no _Websocket_)

```bash
(Websocket) /
listen events:
  - send-message
event name to send message:
  - send-message
headers:
  Authorization: Bearer {JWT_ACCESS_TOKEN}
message structure (in JSON):
  {
    "message": "esto es una prueba",
    "recipientId": "DESTINATION_USER_ID"
  }
```
## Solicitar un Nuevo Access Token

#### No necesitas asignar la cookie _refresh_token_ manualmente, se hace automáticamente.

#### Al refrescar el access token, se invalida el refresh token actual y se vuelve a generar un nuevo refresh token que se asigna como nuevo valor de la cookie _refresh_token_.

```bash
(POST) /api/v1/auth/refresh
cookie:
  refresh_token={JWT_REFRESH_TOKEN}

response:
  {
    "access_token": {JWT_ACCESS_TOKEN}
  }
```

## Cerrado de Sesión

#### Acá tampoco necesitas asignar la cookie manualmente.

```bash
(POST) /api/v1/auth/signout
cookie:
  refresh_token={JWT_REFRESH_TOKEN}
```

## Nota

> El sistema de autenticación no está completo, aún faltan cosas por implementar para considerarse completamente funcional y seguro, tales como: 
> - Bloqueo de cuentas por múltiples intentos fallidos.
> - Recuperación de contraseña.
> - Doble factor de autenticación (2FA).
> - Registro de autenticacione fallidas y exitosas.
>
> Entre muchas cosas más, por lo que no debe implementarse para producción en estos momentos. Lo mismo con el sistema de mensajerías.

## Contáctame

- LinkedIn - [Francisco De Jesús](https://www.linkedin.com/in/franciscopauldejesus/)
- Github - [TheRealCiscoo](https://github.com/TheRealCiscoo)


## License

La licencia del proyecto es [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
