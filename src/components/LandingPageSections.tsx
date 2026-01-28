import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, CalendarCheck, Shield, ArrowRight, Award, BarChart3, MessageSquare } from "lucide-react";
import logo from "@/assets/logo.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[image:var(--gradient-subtle)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in mb-8">
            <img 
              src={logo} 
              alt="I-Volunteer Logo" 
              className="w-32 h-32 mx-auto mb-6 animate-float" 
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">I-Volunteer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in font-medium" style={{ animationDelay: "0.15s" }}>
            Des ONG organisées, des volontaires motivés !
          </p>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Plateforme complète de gestion des bénévoles pour coordonner, suivre et valoriser l'engagement de votre communauté.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="gradient" size="xl" asChild>
              <Link to="/auth?mode=signup&role=volunteer">
                Devenir Bénévole
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button variant="hero" size="xl" asChild>
              <Link to="/admin-auth">
                Espace Coordinateur
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Gestion des Bénévoles",
      description: "Inscriptions détaillées, profils complets, suivi des compétences et de l'expérience de chaque volontaire.",
    },
    {
      icon: CalendarCheck,
      title: "Calendrier des Événements",
      description: "Planifiez et gérez les activités avec un calendrier dynamique. Assignez des tâches et suivez la participation.",
    },
    {
      icon: Award,
      title: "Formations & Certificats",
      description: "Gérez les formations, suivez les participations et délivrez des certificats et attestations.",
    },
    {
      icon: BarChart3,
      title: "Statistiques & Rapports",
      description: "Tableaux de bord détaillés avec statistiques sur les heures de bénévolat et la participation.",
    },
    {
      icon: MessageSquare,
      title: "Communication",
      description: "Messagerie intégrée entre bénévoles et coordinateurs pour une collaboration efficace.",
    },
    {
      icon: Shield,
      title: "Sécurisé & Fiable",
      description: "Sécurité de niveau entreprise avec contrôle d'accès basé sur les rôles.",
    },
  ];

  return (
    <section className="py-24 bg-card relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des fonctionnalités puissantes pour une gestion efficace du bénévolat
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-5" />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à faire la différence ?
        </h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Rejoignez I-Volunteer aujourd'hui et faites partie d'une communauté engagée pour un changement positif.
        </p>
        <Button variant="gradient" size="lg" asChild>
          <Link to="/auth?mode=signup">
            Commencer maintenant
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
