-- CREAR TABLA WEIGHT_ENTRIES PARA HISTORIAL DE PESO
-- Ejecutar este script en Supabase para solucionar el error 404

CREATE TABLE weight_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_weight_entries_user_id ON weight_entries(user_id);
CREATE INDEX idx_weight_entries_date ON weight_entries(date);
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, date);

-- RLS (Row Level Security) para que cada usuario solo vea sus datos
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight entries" ON weight_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries" ON weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries" ON weight_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries" ON weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_weight_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weight_entries_updated_at
  BEFORE UPDATE ON weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_weight_entries_updated_at();