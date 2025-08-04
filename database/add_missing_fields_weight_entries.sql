-- AGREGAR CAMPOS FALTANTES A WEIGHT_ENTRIES
-- Ejecutar este script para agregar body_fat y muscle_mass

ALTER TABLE weight_entries 
ADD COLUMN body_fat DECIMAL(4,2), -- porcentaje de grasa corporal
ADD COLUMN muscle_mass DECIMAL(5,2); -- masa muscular en kg

-- Comentario: Los campos son opcionales (NULL permitido) porque no siempre se miden