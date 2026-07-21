# Reglas de patient

Parseo de nombres:
```javascript
{
          'patientId: 'patientId',
          'first_name': 'Nombre',
          'last_name': 'Apellido',
          'type_doc': 'Tipo documento',
          'identity_code': 'numero',
          'birth_date': 'Fecha nac',
          'age': 'edad',
          'address': 'direccion',
}

```

    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    type_doc TEXT,
    identity_code TEXT UNIQUE,
    birth_date TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,