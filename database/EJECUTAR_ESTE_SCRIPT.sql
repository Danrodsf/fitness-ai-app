-- 🚨 EJECUTAR ESTE SCRIPT COMPLETO EN SUPABASE SQL EDITOR
-- Soluciona el error 406 (Not Acceptable) en user_profiles

-- 1. Crear tabla user_profiles si no existe
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

-- 2. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- 4. Crear políticas correctas
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Verificar que todo está correcto
SELECT 
  'Tabla creada' as status,
  table_name 
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

SELECT 
  'RLS habilitado' as status,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

SELECT 
  'Políticas creadas' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- RESULTADO ESPERADO:
-- ✅ status: "Tabla creada", table_name: "user_profiles"
-- ✅ status: "RLS habilitado", rowsecurity: true  
-- ✅ status: "Políticas creadas", total_policies: 4