import { Button } from '@/components/ui/button';
import { ArrowRight, Coins, Globe, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent glow-text">
                Trade. Earn. Connect.
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed tracking-wide max-w-2xl mx-auto">
              Join the future of peer-to-peer trading. Exchange goods, services, and skills without spending a dime.
            </p>
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <Link to="/explore">
                <Button size="lg" variant="gradient" className="text-base">
                  Explore Listings
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/post">
                <Button size="lg" variant="outline" className="text-base">
                  Post a Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 space-y-8 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Why Choose BarterVerse?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Handshake className="w-12 h-12 text-primary" />}
              title="Trade Anything"
              description="From vintage items to professional services, exchange what you have for what you need."
            />
            <FeatureCard
              icon={<Coins className="w-12 h-12 text-accent" />}
              title="Earn Barter Coins"
              description="Complete trades to earn BC tokens that unlock premium features and boost your reputation."
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-primary" />}
              title="Connect Globally"
              description="Join a vibrant community of traders from around the world. Share skills, stories, and success."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 space-y-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number="10K+" label="Active Traders" />
            <StatCard number="50K+" label="Trades Completed" />
            <StatCard number="100+" label="Countries" />
            <StatCard number="500+" label="Categories" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 space-y-8 bg-gradient-to-r from-primary/20 to-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-tight">
            Ready to Start Trading?
          </h2>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground max-w-2xl mx-auto">
            Join thousands of traders who are saving money and building connections through barter.
          </p>
          <Link to="/explore">
            <Button size="lg" variant="gradient" className="text-base glow-effect">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#0F172A] rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-8 text-center space-y-4 border border-border">
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-left">{title}</h3>
      <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-left">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl md:text-5xl font-bold text-primary">{number}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
