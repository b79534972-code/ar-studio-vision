import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DemoSection from "@/components/landing/DemoSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";
import SectionDivider from "@/components/landing/SectionDivider";
import ParticleField from "@/components/landing/ParticleField";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <SectionDivider />
        <ProblemSection />
        <SectionDivider />
        <SolutionSection />
        <SectionDivider />
        <HowItWorksSection />
        <SectionDivider />
        <DemoSection />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
