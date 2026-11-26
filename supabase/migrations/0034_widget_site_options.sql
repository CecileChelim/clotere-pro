-- clotere-pro — migration 0034 : formule page, widget et site en abonnements Stripe séparés (comme les options
-- Visibilité / Avis), pour pouvoir résilier l'un sans l'autre.
-- offre_widget / stripe_sub_widget : widget de prise de rdv (69 € HT / mois / pro).
-- site_paye / stripe_sub_site : site internet de la formule page (69 € contact, 99 € rdv + actualités).
-- À exécuter APRÈS la 0033.

alter table cabinets
  add column if not exists offre_widget boolean not null default false,
  add column if not exists stripe_sub_widget text,
  add column if not exists site_paye boolean not null default false,
  add column if not exists stripe_sub_site text;

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
    new.leads_carte_at := old.leads_carte_at;
    new.page_seule := old.page_seule;
    new.offre_widget := old.offre_widget;
    new.stripe_sub_widget := old.stripe_sub_widget;
    new.site_paye := old.site_paye;
    new.stripe_sub_site := old.stripe_sub_site;
  end if;
  return new;
end;
$$ language plpgsql security definer;
