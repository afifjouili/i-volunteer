import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="I-Volunteer" className="h-8 w-auto" />
            <div>
              <span className="font-semibold block">I-Volunteer</span>
              <span className="text-xs text-muted-foreground">Des ONG organisées, des volontaires motivés !</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} I-Volunteer. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
