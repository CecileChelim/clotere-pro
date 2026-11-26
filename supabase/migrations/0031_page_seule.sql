-- clotere-pro — migration 0031 : formule « page gratuite » (apport d'affaires sans abonnement).
-- À exécuter dans l'éditeur SQL Supabase APRÈS la 0028 (leads) et la 0030.
--
-- page_seule : cabinet inscrit via « Créer votre page avocat / expert-comptable » (/signup?formule=page).
--   Pas d'abonnement : l'espace n'est jamais bloqué à la fin de l'essai, aucune relance d'essai.
--   Les rendez-vous pris depuis la page clotere.fr sont facturés à l'unité (leads), une fois la carte enregistrée.
-- leads_cgv_at : date d'acceptation des CGV et du tarif par rendez-vous, au moment de l'activation.

alter table cabinets
  add column if not exists page_seule boolean not null default false,
  add column if not exists leads_cgv_at timestamptz;

-- Champs de facturation modifiables uniquement côté serveur (clé service) :
-- reprise de la 0019 + Google Ads (0023) + apport d'affaires (0028) + page seule (0031).
-- page_seule reste libre à l'INSERT (le trigger ne porte que sur les UPDATE).
create or replace function protect_cabinet_billing_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.trial_ends_at := old.trial_ends_at;
    new.subscription_status := old.subscription_status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.owner_auth_user_id := old.owner_auth_user_id;
    new.offre_visibilite := old.offre_visibilite;
    new.offre_visibilite_depuis := old.offre_visibilite_depuis;
    new.offre_site := old.offre_site;
    new.offre_site_depuis := old.offre_site_depuis;
    new.offre_rdv := old.offre_rdv;
    new.offre_avis := old.offre_avis;
    new.offre_avis_depuis := old.offre_avis_depuis;
    new.stripe_sub_visibilite := old.stripe_sub_visibilite;
    new.stripe_sub_avis := old.stripe_sub_avis;
    new.abonnement_periode := old.abonnement_periode;
    new.visibilite_demande_at := old.visibilite_demande_at;
    new.offre_ads := old.offre_ads;
    new.leads_actifs := old.leads_actifs;
    new.leads_ouverts := old.leads_ouverts;
    new.leads_plafond := old.leads_plafond;
    new.leads_actives_at := old.leads_actives_at;
    new.leads_facture_mois := old.leads_facture_mois;
    new.leads_cgv_at := old.leads_cgv_at;
    new.page_seule := old.page_seule;
  end if;
  return new;
end;
$$ language plpgsql security definer;
