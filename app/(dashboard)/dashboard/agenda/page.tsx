// Squelette — synchronisation de l'agenda (disponibilités récurrentes +
// exceptions ponctuelles) branchée sur la table `availability`.
export default function DashboardAgendaPage() {
  return (
    <div>
      <p className="eyebrow">Agenda</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-2">Synchroniser mon agenda</h1>
      <p className="mt-3 max-w-lg text-sm text-body">
        Connectez votre agenda et définissez vos créneaux récurrents et vos exceptions
        ponctuelles. Cette section arrive dans une prochaine itération.
      </p>

      <div className="card mt-8 p-6">
        <p className="text-sm text-muted">Aperçu de la synchronisation à venir.</p>
      </div>
    </div>
  );
}
