-- Script para borrar todos los registros de la tabla weight_entries
-- ⚠️  PRECAUCIÓN: Este script eliminará TODOS los datos de peso registrados
-- Ejecutar solo si estás seguro de que quieres borrar todos los registros

-- Opción 1: Borrar todos los registros (recomendado para testing)
DELETE FROM weight_entries;

-- Opción 2: Borrar registros de un usuario específico
-- Reemplaza 'USER_ID_AQUI' con el ID real del usuario
-- DELETE FROM weight_entries WHERE user_id = 'USER_ID_AQUI';

-- Opción 3: Borrar registros más antiguos que una fecha específica
-- DELETE FROM weight_entries WHERE created_at < '2024-01-01';

-- Verificar que la tabla quedó vacía
SELECT COUNT(*) as registros_restantes FROM weight_entries;

-- Si quieres resetear también el auto-increment (si aplicable)
-- ALTER SEQUENCE weight_entries_id_seq RESTART WITH 1;