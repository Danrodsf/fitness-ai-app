# 🤖 Integración con Inteligencia Artificial

## 🎯 **Flujo Implementado**

### **1. Login/Registro Obligatorio** ✅
- Al entrar a la app, el usuario DEBE loguearse o registrarse
- No se puede acceder sin autenticación

### **2. Cuestionario de Onboarding** ✅
- 4 pasos completos con preguntas esenciales:
  - **Paso 1**: Información personal (nombre, edad, peso, altura, género)
  - **Paso 2**: Objetivos (perder peso, ganar músculo, etc.)
  - **Paso 3**: Experiencia (nivel, frecuencia, tiempo disponible)
  - **Paso 4**: Alimentación (comidas, restricciones, tiempo para cocinar)

### **3. Generación de Planes con IA** ✅
- Al completar el cuestionario, se envía toda la info a la IA
- La IA devuelve planes personalizados en formato JSON
- Los planes se guardan en el perfil del usuario

### **4. Dashboard Personalizado** ✅
- Una vez completado el onboarding, se muestra el dashboard
- Los datos mostrados provienen de los planes generados por IA

---

## 🔧 **Configuración de IA**

### **Variables de Entorno Necesarias:**

Añade estas líneas a tu archivo `.env`:

```env
# IA Configuration (OpenAI example)
VITE_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=sk-your-openai-api-key-here

# Alternative: Anthropic Claude
# VITE_AI_ENDPOINT=https://api.anthropic.com/v1/messages
# VITE_AI_API_KEY=sk-ant-your-anthropic-key

# Alternative: Local AI (Ollama, etc.)
# VITE_AI_ENDPOINT=http://localhost:11434/api/generate
# VITE_AI_API_KEY=not-needed-for-local
```

### **APIs de IA Compatibles:**

#### **1. OpenAI (Recomendado)**
- **Modelo**: `gpt-4o-mini` (económico y eficiente)
- **Costo**: ~$0.15 por 1000 tokens
- **Ventajas**: Excelente calidad, formato JSON consistente

#### **2. Anthropic Claude**
- **Modelo**: `claude-3-haiku-20240307`
- **Costo**: ~$0.25 por 1000 tokens
- **Ventajas**: Muy bueno para instrucciones complejas

#### **3. Local (Ollama)**
- **Modelo**: `llama3:8b` o `mistral:7b`
- **Costo**: Gratis (requiere GPU/CPU local)
- **Ventajas**: Privacidad total, sin costos

---

## 📝 **Prompt Generado**

El sistema genera automáticamente un prompt completo con:

### **Datos del Usuario:**
```
- Nombre: Juan
- Edad: 30 años
- Peso: 75 kg
- Altura: 175 cm
- Objetivo: ganar_muscle
- Nivel: intermediate
- Frecuencia: 4 días/semana
- Tiempo: 45 minutos/sesión
- Restricciones: Sin gluten
```

### **Instrucciones para la IA:**
1. Crear plan de entrenamiento personalizado
2. Calcular calorías y macronutrientes
3. Generar comidas según restricciones
4. Adaptar intensidad al nivel de experiencia
5. Considerar tiempo disponible y objetivos

### **Formato de Respuesta JSON:**
```json
{
  "trainingPlan": {
    "name": "Plan personalizado para Juan",
    "workouts": [
      {
        "day": "Lunes",
        "exercises": [
          {
            "name": "Press de banca",
            "sets": 4,
            "reps": "8-10",
            "restTime": 120,
            "tips": ["Mantén los pies firmes", "Baja controladamente"]
          }
        ]
      }
    ]
  },
  "nutritionPlan": {
    "dailyCalories": 2500,
    "macros": { "protein": 150, "carbs": 300, "fats": 80 },
    "meals": [
      {
        "breakfast": {
          "name": "Tortilla de claras",
          "calories": 350,
          "ingredients": ["Claras de huevo", "Espinacas", "Queso"]
        }
      }
    ]
  },
  "tips": ["Mantén constancia", "Hidrátate bien"]
}
```

---

## 🔄 **Reemplazo en Tiempo Real**

### **Cómo Funciona:**
1. **Usuario completa cuestionario** → Se envía a IA
2. **IA devuelve JSON** → Se guarda en `profile.preferences.aiPlans`
3. **Dashboard se actualiza** → Lee los datos de `aiPlans` y los muestra
4. **Datos dinámicos** → Todo el contenido ahora es personalizado

### **Ejemplos de Reemplazo:**

#### **Antes (Datos estáticos):**
```typescript
const workouts = [
  { name: "Rutina genérica", exercises: [...] }
]
```

#### **Después (Datos de IA):**
```typescript
const workouts = profile?.preferences?.aiPlans?.trainingPlan?.workouts || []
```

---

## 🚀 **Siguientes Pasos**

### **Para que funcione completamente:**

1. **Configurar API de IA** (OpenAI recomendado):
   ```bash
   # Obtener API key de OpenAI
   # Añadir al .env:
   VITE_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
   VITE_AI_API_KEY=sk-tu-clave-aqui
   ```

2. **Configurar Supabase** (para guardar datos):
   ```bash
   # Seguir SETUP_RAPIDO.md
   VITE_SUPABASE_URL=tu-url
   VITE_SUPABASE_ANON_KEY=tu-clave
   ```

3. **Actualizar dashboards** para mostrar datos de IA:
   - `TrainingDashboard` → Usar `aiPlans.trainingPlan`
   - `NutritionDashboard` → Usar `aiPlans.nutritionPlan`
   - `ProgressDashboard` → Calcular métricas personalizadas

---

## 💡 **Modo Fallback**

Si no hay IA configurada, el sistema:
- ✅ **Funciona sin errores**
- ✅ **Genera planes básicos** usando fórmulas matemáticas
- ✅ **Calcula calorías** con Harris-Benedict
- ✅ **Crea rutinas genéricas** según nivel y objetivo

---

## 🎯 **Resultado Final**

Una vez configurado tendrás:

### **✅ App Completa de Fitness con IA:**
- 🔐 **Login obligatorio**
- 📋 **Cuestionario profesional**
- 🤖 **Planes generados por IA**
- 💾 **Datos guardados en la nube**
- 📱 **Dashboard personalizado**
- 🔄 **Contenido dinámico en tiempo real**

### **🎨 Experiencia de Usuario:**
```
Usuario entra → Debe loguearse → Completa cuestionario →
IA genera planes → Dashboard muestra contenido personalizado
```

¡Tu app será única porque cada usuario tendrá planes completamente personalizados generados por IA! 🚀