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
        Relationships: [
          {
            foreignKeyName: "analytics_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      consignments: {
        Row: {
          id: number
          created_at: string
          owner_name: string
          owner_phone: string
          owner_email: string
          make: string
          model: string
          year: number
          mileage: number
          engine: string
          transmission: "Automática" | "Manual"
          price_requested: number
          extra_info: string | null
          images: string[]
          status:
            | "pending"
            | "in_review"
            | "approved"
            | "published"
            | "sold"
            | "rejected"
          internal_notes: string | null
          vehicle_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          owner_name: string
          owner_phone: string
          owner_email: string
          make: string
          model: string
          year: number
          mileage: number
          engine: string
          transmission: "Automática" | "Manual"
          price_requested: number
          extra_info?: string | null
          images: string[]
          status?:
            | "pending"
            | "in_review"
            | "approved"
            | "published"
            | "sold"
            | "rejected"
          internal_notes?: string | null
          vehicle_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          owner_name?: string
          owner_phone?: string
          owner_email?: string
          make?: string
          model?: string
          year?: number
          mileage?: number
          engine?: string
          transmission?: "Automática" | "Manual"
          price_requested?: number
          extra_info?: string | null
          images?: string[]
          status?:
            | "pending"
            | "in_review"
            | "approved"
            | "published"
            | "sold"
            | "rejected"
          internal_notes?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: number
          created_at: string
          customer_name: string
          rating: number
          comment: string | null
          is_visible: boolean
          response_from_owner: string | null
          vehicle_id: number | null
          show_on_homepage: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          customer_name: string
          rating: number
          comment?: string | null
          is_visible?: boolean
          response_from_owner?: string | null
          vehicle_id?: number | null
          show_on_homepage?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          customer_name?: string
          rating?: number
          comment?: string | null
          is_visible?: boolean
          response_from_owner?: string | null
          vehicle_id?: number | null
          show_on_homepage?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      site_config: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
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
          transmission: "Automática" | "Manual"
          fuel_type: string
          vehicle_type: string
          description: string
          images: string[]
          is_featured: boolean
          is_sold: boolean
          display_order: number
          video_url: string | null
          consignment_id: number | null
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
          transmission: "Automática" | "Manual"
          fuel_type: string
          vehicle_type: string
          description: string
          images: string[]
          is_featured?: boolean
          is_sold?: boolean
          display_order?: number
          video_url?: string | null
          consignment_id?: number | null
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
          transmission?: "Automática" | "Manual"
          fuel_type?: string
          vehicle_type?: string
          description?: string
          images?: string[]
          is_featured?: boolean
          is_sold?: boolean
          display_order?: number
          video_url?: string | null
          consignment_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_consignment_id_fkey"
            columns: ["consignment_id"]
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_vehicles: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}