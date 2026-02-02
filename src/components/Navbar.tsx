import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="I-Volunteer" className="h-10 w-auto" />
          <span className="font-bold text-lg hidden sm:block">I-Volunteer</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Connexion</Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/auth?mode=signup">S'inscrire</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="flex items-center gap-3 mb-4" onClick={() => setIsOpen(false)}>
                  <img src={logo} alt="I-Volunteer" className="h-10 w-auto" />
                  <span className="font-bold text-lg">I-Volunteer</span>
                </Link>

                <div className="flex flex-col gap-4">
                  <Button variant="ghost" asChild className="w-full justify-start text-lg" onClick={() => setIsOpen(false)}>
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button variant="gradient" asChild className="w-full justify-start text-lg" onClick={() => setIsOpen(false)}>
                    <Link to="/auth?mode=signup">S'inscrire</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
