-- CREAR TABLA MILESTONES PARA OBJETIVOS DE PROGRESO
-- Ejecutar este script en Supabase para solucionar el error 404

CREATE TABLE milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('weight', 'strength', 'endurance', 'habit', 'technique', 'body_composition', 'health', 'nutrition')),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  unit VARCHAR(20),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_category ON milestones(category);
CREATE INDEX idx_milestones_completed ON milestones(completed);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);

-- RLS (Row Level Security) para que cada usuario solo vea sus datos
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" ON milestones
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_milestones_updated_at();