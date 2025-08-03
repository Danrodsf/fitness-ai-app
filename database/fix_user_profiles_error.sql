-- SOLUCIÓN PARA ERROR 406 (Not Acceptable) en user_profiles

-- El error 406 típicamente indica problemas con:
-- 1. Tabla no existe
-- 2. RLS mal configurado
-- 3. Políticas de seguridad bloqueando acceso

-- PASO 1: Verificar si la tabla existe
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- PASO 2: Si no existe, crearla
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(255),
  age INTEGER,
  weight DECIMAL(5,2),
  height INTEGER,
  goals TEXT[],
  preferences JSONB DEFAULT '{
    "theme": "system", 
    "notifications": true, 
    "autoBackup": true, 
    "language": "es"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- PASO 4: Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas existentes que pueden estar mal configuradas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- PASO 6: Crear políticas correctas
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles 
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 7: Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- PASO 8: Verificar estructura final
\d user_profiles;

-- PASO 9: Probar acceso (reemplazar con tu user_id real)
-- SELECT * FROM user_profiles WHERE user_id = '209c0aab-5261-4cb6-a886-6a2fc03f1a5a';

-- RESULTADO ESPERADO:
-- ✅ Tabla user_profiles existe
-- ✅ RLS habilitado (rowsecurity = t)
-- ✅ 4 políticas creadas (SELECT, UPDATE, INSERT, DELETE)
-- ✅ Query de prueba devuelve 0 rows (no error 406)

-- VERIFICACIÓN ADICIONAL: Permisos de usuario
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Si auth.uid() devuelve NULL, el problema es de autenticación en Supabase