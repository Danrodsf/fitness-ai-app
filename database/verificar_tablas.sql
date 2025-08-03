-- VERIFICACIÓN Y CORRECCIÓN DE TABLA user_profiles

-- 1. Verificar si la tabla user_profiles existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles';

-- 2. Si no existe, crearla (ejecutar solo si la anterior devuelve vacío)
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

-- 3. Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. Habilitar RLS si no está activo
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas si no existen
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Verificar estructura de la tabla
\d user_profiles;

-- 7. Probar insertar un perfil de prueba (cambiar UUID por tu user_id real)
-- INSERT INTO user_profiles (user_id, name, age) 
-- VALUES ('tu-user-id-aqui', 'Test User', 25)
-- ON CONFLICT (user_id) DO NOTHING;

-- 8. Verificar que funciona la consulta
-- SELECT * FROM user_profiles WHERE user_id = 'tu-user-id-aqui';

-- RESULTADO ESPERADO:
-- - La tabla user_profiles debe existir
-- - RLS debe estar habilitado (rowsecurity = true)
-- - Las políticas deben estar creadas
-- - La estructura debe coincidir con el esquema esperado