import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="I-Volunteer" className="h-10 w-auto" />
          <span className="font-bold text-lg hidden sm:block">I-Volunteer</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Connexion</Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/auth?mode=signup">S'inscrire</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
