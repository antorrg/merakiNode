Sí: **Patient + History** es la base correcta, pero yo no guardaría todo en un solo campo grande. Para historia clínica conviene modelar **episodios/consultas**.

Una estructura inicial sólida sería:

```sql
Patient
- id
- firstName
- lastName
- dni
- birthDate
- phone
- email
- address
- createdAt
- updatedAt
- deletedAt
```

```sql
ClinicalRecord / HistoryEntry
- id
- patientId
- visitDate
- reason              -- motivo de consulta
- diagnosis           -- diagnóstico funcional/profesional
- observations        -- observaciones generales
- evolution           -- evolución del paciente
- treatmentPlan       -- plan de tratamiento
- recommendations     -- indicaciones / ejercicios / pautas
- professionalName
- createdAt
- updatedAt
```

Para **praxias/tratamientos**, mejor separarlo:

```sql
Treatment
- id
- historyEntryId
- name                -- Ej: praxias orofaciales, movilidad, respiración
- description
- frequency           -- Ej: 2 veces por semana
- objective           -- objetivo terapéutico
```

Y si querés algo más profesional:

```sql
Diagnosis
- id
- patientId
- title
- description
- startDate
- endDate
- status              -- active | resolved | paused
```

Entonces el modelo quedaría así:

```txt
Patient
  ├── Diagnosis[]
  └── HistoryEntry[]
          └── Treatment[]
```

Mi recomendación: **no hagas una tabla `history` única con todo mezclado**. La historia clínica debería ser una colección cronológica de entradas. Cada entrada representa una consulta, evaluación o evolución.

Ejemplo práctico:

```txt
Paciente: Juan Pérez

Diagnóstico activo:
- Dislalia funcional

Entrada de historia:
- Fecha: 27/05/2026
- Motivo: dificultad articulatoria
- Observación: dificultad en fonema /r/
- Tratamiento:
  - Praxias linguales
  - Ejercicios respiratorios
  - Repetición silábica
- Evolución: mejora parcial
```

Para exportar **DOCX/PDF**, generás un informe desde estos datos:

```txt
Informe del paciente
Datos personales
Diagnósticos activos
Historial cronológico
Tratamientos aplicados
Observaciones finales
Firma profesional
```

Importante: aunque no sea “medicina formal”, son **datos de salud**. En Argentina la historia clínica y los datos sanitarios tienen protección especial; la Ley 26.529 reconoce derechos del paciente sobre la documentación clínica y la confidencialidad, y la Ley 25.326 protege datos personales sensibles. ([Infoleg][1])

Para Tauri + SQLite, yo iría con:

```txt
React/Preact UI
Tauri commands
Rust backend
SQLite local
Exportador DOCX/PDF
Backups cifrados
```

Conclusión: empezá simple con **Patient**, **Diagnosis**, **HistoryEntry** y **Treatment**. Esa estructura te deja crecer sin rehacer toda la base.

[1]: https://servicios.infoleg.gob.ar/infolegInternet/anexos/160000-164999/160432/norma.htm?utm_source=chatgpt.com "Ley 26.529 - Jus.gob.ar - Infoleg"
---
pregunta acerca de legales: 
---
Para una app de consultorio en Argentina, los recaudos más importantes son estos:

## 1. Entender que manejás “datos sensibles”

Los datos de salud están legalmente considerados “datos sensibles”. Eso incluye:

* diagnósticos
* observaciones clínicas
* evolución
* tratamientos
* informes
* estudios adjuntos

La Ley 25.326 los protege especialmente. ([Infoleg][1])

Entonces tu app ya entra en una categoría más delicada que una app administrativa común.

---

# Lo más importante: qué deberías implementar

## A. Usuarios y autenticación

No hagas una app “sin login”.

Mínimo:

```txt
User
- id
- username
- passwordHash
- role
```

Y usar:

* bcrypt/argon2
* sesión local
* bloqueo automático
* logout automático por inactividad

