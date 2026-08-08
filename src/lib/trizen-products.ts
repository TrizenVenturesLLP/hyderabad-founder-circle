import { BookOpen, MessageSquare, Users, type LucideIcon } from "lucide-react";

export type TrizenProduct = {
  name: string;
  category: string;
  tagline: string;
  desc: string;
  href: string;
  cta: string;
  image: string | null;
  accent: string;
  soft: string;
  icon: LucideIcon;
};

export const trizenProducts: TrizenProduct[] = [
  {
    name: "TrizenHR",
    category: "Workforce Ops",
    tagline: "Standalone SaaS",
    desc: "Attendance and payroll in one place — clock in on web or mobile, manage leave, and get accurate payslips.",
    href: "https://trizenhr.com/",
    cta: "Learn More",
    image: "https://trizenventures.com/products/trizen-hr-v2.jpg",
    accent: "#3b2318",
    soft: "#efe5de",
    icon: Users,
  },
  {
    name: "TrizenDialog",
    category: "WhatsApp Ops",
    tagline: "Standalone console & API",
    desc: "Run WhatsApp notifications without the chaos — manage templates, sends, delivery status, and backend integrations in one console.",
    href: "https://trizendialog.extrahand.in/",
    cta: "Learn More",
    image: "https://trizenventures.com/products/trizen-dialog-card-v3.jpg",
    accent: "#5a6b4e",
    soft: "#e8efe4",
    icon: MessageSquare,
  },
  {
    name: "Trizen Courses",
    category: "Learning",
    tagline: "Industry-ready programs",
    desc: "Practical courses and bootcamps in web development, AI, and building — designed for aspiring builders.",
    href: "https://courses.trizenventures.com/",
    cta: "Learn More",
    image: "/image.png",
    accent: "#d8643c",
    soft: "#f6ded3",
    icon: BookOpen,
  },
];
