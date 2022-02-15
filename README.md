# Asistentes Virtuales

TODO: descripcion

# Antes de Iniciar

- Crear variables de entorno

Se debe crear un archivo `.env`, para esto puede ejecutar el siguiente comando y copiar
la plantilla de variables proporcionada

```sh
cp template.env .env
```

## Base de Datos

Se debe agregar la URI correcta en la variable de entorno `DB_URI` para iniciar la base de datos de mongoDB. Esta debe tener el siguiente formato:

```sh
DB_URI=mongodb://localhost:27017/ # En modo desarrollo

DB_URI=mongodb://username:password@host:port/dbname # En modo produccion
```
