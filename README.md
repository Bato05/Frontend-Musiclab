MusicLab - Proyecto Final Programación Web 1
Carátula
Autor: Bautista Rodriguez

Docente: Santiago Oscar Fazzini

Materia: Programación Web 1

Institución: UCES - Tecnicatura en Programación de Sistemas

Fecha de presentación: 11 de febrero de 2026

Descripción del Sistema
MusicLab es una plataforma interactiva desarrollada como trabajo final para la materia Programación Web 1. El sistema permite a los usuarios gestionar contenido multimedia en un entorno social y administrativo.

Funcionalidades Implementadas:
Autenticación y Perfiles: Registro de nuevos usuarios e inicio de sesión seguro. Cada usuario cuenta con un perfil personal donde se visualiza su contenido.

Interacción Social: Sistema de búsqueda de usuarios y funcionalidad de "Seguir", permitiendo una red de contactos dentro de la plataforma para ver actualizaciones de otros perfiles.

Gestión de Contenido: Capacidad para subir y compartir archivos de audio, imágenes y texto (posteos).

Panel de Administración: Espacio exclusivo para usuarios con privilegios de administrador, permitiendo el control total (ABM) sobre usuarios, publicaciones, categorías y estilos del sitio.

Detalles Técnicos
Backend
Desarrollado íntegramente en PHP Nativo.

Se optó por no utilizar frameworks externos para demostrar el manejo de la lógica de servidor, sesiones y conexión a base de datos mediante código propio.

Implementación de una arquitectura de API para la comunicación con el frontend.

Base de datos: MySQL.

Frontend
La interfaz de usuario fue construida utilizando Angular.

Uso de programación reactiva y componentes modulares.

Consumo de servicios asíncronos para la persistencia de datos con el backend de PHP.

Recursos de Terceros
Font Awesome (fontawesome.com): Se utilizaron iconos de esta biblioteca exclusivamente para mejorar la estética de los placeholders en los campos de entrada (inputs) y elementos visuales de navegación.

Instrucciones de Instalación
Base de Datos: Importar el volcado SQL ubicado en database/musiclab_db.sql en un servidor MySQL.

Configuración: Ajustar los parámetros de conexión en config/config.php.

Despliegue:

Subir el contenido de la carpeta de backend al servidor mediante FTP/SSH.

Para el frontend, ejecutar npm install seguido de ng serve para ejecución local o realizar el ng build para obtener los archivos de producción.
