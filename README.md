# graba-tu-voz-server
Es el servidor para la aplicación graba tu voz.

# Desarrollo
## Intalación de dependencias
`npm install`

## Configuración de variables de entorno
Crear un archivo llamado *.env* en la raíz del proyecto con el siguiente contenido:\
DB_PREFIX=`<prefijo>`\
DB_HOST=`<dirección o IP del host de la base de datos>`\
DB_USER=`<usuario para conectarse a la base de datos>`\
DB_PASSWORD=`<contraseña para conectarse a la base de datos>`\
DB_NAME=`<nombre de la base de datos>`
BCRYPT_SALT_ROUNDS=`<número de rondas para bcrypt>`

# Producción
`npm start`

# API
## /user
### POST (Creación de usuario)
#### Paámetros obligatorios
email: email del usuario\
password: contraseña del usuario\
contact: booleano que indica si puede ser contactado
#### Parámetros obligatorios si contact es verdadero
country: país donde se encuentra el usuario\
state: estado donde se encuentra el usuario\
province: provincia donde se encuentra el usuario