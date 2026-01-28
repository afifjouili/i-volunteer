import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  LogOut,
  User,
  Bell,
  ChevronRight,
  Loader2,
  Award,
  GraduationCap,
  MessageSquare,
  FileText,
  Download,
  Settings,
  History,
  UserPlus,
  Eye,
  MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/volunteer/AvatarUpload";
import { PendingApprovalScreen } from "@/components/volunteer/PendingApprovalScreen";
import logo from "@/assets/logo.png";

interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  status: string;
  location: string | null;
  poster_url?: string | null;
  max_volunteers?: number;
}

interface TaskAssignment {
  id: string;
  status: string;
  hours_logged: number;
  tasks: Task;
}

interface Training {
  id: string; // The Training ID
  participationId?: string; // The ID of the participation record
  title: string;
  date: string;
  status: string;
  attended: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issued_date: string;
  certificate_type: string;
}

interface AttestationRequest {
  id: string;
  request_type: string;
  status: string;
  created_at: string;
}

interface TrainingDetails {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  trainer: string | null;
  duration_hours: number;
  max_participants: number;
}

interface Message {
  id: string;
  sender_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export default function VolunteerDashboard() {
  const { user, profile, isLoading: authLoading, signOut, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Task[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [allTrainings, setAllTrainings] = useState<TrainingDetails[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [attestationRequests, setAttestationRequests] = useState<AttestationRequest[]>([]);
  const [userMessages, setUserMessages] = useState<Message[]>([]); // New state for messages
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    hoursVolunteered: 0,
    upcomingTasks: 0,
    trainingsCompleted: 0,
    certificatesEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Message dialog state
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Attestation request dialog state
  const [isAttestationOpen, setIsAttestationOpen] = useState(false);
  const [attestationType, setAttestationType] = useState("");
  const [attestationDetails, setAttestationDetails] = useState("");
  const [isRequestingAttestation, setIsRequestingAttestation] = useState(false);

  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Registration states
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);



  const isProfileComplete = (p: { gender?: string; date_of_birth?: string; governorate?: string; city?: string; phone?: string } | null) => {
    return p && p.gender && p.date_of_birth && p.governorate && p.city && p.phone;
  };

  const [locationFilter, setLocationFilter] = useState<"all" | "local">("local");

  const filteredEvents = upcomingEvents.filter(event => {
    if (locationFilter === "all") return true;
    if (!profile?.governorate) return true;
    // If event has no location, show it. If it has location, check if it contains governorate or city
    if (!event.location) return true;

    const userGov = profile.governorate.toLowerCase();
    const userCity = profile.city?.toLowerCase() || "";
    const loc = event.location.toLowerCase();

    return loc.includes(userGov) || loc.includes(userCity) || event.location === "En ligne";
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if profile is incomplete - redirect to onboarding
      if (profile && !isProfileComplete(profile)) {
        navigate("/onboarding");
        return;
      }

      // Note: We don't redirect pending users - we show them a special screen
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user && profile && isProfileComplete(profile)) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch task assignments
      const { data: assignmentsData } = await supabase
        .from("task_assignments")
        .select(`
          id,
          status,
          hours_logged,
          tasks (
            id, title, description, date, time, status, location, poster_url, max_volunteers
          )
        `)
        .eq("volunteer_id", user?.id);

      const typedAssignments = (assignmentsData || []) as unknown as TaskAssignment[];
      setAssignments(typedAssignments);

      // Get registered event IDs from assignments
      const registeredIds = typedAssignments.map(a => a.tasks?.id).filter(Boolean);
      setRegisteredEvents(registeredIds as string[]);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("tasks")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(10);

      setUpcomingEvents(eventsData || []);

      // Fetch trainings
      const { data: trainingsData } = await supabase
        .from("training_participants")
        .select(`
          id,
          status,
          attended,
          trainings (id, title, date, status)
        `)
        .eq("volunteer_id", profile?.id);

      const typedTrainings = (trainingsData || []).map((t: { trainings: { id: string; title: string; date: string } | null; id: string; status: string; attended: boolean }) => ({
        id: t.trainings?.id,
        participationId: t.id, // Store key for deletion/management
        title: t.trainings?.title,
        date: t.trainings?.date,
        status: t.status,
        attended: t.attended,
      }));
      setTrainings(typedTrainings);

      // Fetch all upcoming trainings
      const { data: allTrainingsData } = await supabase
        .from("trainings")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      setAllTrainings(allTrainingsData || []);

      // Fetch certificates
      const { data: certsData } = await supabase
        .from("certificates")
        .select("*")
        .eq("volunteer_id", profile?.id);

      setCertificates(certsData || []);

      // Fetch attestation requests
      const { data: requestsData } = await supabase
        .from("attestation_requests")
        .select("*")
        .eq("volunteer_id", profile?.id)
        .order("created_at", { ascending: false });

      setAttestationRequests(requestsData || []);

      // Fetch user messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("recipient_id", user?.id)
        .order("created_at", { ascending: false });

      setUserMessages(messagesData || []); // Cast if needed, assuming Message interface matches or I need to add it

      // Calculate stats
      const total = typedAssignments.length;
      const completed = typedAssignments.filter(a => a.status === "completed").length;
      const hours = typedAssignments.reduce((sum, a) => sum + (a.hours_logged || 0), 0);
      const upcoming = typedAssignments.filter(a => a.status === "pending" || a.status === "in_progress").length;

      setStats({
        totalTasks: total,
        completedTasks: completed,
        hoursVolunteered: hours + (profile?.hours_volunteered || 0),
        upcomingTasks: upcoming,
        trainingsCompleted: typedTrainings.filter(t => t.attended).length,
        certificatesEarned: (certsData || []).length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    setIsSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        subject: messageSubject,
        content: messageContent,
      });
      if (error) throw error;
      toast({ title: "Message envoyé", description: "Votre message a été envoyé au coordinateur" });
      setIsMessageOpen(false);
      setMessageSubject("");
      setMessageContent("");
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const requestAttestation = async () => {
    if (!attestationType) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un type d'attestation", variant: "destructive" });
      return;
    }
    setIsRequestingAttestation(true);
    try {
      const { error } = await supabase.from("attestation_requests").insert({
        volunteer_id: profile?.id,
        request_type: attestationType,
        details: attestationDetails,
      });
      if (error) throw error;
      toast({ title: "Demande envoyée", description: "Votre demande d'attestation a été soumise" });
      setIsAttestationOpen(false);
      setAttestationType("");
      setAttestationDetails("");
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsRequestingAttestation(false);
    }
  };

  const registerForEvent = async (eventId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    setIsRegistering(eventId);
    try {
      // Check if already registered
      if (registeredEvents.includes(eventId)) {
        toast({
          title: "Déjà inscrit",
          description: "Vous êtes déjà inscrit à cet événement",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.from("task_assignments").insert({
        task_id: eventId,
        volunteer_id: user.id,
        status: "pending",
      });

      if (error) {
        console.error("Erreur lors de l'inscription:", error);
        throw error;
      }

      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit à cet événement"
      });

      setRegisteredEvents(prev => [...prev, eventId]);
      fetchData();
      return true;
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message || "Impossible de s'inscrire", variant: "destructive" });
      return false;
    } finally {
      setIsRegistering(null);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!user) return;

    const assignment = assignments.find(a => a.tasks.id === eventId);
    if (!assignment) return;

    setIsRegistering(eventId);
    try {
      const { error } = await supabase
        .from("task_assignments")
        .delete()
        .eq("id", assignment.id);

      if (error) throw error;

      toast({ title: "Inscription annulée", description: "Vous avez été désinscrit de l'événement." });
      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };


  const registerForTraining = async (trainingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("training_participants").insert({
        training_id: trainingId,
        volunteer_id: profile?.id, // Use profile id (UUID) if table expects UUID of profile, or user.id?
        // Check previous code: eq("volunteer_id", profile?.id); line 255. So it uses profile.id usually?
        // Wait, previous code used 'user.id' for tasks. 
        // Trainings fetch used 'profile?.id' (line 255).
        // Let's use profile?.id to be consistent with fetch. 
        status: "pending"
      });

      if (error) throw error;

      toast({ title: "Inscription réussie", description: "Votre inscription à la formation a été prise en compte." });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const cancelTrainingRegistration = async (participationId: string) => {
    try {
      const { error } = await supabase
        .from("training_participants")
        .delete()
        .eq("id", participationId);

      if (error) throw error;

      toast({ title: "Désinscription réussie", description: "Vous êtes désinscrit de la formation." });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const printDocument = (title: string, subtitle: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; text-align: center; color: #333; }
                .container { border: 10px double #444; padding: 50px; margin: 20px auto; max-width: 800px; }
                .header { margin-bottom: 40px; }
                h1 { font-size: 36px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
                h2 { font-size: 28px; margin: 20px 0; color: #000; font-weight: bold; border-bottom: 1px solid #ccc; display: inline-block; padding-bottom: 5px; }
                p { font-size: 18px; line-height: 1.6; margin: 20px 0; }
                .footer { margin-top: 60px; font-size: 14px; color: #666; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #2563eb; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">I-VOLUNTEER</div>
                <div class="header">
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                </div>
                
                <p>Ce document certifie que</p>
                <h2>${profile?.full_name}</h2>
                <div class="content">
                    ${content}
                </div>
                
                <p class="footer">
                    Fait le ${new Date().toLocaleDateString("fr-FR")} à Tunis.<br/>
                    Signature de la direction
                </p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
  };

  const handlePrintGeneralAttestation = () => {
    printDocument(
      "Attestation de Bénévolat",
      "Document Officiel",
      `<p>A participé activement aux activités de l'organisation I-WATCH en tant que bénévole.</p>
         <p>Total des heures effectuées : <strong>${stats.hoursVolunteered} heures</strong></p>
         <p>Nous remercions vivement l'intéressé(e) pour son engagement et sa contribution citoyenne.</p>`
    );
  };

  const handlePrintCertificate = (cert: Certificate) => {
    printDocument(
      "Certificat de Formation",
      cert.certificate_type,
      `<p>A validé avec succès la formation :</p>
         <h3>${cert.title}</h3>
         <p>Délivré le ${cert.issued_date}</p>`
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Terminé</Badge>;
      case "in_progress":
        return <Badge className="bg-secondary/20 text-secondary border-secondary/30">En cours</Badge>;
      case "pending":
        return <Badge variant="outline">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-secondary" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending approval screen if user status is pending
  if (profile?.status === "pending") {
    return (
      <PendingApprovalScreen
        email={profile.email}
        onSignOut={handleSignOut}
        onRefresh={refreshUserData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="I-Volunteer" className="h-8 w-auto" />
            <span className="font-semibold hidden sm:block">I-Volunteer</span>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {userMessages.filter(m => !m.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                      {userMessages.filter(m => !m.is_read).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {userMessages.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Aucun message
                    </div>
                  ) : (
                    userMessages.map((msg) => (
                      <DropdownMenuItem key={msg.id} className="cursor-pointer flex flex-col items-start gap-1 p-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-sm">{msg.subject}</span>
                          {!msg.is_read && <Badge className="h-2 w-2 rounded-full p-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                        <span className="text-[10px] text-muted-foreground self-end">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border hover:ring-2 hover:ring-primary/20 transition-all"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {profile?.full_name || "Bénévole"} !
            </h1>
            <p className="text-muted-foreground">Votre espace de gestion du bénévolat</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Envoyer un message</DialogTitle>
                  <DialogDescription>Contactez le coordinateur ou l'administrateur</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Sujet</Label>
                    <Input
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      placeholder="Objet du message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Votre message..."
                      rows={5}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Annuler</Button>
                    <Button variant="gradient" onClick={sendMessage} disabled={isSendingMessage}>
                      {isSendingMessage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Envoyer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAttestationOpen} onOpenChange={setIsAttestationOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <FileText className="mr-2 h-4 w-4" />
                  Demande d'attestation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demander une attestation</DialogTitle>
                  <DialogDescription>Sélectionnez le type d'attestation souhaité</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Type d'attestation</Label>
                    <Select value={attestationType} onValueChange={setAttestationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteering">Attestation de bénévolat</SelectItem>
                        <SelectItem value="training">Attestation de participation à une formation</SelectItem>
                        <SelectItem value="recommendation">Lettre de recommandation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Détails supplémentaires</Label>
                    <Textarea
                      value={attestationDetails}
                      onChange={(e) => setAttestationDetails(e.target.value)}
                      placeholder="Précisions sur votre demande..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAttestationOpen(false)}>Annuler</Button>
                    <Button variant="gradient" onClick={requestAttestation} disabled={isRequestingAttestation}>
                      {isRequestingAttestation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Soumettre
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Heures de bénévolat</p>
                  <p className="text-3xl font-bold">{stats.hoursVolunteered}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tâches complétées</p>
                  <p className="text-3xl font-bold">{stats.completedTasks}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Formations</p>
                  <p className="text-3xl font-bold">{stats.trainingsCompleted}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificats</p>
                  <p className="text-3xl font-bold">{stats.certificatesEarned}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="trainings">Formations</TabsTrigger>
            <TabsTrigger value="certificates">Certificats</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tasks List */}
              <div className="lg:col-span-2">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Mes Tâches</CardTitle>
                    <CardDescription>Vos activités de bénévolat assignées</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune tâche assignée</p>
                        <p className="text-sm">Revenez plus tard pour de nouvelles opportunités !</p>
                      </div>
                    ) : (
                      assignments.slice(0, 5).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-soft cursor-pointer group"
                          onClick={() => setSelectedEvent(assignment.tasks)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">{getStatusIcon(assignment.status)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{assignment.tasks.title}</h3>
                                {getStatusBadge(assignment.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{assignment.tasks.description}</p>
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {assignment.tasks.date}
                                </span>
                                {assignment.tasks.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {assignment.tasks.time}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Progress Card */}
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Votre Progression</CardTitle>
                    <CardDescription>Taux de complétion des tâches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Taux de complétion</span>
                        <span className="text-2xl font-bold gradient-text">{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        {stats.completedTasks} sur {stats.totalTasks} tâches complétées
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Continuez comme ça !</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Vous avez contribué {stats.hoursVolunteered} heures. Merci pour votre engagement !
                    </p>
                    <Button variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger l'historique
                    </Button>
                  </CardContent>
                </Card>

                {/* Attestation Requests Status */}
                {attestationRequests.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Mes Demandes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {attestationRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">
                            {req.request_type === "volunteering" ? "Attestation bénévolat" :
                              req.request_type === "training" ? "Attestation formation" : "Recommandation"}
                          </span>
                          {getStatusBadge(req.status)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Événements à venir</CardTitle>
                <CardDescription>Calendrier des activités planifiées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={locationFilter === "all" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setLocationFilter("all")}
                      className="text-xs"
                    >
                      Tout
                    </Button>
                    <Button
                      variant={locationFilter === "local" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setLocationFilter("local")}
                      className="text-xs"
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      Ma région
                    </Button>
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun événement disponible {locationFilter === "local" ? "dans votre région" : ""}</p>
                    {locationFilter === "local" && (
                      <Button variant="link" onClick={() => setLocationFilter("all")}>
                        Voir tous les événements
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => {
                      const isRegistered = registeredEvents.includes(event.id);
                      const isCurrentlyRegistering = isRegistering === event.id;

                      return (
                        <div
                          key={event.id}
                          className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group hover:shadow-soft"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {event.date}
                                </span>
                                {event.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.time}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {getStatusBadge(event.status)}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setSelectedEvent(event)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Détails
                              </Button>

                              {isRegistered ? (
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Inscrit
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                                    onClick={() => handleCancelRegistration(event.id)}
                                    disabled={isCurrentlyRegistering}
                                  >
                                    {isCurrentlyRegistering ? <Loader2 className="h-3 w-3 animate-spin" /> : "Se désinscrire"}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => registerForEvent(event.id)}
                                  disabled={isCurrentlyRegistering}
                                >
                                  {isCurrentlyRegistering ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      Inscription...
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Participer
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historique de participation</CardTitle>
                  <CardDescription>Toutes vos activités passées</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrintGeneralAttestation}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter Attestation
                </Button>
              </CardHeader>
              <CardContent>
                {assignments.filter(a => a.status === "completed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune participation enregistrée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.filter(a => a.status === "completed").map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-soft cursor-pointer group"
                        onClick={() => setSelectedEvent(assignment.tasks)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{assignment.tasks.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{assignment.tasks.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {assignment.tasks.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {assignment.hours_logged || 0} heures
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Complété</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(assignment.tasks);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Formations</CardTitle>
                <CardDescription>Vos formations et participations</CardDescription>
              </CardHeader>
              <CardContent>
                {allTrainings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune formation disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTrainings.map((training) => {
                      const userTraining = trainings.find(t => t.id === training.id);
                      const isRegistered = !!userTraining;

                      return (
                        <div key={training.id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{training.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{training.description}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(training.date).toLocaleDateString("fr-FR")}
                                </span>
                                {training.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {training.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {training.duration_hours}h
                                </span>
                              </div>
                            </div>
                            {isRegistered ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  if (userTraining?.participationId) {
                                    cancelTrainingRegistration(userTraining.participationId);
                                  }
                                }}
                                className="shrink-0 bg-secondary/10 text-secondary hover:bg-secondary/20"
                              >
                                Inscrit
                              </Button>
                            ) : (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => registerForTraining(training.id)}
                                className="shrink-0"
                              >
                                S'inscrire
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Certificats obtenus</CardTitle>
                <CardDescription>Vos reconnaissances et attestations</CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun certificat obtenu</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="border-border">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                              <Award className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{cert.title}</h3>
                              <p className="text-xs text-muted-foreground">{cert.certificate_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{cert.issued_date}</span>
                            <Button variant="ghost" size="sm" onClick={() => handlePrintCertificate(cert)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Paramètres du profil</DialogTitle>
              <DialogDescription>Gérez les paramètres de votre compte</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center pb-4 border-b">
                {user && (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={profile?.avatar_url || null}
                    onAvatarUpdated={() => refreshUserData()}
                  />
                )}
                <div className="mt-3 text-center">
                  <p className="font-semibold text-lg">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Actions rapides</h4>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    navigate("/onboarding");
                  }}
                >
                  <User className="mr-3 h-4 w-4" />
                  Modifier mon profil
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setActiveTab("history");
                  }}
                >
                  <History className="mr-3 h-4 w-4" />
                  Historique des activités
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setActiveTab("certificates");
                  }}
                >
                  <Award className="mr-3 h-4 w-4" />
                  Mes certificats
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </div>

              {/* Account Section */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground">Compte</h4>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Details Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> {selectedEvent.date}
                    {selectedEvent.time && (
                      <> • <Clock className="h-4 w-4" /> {selectedEvent.time}</>
                    )}
                    {selectedEvent.max_volunteers && (
                      <> • <User className="h-4 w-4" /> Max: {selectedEvent.max_volunteers} participants</>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {selectedEvent.poster_url && (
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src={selectedEvent.poster_url}
                        alt={`Affiche de ${selectedEvent.title}`}
                        className="w-full h-auto max-h-[300px] object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">À propos de l'événement</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedEvent.description || "Aucune description disponible."}
                    </p>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    {registeredEvents.includes(selectedEvent.id) ? (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleCancelRegistration(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        disabled={isRegistering === selectedEvent.id}
                      >
                        {isRegistering === selectedEvent.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Se désinscrire
                      </Button>
                    ) : (
                      <Button
                        variant="gradient"
                        onClick={async () => {
                          const success = await registerForEvent(selectedEvent.id);
                          if (success) {
                            setSelectedEvent(null);
                          }
                        }}
                        disabled={isRegistering === selectedEvent.id}
                      >
                        {isRegistering === selectedEvent.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inscription...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Participer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div >
  );
}
