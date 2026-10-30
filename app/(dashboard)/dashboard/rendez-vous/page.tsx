// Squelette — liste des demandes de RDV (motif, créneau, message client)
// branchée sur la table `bookings`.
export default function DashboardRendezVousPage() {
  return (
    <div>
      <p className="eyebrow">Rendez-vous</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-2">Vos demandes de rendez-vous</h1>
      <p className="mt-3 max-w-lg text-sm text-body">
        Retrouvez ici toutes les demandes de rendez-vous reçues via votre fiche, avec le motif,
        le créneau et le message du client. Cette section arrive dans une prochaine itération.
      </p>

      <div className="card mt-8 p-6">
        <p className="text-sm text-muted">Aucune demande à afficher pour le moment.</p>
      </div>
    </div>
  );
}
