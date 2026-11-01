// Fonction planifiée Netlify : toutes les heures, relances (24 h), annulations automatiques (72 h) et rappels J-1.
export default async () => {
  const res = await fetch(`${process.env.URL}/api/cron/rdv`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  console.log("[cron-rdv]", res.status, await res.text());
};

export const config = { schedule: "@hourly" };
