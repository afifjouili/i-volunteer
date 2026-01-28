import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const ADMIN_CODE = "afif";

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, isLoading: authLoading, signIn } = useAuth();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    confirmPassword: "",
    adminCode: "",
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && userRole === "admin") {
      navigate("/admin");
    }
  }, [user, userRole, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (mode === "signup") {
      if (!formData.fullName || !formData.phone) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.adminCode !== ADMIN_CODE) {
        toast({
          title: "Erreur",
          description: "Le code d'inscription administrateur est incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create admin account with role in metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: "admin", // This will be used by the trigger to set admin role
          },
        },
      });
      
      if (error) {
        toast({
          title: "Échec de l'inscription",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update the profile with phone and set status to approved for admin
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            phone: formData.phone,
            status: "approved" // Admins are auto-approved
          })
          .eq("user_id", data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }

      toast({
        title: "Compte administrateur créé !",
        description: "Redirection vers le tableau de bord...",
      });

      navigate("/admin");
    } else {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Échec de la connexion",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Bienvenue !",
        description: "Redirection vers le tableau de bord...",
      });
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-subtle)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
        
        <Card className="shadow-soft border-border">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="I-Volunteer" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl">
              Espace Administrateur
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Connectez-vous à votre espace administrateur" 
                : "Créer un compte administrateur"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Jean Dupont"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                </TabsContent>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+216 XX XXX XXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </TabsContent>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminCode">Code d'inscription administrateur *</Label>
                    <Input
                      id="adminCode"
                      name="adminCode"
                      type="password"
                      placeholder="Entrez le code"
                      value={formData.adminCode}
                      onChange={handleInputChange}
                    />
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Besoin du code d'accès ?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pour obtenir le code d'inscription administrateur, contactez-nous :
                          </p>
                          <a 
                            href="mailto:afifjouili@hotmail.com" 
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors mt-1"
                          >
                            <Mail className="h-4 w-4" />
                            afifjouili@hotmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Veuillez patienter...
                    </>
                  ) : mode === "login" ? "Se connecter" : "Créer le compte"}
                </Button>
              </form>
            </Tabs>
            
            <div className="text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
                Vous êtes bénévole ? Cliquez ici
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