Porque si cualquiera abre la PC y entra a la app, hay un problema serio de confidencialidad.

La ley exige resguardo de intimidad y confidencialidad. ([Infoleg][2])

---

# B. Auditoría (MUY recomendable)

Guardá quién hizo qué.

Ejemplo:

```txt
AuditLog
- id
- userId
- action
- entity
- entityId
- createdAt
```

Ejemplos:

```txt
"CREATED_PATIENT"
"UPDATED_HISTORY"
"EXPORTED_REPORT"
"DELETED_ENTRY"
```

Esto es extremadamente importante si luego:

* se pierde información
* alguien modifica algo
* hay reclamos legales

La historia clínica tiene valor probatorio. ([Facultad de Derecho UBA][3])

---

# C. No borrar físicamente historias clínicas

En vez de:

```sql
DELETE FROM history
```

hacer:

```txt
deletedAt
isArchived
```

Porque legalmente la documentación clínica debe conservarse. La Ley 26.529 exige conservación mínima de 10 años. ([Software de Emergencias Médicas][4])

---

# D. Backups automáticos

MUY importante.

Tu app debería:

* hacer backup diario automático
* permitir exportar backup manual
* restaurar backups

Porque si se rompe la PC del consultorio y se pierde la historia clínica:

* el profesional puede tener problemas legales
* el paciente tiene derecho a acceso a su información

---

# E. Cifrado

Acá tenés dos niveles:

## Nivel mínimo aceptable

SQLite local + Windows protegido + usuario/login.

## Nivel recomendable

Cifrar:

* backups
* PDFs
* DOCX exportados
* o incluso la base SQLite

Con:

* SQLCipher
* o cifrado de archivos AES

Porque muchas veces el riesgo real es:

* robo de notebook
* copia de pendrive
* WhatsApp/email con informes

---

# F. Control de exportaciones

Cuando exportes PDF/DOCX:

NO pongas:

* datos innecesarios
* historial completo si no hace falta

Solo lo mínimo.

Ejemplo:

```txt
Informe funcional
Fecha
Paciente
Diagnóstico funcional
Tratamiento realizado
Evolución
Firma
```

La ley exige que los datos sean “pertinentes y no excesivos”. ([Infoleg][1])

---

# G. Consentimiento y acceso

Idealmente:

* el profesional pueda imprimir/exportar copia
* el paciente pueda solicitar su información

La Ley 26.529 reconoce el derecho del paciente a acceder a su historia clínica. ([Infoleg][2])

---

# H. Firma profesional

No necesitás arrancar con firma digital oficial.

Pero sí conviene:

```txt
professionalName
licenseNumber
specialty
```

en cada informe/exportación.

Más adelante podrías:

* agregar firma digital PDF
* certificados
* hash de integridad

---

# I. Separar “paciente” de “entrada clínica”

Esto es importante legal y técnicamente.

NO:

```txt
patient.notes = "todo mezclado"
```

SÍ:

```txt
Patient
HistoryEntry
Treatment
Diagnosis
Attachment
```

Porque la historia clínica debe ser:

* cronológica
* completa
* trazable

([Boletín Oficial de Buenos Aires][5])

---

# J. Adjuntos

Te recomiendo agregar:

```txt
Attachment
- id
- patientId
- historyEntryId
- fileName
- mimeType
- path
- createdAt
```

Para:

* audiometrías
* ejercicios
* PDFs
* imágenes
* evaluaciones

---
# Hasta aqui estoy de acuerdo, aqui discrepo con la idea, estoy de acuerdo con usar rust con sqlx.

# K. Arquitectura que yo usaría

Con tu perfil técnico:

```txt
Tauri
├── React/Preact
├── SQLite
├── Drizzle o better-sqlite3
├── Rust commands
└── Exportador PDF/DOCX
```

Y el dominio:

