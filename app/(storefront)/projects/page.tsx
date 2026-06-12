import type { Metadata } from "next"
import { ProjectsComingSoonPage } from "@/components/projects/projects-coming-soon-page"

export const metadata: Metadata = {
  title: "پروژه‌ها | ساکو الکتریک",
  description:
    "بخش پروژه‌های ساکو الکتریک به‌زودی با نمونه پروژه‌های تأمین تجهیزات برق صنعتی، تابلو برق، اتوماسیون و تجهیزات کنترلی راه‌اندازی می‌شود.",
}

export default function Page() {
  return <ProjectsComingSoonPage />
}
