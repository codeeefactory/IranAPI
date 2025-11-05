import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { FeaturedApis } from "@/components/FeaturedApis";
import { Categories } from "@/components/Categories";
import { IntegrationPreview } from "@/components/IntegrationPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <FeaturedApis />
      <Categories />
      <IntegrationPreview />
      <Footer />
    </div>
  );
};

export default Index;
