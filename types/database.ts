/**
 * Types TypeScript correspondant au schéma Supabase
 * (supabase/schema.sql + supabase/migrations/0002_onboarding.sql
 * + supabase/migrations/0003_profile_updates.sql
 * + supabase/migrations/0004_verified_default.sql
 * + supabase/migrations/0005_service_pricing.sql).
 * À terme, remplacer par le type généré via :
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 *
 * Remarque : ces types utilisent volontairement `type` plutôt que
 * `interface` — le parseur de `.select()` de @supabase/postgrest-js
 * résout mal les interfaces dans ses types conditionnels et retombe
 * silencieusement sur `never`.
 */

export type PlanStatus = "essai" | "actif" | "résilié";
export type BookingType = "tel" | "visio";
export type BookingStatus = "demandé" | "confirmé" | "annulé";

export type Professional = {
  id: string;
  auth_user_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  numero_agrement: string; // ORIAS
  specialites: string[] | null;
  bio: string | null;
  photo_url: string | null;
  slug: string;
  ville: string | null;
  cabinet: string | null;
  actif_depuis: string | null; // date ISO
  plan_status: PlanStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  zones_intervention: string[] | null;
  groupe: string | null;
  statut_orias: string | null;
  modalites: string[] | null;
  accepte_nouveaux_clients: boolean;
  verifiee: boolean; // contrôlé par Moneago (trigger serveur) — ne pas exposer en édition libre
  linkedin_url: string | null;
  google_calendar_connected: boolean; // pilote la bannière de sync agenda — pas encore branché
};

export type Motif = {
  id: string;
  professional_id: string;
  libelle: string;
  ordre: number;
};

export type Service = {
  id: string;
  professional_id: string;
  titre: string;
  description: string | null;
  ordre: number;
  prix: string | null; // ex. "Sur demande", "150 €", "À partir de 80 €"
};

export type Availability = {
  id: string;
  professional_id: string;
  jour_semaine: number | null; // 0-6
  date: string | null; // exception ponctuelle
  heure_debut: string; // time
  heure_fin: string; // time
};

export type Booking = {
  id: string;
  professional_id: string;
  motif_id: string | null;
  type_rdv: BookingType;
  client_nom: string;
  client_email: string;
  client_tel: string | null;
  message: string | null;
  creneau_debut: string; // timestamptz
  creneau_fin: string; // timestamptz
  statut: BookingStatus;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      professionals: {
        Row: Professional;
        Insert: Partial<Professional> &
          Pick<Professional, "auth_user_id" | "nom" | "prenom" | "email" | "numero_agrement" | "slug">;
        Update: Partial<Professional>;
        Relationships: [];
      };
      motifs: {
        Row: Motif;
        Insert: Partial<Motif> & Pick<Motif, "professional_id" | "libelle">;
        Update: Partial<Motif>;
        Relationships: [
          {
            foreignKeyName: "motifs_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: Service;
        Insert: Partial<Service> & Pick<Service, "professional_id" | "titre">;
        Update: Partial<Service>;
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
        ];
      };
      availability: {
        Row: Availability;
        Insert: Partial<Availability> &
          Pick<Availability, "professional_id" | "heure_debut" | "heure_fin">;
        Update: Partial<Availability>;
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking> &
          Pick<
            Booking,
            | "professional_id"
            | "type_rdv"
            | "client_nom"
            | "client_email"
            | "creneau_debut"
            | "creneau_fin"
          >;
        Update: Partial<Booking>;
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_motif_id_fkey";
            columns: ["motif_id"];
            isOneToOne: false;
            referencedRelation: "motifs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
