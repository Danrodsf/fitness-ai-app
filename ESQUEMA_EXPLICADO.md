# 📊 Esquema de Base de Datos Explicado

## 🤔 **Tu Pregunta:**
> "En el usuario no veo ninguna parte que guardes el email. ¿Cómo funciona esto?"

## ✅ **Respuesta:**
El email se guarda automáticamente en una tabla especial de Supabase. Tenemos **2 lugares** donde se guardan datos del usuario:

---

## 🏗️ **Arquitectura de Usuarios en Supabase**

### **1. Tabla `auth.users` (Automática de Supabase)**
```sql
-- Esta tabla la maneja Supabase automáticamente
auth.users {
  id: UUID                    -- ✅ ID único del usuario
  email: string              -- ✅ EMAIL del usuario
  encrypted_password: string -- ✅ Contraseña encriptada
  email_confirmed_at: date   -- ✅ Confirmación de email
  created_at: timestamp      -- ✅ Fecha de registro
  -- Supabase maneja todo esto automáticamente
}
```

### **2. Tabla `user_profiles` (Nuestra tabla personalizada)**
```sql
-- Esta es nuestra tabla para datos adicionales
user_profiles {
  id: UUID                   -- ✅ ID del perfil
  user_id: UUID             -- ✅ Conecta con auth.users.id
  name: string              -- ✅ Nombre del usuario
  age: number               -- ✅ Edad
  weight: number            -- ✅ Peso
  height: number            -- ✅ Altura
  goals: array              -- ✅ Objetivos de fitness
  preferences: json         -- ✅ Configuraciones de la app
}
```

---

## 🔗 **Cómo se Conectan**

```
REGISTRO DE USUARIO:
┌─────────────────┐    ┌─────────────────┐
│   auth.users    │    │  user_profiles  │
│                 │    │                 │
│ email: "juan@..." │ ←→ │ user_id: "123..." │
│ id: "123abc"    │    │ name: "Juan"    │
│ password: ***   │    │ age: 30         │
└─────────────────┘    │ weight: 75      │
                       │ height: 175     │
                       └─────────────────┘
```

---

## 🔄 **Flujo de Registro Corregido**

### **Paso 1: Usuario se registra**
```typescript
// Usuario ingresa: email = "juan@gmail.com", password = "123456"
AuthService.register({ email, password, confirmPassword })
```

### **Paso 2: Supabase crea registro en `auth.users`**
```sql
-- Supabase automáticamente crea:
INSERT INTO auth.users (id, email, encrypted_password) 
VALUES ('123abc', 'juan@gmail.com', 'encrypted_password');
```

### **Paso 3: Nosotros creamos perfil en `user_profiles`**
```sql
-- Nuestro código crea:
INSERT INTO user_profiles (user_id, name, age, weight, height, goals) 
VALUES ('123abc', 'juan', 25, 70, 170, ['ganar_musculatura']);
```

### **Paso 4: Usuario queda completamente registrado**
```typescript
// Ahora tenemos:
AuthUser {
  id: "123abc",
  email: "juan@gmail.com",     // ✅ Viene de auth.users
  created_at: "2025-01-30"
}

UserProfile {
  user_id: "123abc",           // ✅ Conecta con auth.users
  name: "juan",                // ✅ Viene de user_profiles
  age: 25,
  weight: 70,
  // ... más datos
}
```

---

## 🎯 **Ventajas de este Esquema**

### **✅ Separación Clara:**
- **`auth.users`** → Maneja autenticación (Supabase)
- **`user_profiles`** → Maneja datos de fitness (nosotros)

### **✅ Seguridad:**
- Supabase encripta contraseñas automáticamente
- Row Level Security protege datos por usuario

### **✅ Flexibilidad:**
- Podemos añadir campos a `user_profiles` sin afectar autenticación
- Supabase maneja confirmación de email, recuperación de contraseña, etc.

### **✅ Escalabilidad:**
- Separamos preocupaciones (auth vs datos de app)
- Fácil de mantener y expandir

---

## 🔧 **Corrección Aplicada**

### **Antes (Problemático):**
```typescript
// Solo registraba en auth.users, faltaba el perfil
register() {
  return supabase.auth.signUp({ email, password })
  // ❌ No creaba user_profiles
}
```

### **Después (Corregido):**
```typescript
// Registra en auth.users Y crea user_profiles
register() {
  const authResult = supabase.auth.signUp({ email, password })
  
  if (authResult.user) {
    // ✅ Automáticamente crea el perfil
    this.createProfile(authResult.user.id, defaultProfileData)
  }
}
```

---

## 📋 **Verificación del Esquema**

### **✅ Lo que SÍ tienes en el esquema:**
- ✅ Tabla `user_profiles` con campos correctos
- ✅ Relación `user_id` → `auth.users.id`
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers para `updated_at`

### **✅ Lo que Supabase añade automáticamente:**
- ✅ Tabla `auth.users` (email, password, etc.)
- ✅ Funciones de autenticación
- ✅ Encriptación de contraseñas
- ✅ Confirmación de email

---

## 🎉 **Resultado Final**

Cuando un usuario se registra con `juan@gmail.com`:

1. **Email se guarda** en `auth.users.email` ✅
2. **Perfil se crea** en `user_profiles` ✅  
3. **Ambos se conectan** por `user_id` ✅
4. **Usuario puede hacer login** con email/password ✅
5. **App obtiene datos completos** (email + perfil) ✅

**El esquema está correcto**, solo faltaba el flujo automático de creación de perfil, que ya está corregido. 🚀