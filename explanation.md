He actualizado la política de CORS en tu servidor (`server/index.js`) para permitir solicitudes desde tu frontend de Vercel (`https://sistemadetareas.vercel.app`) y desde el entorno de desarrollo local (`http://localhost:5173`).

También he modificado tu archivo `src/services/api.js` para que la `API_URL` sea dinámica. Esto significa que:
*   En desarrollo (cuando ejecutas `npm run dev` localmente), seguirá apuntando a `http://localhost:3001/api`.
*   En producción (una vez que tu frontend esté desplegado en Vercel), buscará una variable de entorno llamada `VITE_API_URL`.

**Para que tu aplicación funcione correctamente en producción, debes seguir estos pasos:**

1.  **Despliega tu Backend:** Necesitas desplegar tu servidor (el contenido del directorio `server`) a un servicio de hosting público. Algunas opciones populares son:
    *   **Vercel:** Si ya usas Vercel para el frontend, puedes desplegar tu backend Node.js también.
    *   **Render.com**
    *   **Railway.app**
    *   **Fly.io**
    *   Un VPS (servidor privado virtual) como DigitalOcean, AWS EC2, etc.

2.  **Obtén la URL Pública de tu Backend:** Una vez que tu backend esté desplegado, obtendrás una URL pública (por ejemplo, `https://mi-api-de-tareas.render.com`). Esta es la URL a la que tu frontend debe apuntar.

3.  **Configura la Variable de Entorno en Vercel (para el Frontend):**
    *   Ve a la configuración de tu proyecto de frontend en Vercel.
    *   Busca la sección de "Environment Variables" (Variables de Entorno).
    *   Añade una nueva variable con el nombre `VITE_API_URL` y como valor, pega la URL pública de tu backend que obtuviste en el paso anterior (por ejemplo, `https://mi-api-de-tareas.render.com/api`). Asegúrate de incluir `/api` al final si tu backend lo usa.

Una vez que completes estos pasos, tu frontend desplegado en Vercel podrá comunicarse con tu backend desplegado públicamente, resolviendo los problemas de CORS y "Failed to load resource".

Avísame si tienes alguna pregunta o necesitas ayuda con el despliegue del backend.