```txt
domains/
  patient/
  history/
  diagnosis/
  treatment/
  report/
  auth/
```

---

# Mi recomendación práctica

No intentes hacer una “HCE nacional interoperable”.

Eso implica:

* firma digital fuerte
* estándares médicos
* interoperabilidad
* registros oficiales

Para un consultorio privado pequeño:

* seguridad razonable
* backups
* autenticación
* auditoría
* exportaciones prolijas

ya es un nivel muy bueno y profesional.

Y sinceramente: la mayoría de softwares pequeños de consultorio no están mucho mejor implementados que eso.

[1]: https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm?utm_source=chatgpt.com "PROTECCION DE LOS DATOS - Jus.gob.ar - Infoleg"
[2]: https://servicios.infoleg.gob.ar/infolegInternet/anexos/160000-164999/160432/norma.htm?utm_source=chatgpt.com "Ley 26.529 - Jus.gob.ar - Infoleg"
[3]: https://www.derecho.uba.ar/derechoaldia/notas/hacia-una-historia-clnica-informatizada-los-desafos-de-la-proteccin-de-los-datos-sensibles-intimidad-y-confidencialidad/%2B5326?utm_source=chatgpt.com "Hacia una historia clínica informatizada: los desafíos de la ..."
[4]: https://www.shaman-sge.com/historias-clinicas-electronicas-en-argentina-guia-legal-para-digitalizar-sin-riesgos/?utm_source=chatgpt.com "Historias clínicas electrónicas en Argentina: guía para digitalizar"
[5]: https://boletinoficial.buenosaires.gob.ar/normativaba/norma/340001?utm_source=chatgpt.com "LEY 5669 2016"

---
Entonces diseñalo como **app local monousuario por instalación**, no como sistema clínico multiusuario.

Modelo recomendado:

```txt
Una PC = una instalación = una base SQLite local
```

Podés permitir “profesionales” dentro de la app solo para identificar quién firma o carga informes:

```txt
Professional
- id
- name
- licenseNumber
- specialty
- phone
- email
```

Pero no necesitás usuarios complejos, roles, servidor ni sincronización.

Para tu caso haría esto:

```txt
Patient
Diagnosis
HistoryEntry
Treatment
Professional
ReportExport
AuditLog básico
Backup
```

El `Professional` se usaría así:

```txt
HistoryEntry.professionalId
ReportExport.professionalId
```

Así, si en una misma PC trabajan dos kinesiólogos/fonoaudiólogos, cada entrada queda asociada a quien la cargó.

Recaudos mínimos:

```txt
- login local simple
- contraseña hasheada
- bloqueo por inactividad
- backup automático
- exportación manual de backup
- no borrar historias, solo archivar
- auditoría básica
- cifrar backups
- advertir al usuario dónde se guardan los PDF/DOCX
```

No lo plantearía como HCE interoperable ni clínica en red. Sería una **agenda/historia clínica local para consultorio individual**.

Arquitectura:

```txt
Tauri + React/Preact
SQLite local
Export DOCX/PDF
Backups cifrados
```

Esto es mucho más realista, liviano y mantenible.
---
backups.

---
SQLite tiene una enorme ventaja para apps de escritorio: el backup puede ser extremadamente simple y confiable si entendés cómo funciona el archivo de base de datos.

La idea fundamental:

```txt
SQLite = un archivo
```

Ejemplo:

```txt
consultorio.db
```

Eso ya contiene:

* tablas
* índices
* datos
* relaciones

Entonces un backup puede ser literalmente:

```txt
copiar el archivo
```

Pero hay detalles importantes.

---

# 1. El problema de copiar “en caliente”

Si hacés:

```bash
cp consultorio.db backup.db
```

mientras la app está escribiendo:

* podés copiar una transacción incompleta
* o perder consistencia

Especialmente si usás WAL mode.

---

# 2. WAL mode (muy recomendable)

SQLite moderno suele usar:

