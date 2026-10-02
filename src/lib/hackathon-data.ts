import type { HackathonDetails, HackathonDomain, ProblemStatement } from "./hackathon";

export const POSTER_DOMAINS: HackathonDomain[] = [
  {
    id: "ui-ux",
    name: "UI/UX Design",
    shortName: "UI/UX",
    tagline: "User-centric product design, design systems, and intuitive micro-interactions.",
    description:
      "Craft high-fidelity design prototypes, responsive mobile & web interfaces, accessible interaction systems, and end-to-end user journeys that solve real-world usability friction.",
  },
  {
    id: "web-dev",
    name: "Web Development",
    shortName: "Web Dev",
    tagline: "Full-stack scalable web applications, modern APIs, and robust architectures.",
    description:
      "Engineer production-ready web apps using modern frameworks, performant database backends, edge functions, and real-time state synchronization.",
  },
  {
    id: "vibe-coding",
    name: "Vibe Coding",
    shortName: "Vibe Coding",
    tagline: "Rapid AI-assisted prototyping, conversational building, and creative synthesis.",
    description:
      "Harness the power of natural language code generators, LLM-driven development loops, multimodal tool calling, and rapid shipping to build polished software at 10x speed.",
  },
  {
    id: "agentic-ai",
    name: "Agentic AI",
    shortName: "Agentic AI",
    tagline:
      "Autonomous multi-agent workflows, tool-augmented reasoning, and intelligent decision systems.",
    description:
      "Construct autonomous agents capable of dynamic reasoning, multi-step execution plans, memory persistence, human-in-the-loop oversight, and API ecosystem integration.",
  },
];

export const POSTER_HACKATHON_DETAILS: HackathonDetails = {
  id: "ai-hack-x-mrdu-2026",
  university: "MALLA REDDY (MR) (DEEMED TO BE UNIVERSITY)",
  accreditation: "NAAC A++ Accredited with MHRD · Under Section 3 of UGC Act - 1956",
  school: "School of Computer Science and Engineering",
  department: "Department of CSE-AIML",
  title: "AI HACK X MRDU",
  durationBadge: "24HRS HACKATHON",
  tagline: "INNOVATE BEYOND TOMORROW",
  motto: "CODE · COLLABORATE · CREATE IMPACT",
  blurb:
    "A premier 24-hour national hackathon hosted by the Department of CSE-AIML at Malla Reddy (MR) Deemed to be University in collaboration with Trizen, JetBrains, Red Bull, and industry pioneers. Compete across 4 tracks for prizes, internship opportunities, and real-world impact.",
  prizePool: "₹2,00,000",
  posterImage: "/image.png",
  venue: {
    name: "MRDU Campus",
    campus: "Malla Reddy (MR) (Deemed to be University)",
    area: "Maisammaguda, Dulapally",
    address:
      "Malla Reddy (MR) Deemed to be University, Maisammaguda, Dulapally, Secunderabad / Hyderabad, Telangana 500100",
    city: "Hyderabad",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Malla+Reddy+University+Maisammaguda+Hyderabad",
    mapsEmbedUrl:
      "https://www.google.com/maps?q=Malla+Reddy+University+Maisammaguda+Hyderabad&output=embed",
    time: "24 Hours Continuous Track",
    dateLabel: "OCT 3RD & 4TH 2026",
    dateISO: "2026-10-03",
    endDateISO: "2026-10-04",
    format: "Offline",
    teamSize: "2–6 Members",
  },
  domains: POSTER_DOMAINS,
  perks: [
    {
      title: "Stipend Based Internship",
      description: "Direct fast-track interview and internship offers from partner startups.",
    },
    {
      title: "Cultural Night",
      description: "Live musical performances, community networking, and entertainment.",
    },
    {
      title: "Innovation Stalls",
      description: "Startup demo booths, gadget showcases, and sponsor interactive zones.",
    },
    {
      title: "Bonfire & Chill",
      description: "Late-night open air founder bonfire and strategy brainstorming sessions.",
    },
    {
      title: "Food & Refreshments",
      description: "All meals, energy drinks by Red Bull, midnight snacks, and breakfast provided.",
    },
  ],
  partners: [
    { name: "TRIZEN", role: "Co-Host & Ecosystem Partner" },
    { name: "Startup Telangana (st.)", role: "Government & Innovation Partner" },
    { name: "JetBrains", role: "Developer Tooling Partner" },
    { name: "tivi AILabs", role: "AI Automation Partner" },
    { name: "The 1% School", role: "Knowledge & Talent Partner" },
    { name: "EDXcellence", role: "Education Partner" },
    { name: "Red Bull", role: "Official Energy Drink Partner" },
  ],
  coordinators: [
    { name: "Mr. P. Panduraju", designation: "Asst Prof", type: "faculty" },
    { name: "Ms J. Saroja", designation: "Asst Prof", type: "faculty" },
    { name: "Mr Ch. V. Surya Narayana", designation: "Asst Prof", type: "faculty" },
    { name: "Mr R. Ravi", designation: "Asst Prof", type: "faculty" },
    { name: "Mrs A. Sravani", designation: "Asst Prof", type: "faculty" },
    { name: "Dr S. Mahipal", designation: "Assoc Prof", type: "academic" },
    { name: "Mr B. Srinivas", designation: "Asst Prof", type: "academic" },
    {
      name: "K. Shashikanth (AIML)",
      designation: "Student Coordinator",
      phone: "9908804595",
      type: "student",
    },
    {
      name: "K. Manoj (AIML)",
      designation: "Student Coordinator",
      phone: "70133 35224",
      type: "student",
    },
    {
      name: "A. Lohith (AIML)",
      designation: "Student Coordinator",
      phone: "93460 32215",
      type: "student",
    },
    {
      name: "C. Hasika (AIML)",
      designation: "Student Coordinator",
      phone: "63098 92478",
      type: "student",
    },
    {
      name: "V. Ramcharan (AIML)",
      designation: "Student Coordinator",
      phone: "9642604029",
      type: "student",
    },
    { name: "Sr. Ck. Malla Reddy", designation: "Founder Chairman, MRDU", type: "leadership" },
    { name: "Prof F. Ravinder Reddy", designation: "Vice Chancellor, MRDU", type: "leadership" },
    { name: "Prof Yuvaraja Chinnam", designation: "Pro Vice Chancellor, MRDU", type: "leadership" },
    { name: "Prof Mandala Sreenivas", designation: "Registrar, MRDU", type: "leadership" },
    { name: "Prof U. Mohrin Srinivas", designation: "HOD CSE-AIML, MRDU", type: "leadership" },
  ],
};
export const STARTER_PROBLEM_STATEMENTS: ProblemStatement[] = [];
