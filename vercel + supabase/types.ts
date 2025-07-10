import type { Database } from './lib/database.types';

export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

// Tipo de dato para el formulario. Se basa en el tipo Insert de Supabase, omitiendo `created_at`
// que es gestionado por la base de datos. El tipo `Insert` ya define `id` como opcional,
// lo que se adapta tanto a la creación como a la edición de vehículos.
export type VehicleFormData = Omit<VehicleInsert, 'created_at'>;
