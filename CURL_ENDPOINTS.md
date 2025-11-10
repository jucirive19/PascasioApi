# Comandos cURL para los Endpoints del Proyecto

Base URL: `http://localhost:3000` (o el puerto configurado en tu variable de entorno PORT)

---

## 1. Registrar Usuario
**POST** `/api/registrar`

Registra un nuevo usuario en el sistema.

```bash
curl -X POST http://localhost:3000/api/registrar \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"usuario123\"}"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario usuario123 registrado exitosamente",
  "username": "usuario123",
  "userId": 1
}
```

---

## 2. Obtener Preguntas
**GET** `/api/obtener-preguntas`

Obtiene todas las preguntas del formulario con sus opciones.

```bash
curl -X GET http://localhost:3000/api/obtener-preguntas \
  -H "Content-Type: application/json"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "preguntas": [
    {
      "id": 1,
      "texto": "Pregunta ejemplo",
      "tipo": "texto",
      "obligatorio": true,
      "es_sensible": false,
      "genera_alerta": false,
      "orden": 1,
      "opciones": []
    }
  ],
  "total": 1
}
```

---

## 3. Guardar Respuestas
**POST** `/api/guardar-respuestas`

Guarda las respuestas de un usuario a las preguntas del formulario.

```bash
curl -X POST http://localhost:3000/api/guardar-respuestas \
  -H "Content-Type: application/json" \
  -d "{
    \"registro_id\": 1,
    \"respuestas\": [
      {
        \"pregunta_id\": 1,
        \"opcion_id\": null,
        \"respuesta_text\": \"Mi respuesta de texto\"
      },
      {
        \"pregunta_id\": 2,
        \"opcion_id\": 5,
        \"respuesta_text\": null
      }
    ]
  }"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Respuestas guardadas exitosamente",
  "respuestas_guardadas": 2,
  "registro_id": 1
}
```

---

## 4. Enviar Formulario
**POST** `/api/enviar`

Envía un formulario completo con información adicional.

```bash
curl -X POST http://localhost:3000/api/enviar \
  -H "Content-Type: application/json" \
  -d "{
    \"registro_id\": 1,
    \"name\": \"Nombre del formulario\",
    \"descripcion\": \"Descripción del formulario\",
    \"confi\": \"Confianza\",
    \"otroConfi\": \"Otro tipo de confianza\",
    \"colegio\": \"Nombre del colegio\",
    \"mensaje\": \"Mensaje adicional\",
    \"latitud\": \"-12.0464\",
    \"longitud\": \"-77.0428\"
  }"
```

**Nota:** `registro_id` es obligatorio. Los demás campos son opcionales.

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Formulario enviado exitosamente 🤗",
  "formulario_id": 1
}
```

---

## Ejemplos de Uso Completo

### Flujo completo: Registrar usuario, obtener preguntas, guardar respuestas y enviar formulario

```bash
# 1. Registrar usuario y obtener el userId de la respuesta
curl -X POST http://localhost:3000/api/registrar \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\"}"

# 2. Obtener preguntas disponibles
curl -X GET http://localhost:3000/api/obtener-preguntas \
  -H "Content-Type: application/json"

# 3. Guardar respuestas (usar el userId obtenido en el paso 1)
curl -X POST http://localhost:3000/api/guardar-respuestas \
  -H "Content-Type: application/json" \
  -d "{
    \"registro_id\": 1,
    \"respuestas\": [
      {
        \"pregunta_id\": 1,
        \"respuesta_text\": \"Mi respuesta\"
      }
    ]
  }"

# 4. Enviar formulario completo
curl -X POST http://localhost:3000/api/enviar \
  -H "Content-Type: application/json" \
  -d "{
    \"registro_id\": 1,
    \"name\": \"Mi Formulario\",
    \"descripcion\": \"Descripción\",
    \"colegio\": \"Mi Colegio\",
    \"latitud\": \"-12.0464\",
    \"longitud\": \"-77.0428\"
  }"
```

---

## Notas Importantes

- **Puerto:** El servidor corre en el puerto `3000` por defecto, o el especificado en la variable de entorno `PORT`
- **CORS:** El servidor está configurado para aceptar peticiones desde `http://localhost:5173`
- **Content-Type:** Todos los endpoints POST requieren `Content-Type: application/json`
- **Validaciones:** 
  - `registro_id` es obligatorio en `/api/enviar` y `/api/guardar-respuestas`
  - `username` es obligatorio en `/api/registrar`
  - `respuestas` debe ser un array no vacío en `/api/guardar-respuestas`

