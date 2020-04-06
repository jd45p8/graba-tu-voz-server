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
*JWT_KEY*=llave para la generación de los tokens\
*AWS_BUCKET_NAME*=nombre del AWS Bucket donde se almacenarán las pistas de audio\
*AWS_ACCESS_KEY_ID*=id de acceso a AWS\
*AWS_SECRET_ACCESS_KEY*=llave secreta de acceso a AWS\
*AWS_REGION*=región de AWS por defecto

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
Mensaje de éxito en la creación (201).

## /login
### POST (Inicio de sesión)
#### Parámetros obligatorios
*email*: email del usuario\
*password*: contraseña del usuario
#### Respuesta
Token de autenticación del usuario (200).

## /logout
### POST (Cierra sesión)
Requiere enviar el Token en la cabecera.
#### Respuesta
Mensaje de éxito (200).

## /logoutall
### POST (Cierra todas las sesiones de un usuario)
Requiere enviar el Token en la cabecera.
#### Respuesta
Mensaje de éxito (200).

## /phrase
### POST (Crea una frase)
Requiere enviar el Token en la cabecera y ser *admin*.
#### Parámetros obligatorios
*text*: texto para la frase.
#### Respuesta
Mensaje de éxito (201).

## /phrase/all
### GET (Retorna todas las frases)
Require en viar el Token en la cabecera.
#### Respuesta
Array con las frases (200).

## /phrase/:_id
### DELETE (Elimina una frase)
Requiere enviar el Token en la cabecera y ser *admin*.
#### Prámetros obligatorios
*_id*: es el identificador de la frase.
#### Respuesta
Mensaje de éxito (200).

## /recording
### POST (Subir una grabación)
Requiere enviar el Token en la cabecera.
#### Parámetros obligatorios (form-data)
*text*: es el texto de la frase a la que corresponde audio.\
*file*: es el archivo de audio que se desea subir.
#### Respuesta
Mensaje de éxito (201).

## /recording/list
### GET (Lista los las grabaciones de un usuario)
Requiere enviar el Token en la cabecera.
#### Respuesta
Array con la lista de grabaciones del usuario autenticado.

## /recording/:_id
### GET (Descarga una grabación de un usuario)
Requiere enviar el Token en la cabecera.
#### Parámetros obligatorios
*_id*: es el identificador de la grabación.
#### Respuesta
Mensaje de confirmación (200).
### DELETE (Borra una grabación de un usuario)
Requiere enviar el Token en la cabecera.
#### Parámetros obligatorios
*_id*: es el identificador de la grabación.
#### Respuesta
Mesaje de confirmación (200).

# Códigos de respuesta de la API
200 - Todo salió bien.\
201 - Se crearon uno o más recursos en respuesta a la petición.\
401 - No está autorizado para realizar esta petición.\
403 - Credenciales de autenticación inválidas.\
422 - El servidor entendió la petición, pero la información enviada no es correcta para el contexto dado.\
500 - Errores de la API no permiten dar respuesta a la petición.\
404 - Recurso solicitado no ha sido encontrado.