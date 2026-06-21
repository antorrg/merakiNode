Para manejar el caso en el que un paciente es un menor de edad y necesita estar asociado a sus padres/tutores, tienes varias alternativas de diseño. La elección dependerá de cómo funcione la lógica de negocio de tu clínica o sistema. 

Aquí tienes las ideas principales de cómo puedes modelar esto, desde la más sencilla hasta la más robusta:

### 1. Una sola tabla (Modelo Autoreferencial) 🏆 *Recomendado*
En lugar de tener una tabla `parents` separada, **todos** (tanto los padres como los niños) se guardan en la misma tabla de `users` o `patients`.
*   **¿Cómo funciona?** Agregas una columna llamada `tutor_id` (o `parent_id`) en tu tabla principal. 
*   Si el paciente es un adulto, ese campo queda vacío (Nulo).
*   Si el paciente es un niño, ese campo apunta al ID de su padre (que es otro usuario en la misma tabla).
*   **Pros:** Si el día de mañana el padre también quiere atenderse como paciente, ya lo tienes registrado y no duplicas datos. Es muy escalable.
*   **Contras:** Tienes que hacer un "Self-Join" cuando quieres consultar los datos del niño junto con los de su padre (aunque la mayoría de los ORMs manejan esto muy fácil).

### 2. Dos tablas separadas (Tu enfoque actual)
Mantienes la tabla de pacientes y la nueva tabla `parents` separada.
*   **¿Cómo funciona?** El paciente tiene una llave foránea (Foreign Key) apuntando al registro en la tabla `parents`.
*   **Pros:** Útil si los datos que guardas de un "Padre" son **completamente diferentes** a los de un "Paciente" (por ejemplo, el paciente niño no tiene email, contraseña ni teléfono, pero el padre sí). Las responsabilidades están 100% separadas.
*   **Contras:** Si el padre eventualmente se convierte en paciente de la clínica, tendrás que volver a cargar sus datos personales en la tabla de pacientes (duplicación de información).

### 3. Agrupación por "Familia" o "Cuenta" (Modelo más avanzado)
Si el sistema maneja facturación conjunta o turnos grupales, se crea una entidad superior.
*   **¿Cómo funciona?** Creas una tabla `FamilyGroup` o `Account`. Todos los usuarios (padres e hijos) pertenecen a esa cuenta. Le asignas un rol a cada integrante dentro de la cuenta (Ej: "Titular" vs "Dependiente").
*   **Pros:** Ideal para clínicas grandes, coberturas médicas (obras sociales) o cuando los pagos los realiza siempre una sola persona del grupo familiar.
*   **Contras:** Puede ser demasiado complejo si tu aplicación recién está empezando o no necesita tanta estructura.

### 4. Campos de "Tutor" en la misma tabla (El enfoque rápido)
Si el padre no va a interactuar con el sistema (no va a iniciar sesión, ni se le va a facturar, ni va a ser paciente) y solo necesitas sus datos "por si pasa algo".
*   **¿Cómo funciona?** No creas ninguna tabla nueva. Simplemente agregas columnas como `guardian_name`, `guardian_phone` y `guardian_relationship` directamente en la tabla del paciente. 
*   **Pros:** Extremadamente simple. 
*   **Contras:** Muy rígido. Si dos niños son hermanos, tendrás que escribir los datos del padre dos veces.

---

**💡 ¿Qué te sugiero para tu Feature?**
Si crees que el padre **nunca** va a ser paciente del sistema, la **opción 2** (tu tabla `parents`) está perfecta.
Pero si existe la más mínima posibilidad de que el padre termine sacando un turno para sí mismo en el futuro, ve por la **opción 1 (Autoreferencia)**. Te ahorrará muchos dolores de cabeza de sincronización de datos más adelante.
---

Viewed schema.ts:18-49

¡Completamente! Ese es el siguiente nivel de evolución de tu base de datos y es la forma más realista de modelar las familias en el mundo real. 

Si un niño tiene una madre y un padre (o incluso abuelos) que necesitan figurar como contactos, poner un solo `parent_id` en la tabla se queda corto. Necesitas una **relación de Muchos a Muchos (N:M)**.

Aquí tienes la idea de cómo se modela eso:

### 1. La Tabla Intermedia (Join Table)
En lugar de tener la columna `parent_id` en tu tabla `patients`, la eliminas y creas una tabla nueva (por ejemplo, `patient_guardians` o `patient_relations`) que una a ambos.

Esta tabla conectará a dos pacientes de tu tabla principal y tendría columnas como estas:
*   `guardian_id` (Apunta al ID del adulto en la tabla `patients`)
*   `dependent_id` (Apunta al ID del niño en la tabla `patients`)
*   `relationship_type` (Un texto que diga "Madre", "Padre", "Abuelo", "Tutor Legal", etc.)
*   `is_primary_contact` (Un booleano: true/false. Súper útil para saber a quién llamar primero en caso de emergencia).

### 2. ¿Qué pasa en tu Dominio (Domain)?
Tu clase `Patient` ahora en lugar de tener un solo padre, tendrá un **arreglo (array)** de tutores.
*   En tu entidad, podrías tener algo como: `patient.guardians = [Madre, Padre]`

### 3. ¿Cómo hidratas los datos faltantes del niño ahora?
Dado que ahora tienes múltiples tutores, la lógica de "rellenar" los datos cambia un poquito. 
*   **Decisión de prioridad:** Si vas a tomar el teléfono del padre para rellenar los datos del niño, ¿de cuál de los dos lo tomas? 
*   **Solución:** Para eso es ideal la columna `is_primary_contact` que mencioné arriba. Tu código dirá: *"Si este paciente es un niño, busca en sus tutores el que esté marcado como contacto principal (primary contact), y usa el teléfono y correo de esa persona"*.

### 💡 Resumen del modelo conceptual:
1. **`patients`**: Sigue guardando a TODOS (adultos y niños), pero ya no tiene la columna `parent_id`.
2. **`patient_relations`**: Es la tabla "puente" que dice quién es hijo de quién, y qué tipo de parentesco tienen.

Este es, por lejos, el enfoque más profesional y escalable para un sistema médico o de turnos. Te permite manejar familias ensambladas, padres divorciados, y cualquier escenario del mundo real sin duplicar información.