import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase com fallback para evitar erros
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types adaptados à estrutura real do banco
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  specialty: string | null;
  crm: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  type: 'laudo' | 'receita' | 'relatorio';
  subtype: string;
  patient_name: string;
  patient_age: number;
  patient_sex: string;
  content: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}
