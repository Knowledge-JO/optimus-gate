import Faq from "./components/Faq";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";

export default function Page() {
  return (
    <div className="pt-15 ">
      <Hero />
      <StatsBar />
      <Features />
      <Faq />
      <Footer />
    </div>
  );
}
