export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: number
          created_at: string
          event_type: string
          vehicle_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          event_type: string
          vehicle_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          event_type?: string
          vehicle_id?: number | null
        }
      }
      vehicles: {
        Row: {
          id: number
          created_at: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          engine: string
          transmission: 'Automática' | 'Manual'
          fuelType: string
          description: string
          images: string[]
        }
        Insert: {
          id?: number
          created_at?: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          engine: string
          transmission: 'Automática' | 'Manual'
          fuelType: string
          description: string
          images: string[]
        }
        Update: {
          id?: number
          created_at?: string
          make?: string
          model?: string
          year?: number
          price?: number
          mileage?: number
          engine?: string
          transmission?: 'Automática' | 'Manual'
          fuelType?: string
          description?: string
          images?: string[]
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}