# 🚀 Proyecto: Paginación, Búsqueda y Filtrado

¡Bienvenido/a a este repositorio! Este proyecto fue desarrollado con mucho cariño y esfuerzo para ayudarte a aprender e implementar patrones de diseño sólidos en el backend y una interfaz moderna en el frontend. ❤️✨

---

## 🛠️ Tecnologías Utilizadas

* **API (Backend):** [Fastify](https://www.fastify.io/) con documentación interactiva en **Swagger**.
* **Frontend:** [Angular](https://angular.io/).
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/).
* **Patrón de Arquitectura:** **Repository Pattern** para la gestión de datos, paginación, filtros y búsquedas eficientes.

---

## 📽️ Tutorial en Video

Si preferís seguir la explicación paso a paso en video de cómo levantar y configurar la API, podés ver el siguiente tutorial:

▶️ **[Ver Video Guía: Cómo levantar la API](https://youtu.be/RxG5GYRnU2U?si=1nt-Ixk7iuCSLeoA)**

---

## 🚀 Guía de Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/aristov983/clase-paginacion/
cd clase-paginacion
```

---

### 2. Configurar la Base de Datos (PostgreSQL)

1. Abrí tu cliente de base de datos preferido (por ejemplo, **DBeaver**).
2. Creá una nueva base de datos en **PostgreSQL**.
3. Navega a la carpeta `db/` dentro del proyecto y ejecutá el script SQL correspondiente para crear las tablas e insertar los datos iniciales.

---

### 3. Levantar la API (Backend)

Navega a la carpeta del backend e instala las dependencias:

```bash
cd api
npm i
```

> ⚠️ *Nota:* Si encontrás alguna advertencia o conflicto de dependencias, podés ejecutar:
> ```bash
> npm audit fix
> ```

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La API quedará ejecutándose y podrás acceder a la documentación interactiva de **Swagger** para probar los endpoints de paginación y filtrado.

---

### 4. Levantar el Frontend (Angular)

En una nueva terminal, navega a la carpeta del frontend e instala las dependencias:

```bash
cd front
npm i
```

Para iniciar la aplicación de Angular:

```bash
npm start
```

Una vez completado el proceso, abrí tu navegador e ingresá a `http://localhost:4200` para ver la aplicación funcionando.

---

## 💬 Unas palabras para la comunidad...

> *"Aprender a programar es un viaje lleno de retos, momentos de frustración y grandes alegrías cuando las cosas finalmente funcionan. Este proyecto fue creado con la intención de compartir conocimiento y acompañarte en tu crecimiento como desarrollador/a. Nunca dejes de curiosear, preguntar y construir cosas increíbles. ¡El límite lo ponés vos! 🚀💪✨"*

---

🌟 **Si este proyecto te sirvió, ¡no olvides dejarle una estrella al repositorio!**
