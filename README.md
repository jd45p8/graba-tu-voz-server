# graba-tu-voz-server
Es el servidor para la aplicación graba tu voz.

# Desarrollo
## Intalación de dependencias
`npm install`

## Configuración de variables de entorno
Crear un archivo llamado *.env* en la raíz del proyecto con el siguiente contenido:\
*DB_PREFIX*=prefijo
*DB_HOST*=dirección o IP del host de la base de datos\
*DB_USER*=usuario para conectarse a la base de datos\
*DB_PASSWORD*=contraseña para conectarse a la base de datos\
*DB_NAME*=nombre de la base de datos\
*BCRYPT_SALT_ROUNDS*=número de rondas para bcrypt\
*JWT_KEY*=llave para la generación de los tokens

# Producción
`npm start`

# API
## /user
### POST (Creación de usuario)
#### Parámetros obligatorios
*email*: email del usuario\
*password*: contraseña del usuario\
*contact*: booleano que indica si puede ser contactado
#### Parámetros obligatorios si contact es verdadero
*country*: país donde se encuentra el usuario\
*state*: estado donde se encuentra el usuario\
*province*: provincia donde se encuentra el usuario
#### Respuesta
Mensaje de éxito.

## /login
### POST (Inicio de sesión)
#### Parámetros obligatorios
*email*: email del usuario\
*password*: contraseña del usuario
#### Respuesta
Token de autenticación del usuario.

# Códigos de respuesta de la API
200 - Todo salió bien.\
401 - Credenciales de autenticación inválidas.\
422 - El servidor entendió la petición, pero la información enviada no es correcta para el contexto dado.\
500 - Errores de la API no permiten dar respuesta a la petición.\
404 - Recurso solicitado no ha sido encontrado.