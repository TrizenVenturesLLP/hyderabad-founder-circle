export type HackathonCard = {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  prizePool: string;
};

export const adminHackathons: HackathonCard[] = [
  {
    id: "ai-hack-x-mrdu-2026",
    title: "AI HACK X MRDU 2026",
    date: "October 3–4, 2026",
    venue: "Malla Reddy Deemed to be University",
    status: "Upcoming",
    prizePool: "₹2,00,000",
  },
];

export function findAdminHackathon(id: string | undefined) {
  return adminHackathons.find((hackathon) => hackathon.id === id) || null;
}
