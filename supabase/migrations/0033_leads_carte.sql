-- clotere-pro — migration 0033 : formule page, carte demandée à la première demande de rendez-vous.
-- Le cabinet « page seule » a l'apport d'affaires actif dès l'inscription (leads_actifs), sans carte.
-- leads_carte_at : carte enregistrée (webhook Stripe, checkout « setup » type leads). Tant qu'elle est vide,
-- les demandes reçues sont masquées au pro (coordonnées du client) jusqu'à l'ajout de la carte.
-- À exécuter APRÈS la 0031.

alter table cabinets add column if not exists leads_carte_at timestamptz;

-- Les cabinets déjà activés l'ont été avec une carte.
update cabinets set leads_carte_at = leads_actives_at where leads_carte_at is null and leads_actives_at is not null;

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
  end if;
  return new;
end;
$$ language plpgsql security definer;
