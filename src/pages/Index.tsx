import { Navbar } from "@/components/Navbar";
import { HeroSection, FeaturesSection, CTASection } from "@/components/LandingPageSections";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
