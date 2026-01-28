import { useState } from "react";
import { Clock, Mail, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

interface PendingApprovalScreenProps {
  email: string;
  onSignOut: () => void;
  onRefresh?: () => Promise<void>;
}

export function PendingApprovalScreen({ email, onSignOut, onRefresh }: PendingApprovalScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-card">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="I-Volunteer" className="h-12 w-auto mx-auto" />
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl">Inscription en attente</CardTitle>
          <CardDescription>
            Votre compte est en cours de révision par notre équipe administrative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm">Que se passe-t-il ensuite ?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
                Un administrateur examinera votre inscription
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
                Vous recevrez un email de confirmation à <strong>{email}</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
                Une fois approuvé, vous pourrez accéder à toutes les fonctionnalités
              </li>
            </ul>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 inline-block mr-1" />
            Vérifiez régulièrement votre boîte de réception
          </div>

          <div className="space-y-3">
            {onRefresh && (
              <Button 
                variant="gradient" 
                className="w-full" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Vérifier mon statut
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
