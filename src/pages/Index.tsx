import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT, PRESET_HAT_COLORS } from '@/types/hat';
import { ArrowRight } from 'lucide-react';

const SAMPLE_DESIGNS = [
  { hatColor: '#CC0000', text: 'MAKE AMERICA\nGREAT AGAIN', textColor: '#FFFFFF' },
  { hatColor: '#1a1a6e', text: 'WORLD\nCHAMPION', textColor: '#FFD700' },
  { hatColor: '#222222', text: 'JUST\nDO IT', textColor: '#FF6B00' },
  { hatColor: '#1a472a', text: 'GOLF\nCLUB', textColor: '#FFFFFF' },
];

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center mb-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Design Your <span className="text-primary">Custom Hat</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Pick your color, add your message, choose your stitching — see it in 3D instantly.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-lg h-[350px] md:h-[400px]">
          <HatScene
            hatColor={DEFAULT_HAT.hatColor}
            text={DEFAULT_HAT.text}
            textColor={DEFAULT_HAT.textColor}
            autoRotate
            className="w-full h-full"
          />
        </div>

        <Link to="/designer" className="relative z-10 mt-6">
          <Button size="lg" className="text-lg px-8 h-14 font-bold tracking-wide">
            Start Designing <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Sample Designs */}
      <section className="py-20 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-2">Get Inspired</h2>
          <p className="text-center text-muted-foreground mb-12">Popular designs to spark your creativity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_DESIGNS.map((design, i) => (
              <Link
                key={i}
                to="/designer"
                className="group rounded-xl border border-border bg-card hover:border-primary/50 transition-colors overflow-hidden"
              >
                <div className="h-56">
                  <HatScene
                    hatColor={design.hatColor}
                    text={design.text}
                    textColor={design.textColor}
                    autoRotate
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Click to customize →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
