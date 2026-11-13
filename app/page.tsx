import { Hero } from '@/components/home/Hero';
import { ConsultSection, FaqSection, ModulesSection, PackagesSection, ProcessSection, WhySection, WorkSection } from '@/components/home/Sections';
import { DemoSection, IndustriesSection, PainSection, QuizSection } from '@/components/home/Marketing';
import { PublicShell } from '@/components/layout/PublicShell';

/**
 * Home narrative (customer's questions, in order):
 * hero (what is this) → problems (is this for me) → offer → industries (for my kind of business) →
 * why us → live demo (see it yourself) → portfolio → how we work → quiz (where do I start) →
 * packages → FAQ → consultation CTA. The ecosystem diagram lives on /about.
 */
export default function HomePage() {
  return (
    <PublicShell>
      <Hero />
      <PainSection />
      <ModulesSection />
      <IndustriesSection />
      <WhySection />
      <DemoSection />
      <WorkSection />
      <ProcessSection />
      <QuizSection />
      <PackagesSection />
      <FaqSection />
      <ConsultSection />
    </PublicShell>
  );
}