```sql
PRAGMA journal_mode=WAL;
```

Esto crea:

```txt
consultorio.db
consultorio.db-wal
consultorio.db-shm
```

Ventajas:

* mejor rendimiento
* menos bloqueos
* más seguro frente a cierres inesperados

Pero el backup cambia.

---

# 3. La forma correcta: SQLite Backup API

La mejor práctica es usar el backup interno de SQLite.

Con better-sqlite3:

```js
db.backup('backup.db')
```

Eso:

* pausa correctamente
* copia consistente
* incluye WAL
* es seguro

Y sinceramente:
es la forma que deberías usar.

---

# 4. Estrategia realista para tu app

Yo haría:

```txt
/backups/
  backup-2026-05-27.db
  backup-2026-05-28.db
```

Y:

* backup automático al cerrar
* backup automático diario
* botón “Crear backup ahora”

---

# 5. NO guardes solo exportaciones PDF

Muchos sistemas malos hacen:

```txt
"bueno, ya exportamos el informe"
```

Eso NO es backup.

El backup real debe preservar:

* pacientes
* historial
* tratamientos
* configuraciones
* profesionales
* adjuntos

---

# 6. Compresión

SQLite comprime muy bien en zip.

Ejemplo:

```txt
consultorio.db → 150 MB
zip → 25 MB
```

Así que:

* podrías zippear automáticamente
* o exportar `.backup.zip`

---

# 7. Cifrado (MUY recomendable)

Especialmente porque son datos clínicos.

Opciones:

## A. Fácil

Cifrar el ZIP:

```txt
backup-2026-05-27.zip
```

con contraseña AES.

---

## B. Más profesional

SQLCipher.

Eso cifra TODA la base SQLite.

Pero:

* complica bastante
* puede dificultar builds
* agrega mantenimiento

Yo empezaría cifrando backups solamente.

---

# 8. Restauración

MUY importante:
hacer restore debe ser trivial.

Ejemplo:

```txt
Configuración
→ Restaurar backup
→ Seleccionar archivo
→ Reiniciar app
```

---

# 9. Versionado de schema

Esto es importantísimo y muchos lo olvidan.

Hoy:

```txt
Patient
```

Mañana agregás:

```txt
deletedAt
```

Entonces backups viejos deben seguir funcionando.

Usá migraciones:

* Drizzle migrations
* Kysely migrations
* Prisma migrations
* o propias

SQLite soporta esto muy bien.

---

# 10. Dónde guardar backups

NO solo junto al `.exe`.

En Windows idealmente:

```txt
Documentos/
AppConsultorio/
Backups/
```

o:

```txt
AppData/Roaming/
```

Con Tauri podés obtener rutas nativas del sistema.

---

# 11. Qué haría yo en tu caso

Sinceramente:

```txt
SQLite WAL
better-sqlite3
backup API
zip automático
AES para backups
rotación de backups
```

Rotación:

```txt
últimos 30 backups
```

---

# 12. Backup incremental (NO al principio)

SQLite soporta cosas avanzadas:

* pages
* VACUUM INTO
* incremental backup

Pero:
para un consultorio chico es innecesario.

Un archivo SQLite de pacientes probablemente pese:

```txt
5 MB
20 MB
100 MB
```

durante años.

Eso es insignificante hoy.

---

# 13. Algo MUY importante: corrupción

SQLite es extremadamente estable.

Pero:
la mayor causa de corrupción suele ser:

```txt
- cortes eléctricos
- discos dañados
- antivirus
- sincronización cloud mala
```

NO SQLite mismo.

Por eso:

* WAL ayuda muchísimo
* backups ayudan más

---

# 14. Mi recomendación concreta

Tu stack podría ser:

```txt
Tauri
React/Preact
better-sqlite3
Drizzle
SQLite WAL
backup automático
zip AES
```

Y honestamente:
para este tipo de app es una arquitectura muy seria y profesional.
