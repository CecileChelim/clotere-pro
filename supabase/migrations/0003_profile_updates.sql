-- Moneago — migration 0003 : LinkedIn, statut de synchronisation d'agenda,
-- et retrait du temps de réponse (remplacé par une info moins arbitraire).
--
-- À exécuter APRÈS supabase/migrations/0002_onboarding.sql.

alter table professionals
  add column if not exists linkedin_url text,
  add column if not exists google_calendar_connected boolean default false;

comment on column professionals.google_calendar_connected is
  'Vrai une fois l''intégration Google Calendar branchée (à venir) — pilote la bannière de synchronisation du dashboard.';

alter table professionals
  drop column if exists temps_reponse;
