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
      bots: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system_prompt: string
          api_key: string
          is_active: boolean
          flow_data: Json | null
          appearance: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system_prompt?: string
          api_key?: string
          is_active?: boolean
          flow_data?: Json | null
          appearance?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          api_key?: string
          is_active?: boolean
          flow_data?: Json | null
          appearance?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          bot_id: string
          filename: string
          file_path: string
          file_type: string
          file_size: number
          chunk_count: number
          created_at: string
        }
        Insert: {
          id?: string
          bot_id: string
          filename: string
          file_path: string
          file_type: string
          file_size: number
          chunk_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          bot_id?: string
          filename?: string
          file_path?: string
          file_type?: string
          file_size?: number
          chunk_count?: number
          created_at?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          bot_id: string
          content: string
          embedding: number[] | null
          chunk_index: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          bot_id: string
          content: string
          embedding?: number[] | null
          chunk_index: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          bot_id?: string
          content?: string
          embedding?: number[] | null
          chunk_index?: number
          created_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          bot_id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          bot_id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          bot_id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_count: number
          filter_bot_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
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

export type Bot = Database['public']['Tables']['bots']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentChunk = Database['public']['Tables']['document_chunks']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
