import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Users,
  CalendarDays,
  Clock,
  Plus,
  Search,
  LogOut,
  User,
  Bell,
  MoreHorizontal,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  Loader2,
  Download,
  Mail,
  FileText,
  BarChart3,
  Eye,
  Inbox,
  GraduationCap,
  Monitor,
  MapPin,
  Upload,
  Image,
  X,
  Settings,
  Key,
  Camera,
  Copy,
  Edit,
  FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { AvatarUpload } from "@/components/volunteer/AvatarUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  hours_volunteered: number;
  status: string | null;
  governorate: string | null;
  city: string | null;
  skills: string[] | null;
  created_at: string;
  role?: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  status: string;
  location: string | null;
  category: string | null;
  event_type?: string;
  max_volunteers?: number;
  duration_hours?: number;
  poster_url?: string | null;
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

interface AttestationRequest {
  id: string;
  volunteer_id: string;
  request_type: string;
  details: string | null;
  status: string;
  created_at: string;
  volunteer_name?: string;
}

interface EventRegistration {
  id: string;
  task_id: string;
  volunteer_id: string;
  status: string;
  created_at: string;
  volunteer?: Profile;
  task?: Task;
}

interface Training {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  trainer: string | null;
  duration_hours: number;
  max_participants: number;
  created_by: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, userRole, profile, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attestationRequests, setAttestationRequests] = useState<AttestationRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isViewVolunteerOpen, setIsViewVolunteerOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Profile | null>(null);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [currentEvent, setCurrentEvent] = useState<Task | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<EventRegistration[]>([]);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [volunteerToReject, setVolunteerToReject] = useState<Profile | null>(null);
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    location: "",
    date: undefined as Date | undefined,
    time: "",
    category: "event",
    eventType: "in_person" as "in_person" | "online",
    posterFile: null as File | null,
    maxVolunteers: 10,
    durationHours: 2,
  });
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    trainer: "",
    duration_hours: 2,
    max_participants: 30,
    posterFile: null as File | null,
  });

  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    pendingVolunteers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalHours: 0,
    pendingRequests: 0,
    unreadMessages: 0,
    totalTrainings: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchData();
    }
  }, [user, userRole]);

  const fetchData = async () => {
    try {
      // Fetch all profiles (volunteers)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) console.error("Error fetching roles:", rolesError);

      // Merge roles into profiles
      const enrichedProfiles = (profilesData || []).map(profile => {
        const roleEntry = rolesData?.find(r => r.user_id === profile.user_id);
        return { ...profile, role: roleEntry?.role || "volunteer" };
      });

      setVolunteers(enrichedProfiles);

      // Fetch all tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("date", { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch messages (to admins)
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .is("recipient_id", null)
        .order("created_at", { ascending: false });

      // Get sender names
      const messagesWithNames = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const sender = profilesData?.find(p => p.user_id === msg.sender_id);
          return { ...msg, sender_name: sender?.full_name || "Inconnu" };
        })
      );
      setMessages(messagesWithNames);

      // Fetch attestation requests
      const { data: requestsData } = await supabase
        .from("attestation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      const requestsWithNames = (requestsData || []).map((req) => {
        const volunteer = profilesData?.find(p => p.id === req.volunteer_id);
        return { ...req, volunteer_name: volunteer?.full_name || "Inconnu" };
      });
      setAttestationRequests(requestsWithNames);

      // Fetch pending event registrations
      const { data: registrationsData, error: regError } = await supabase
        .from("task_assignments")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!regError && registrationsData) {
        // Enriched registrations with volunteer and task info
        const enrichedRegistrations = registrationsData.map(reg => ({
          ...reg,
          volunteer: profilesData?.find(p => p.user_id === reg.volunteer_id),
          task: tasksData?.find(t => t.id === reg.task_id)
        })).filter(reg => reg.volunteer && reg.task); // Only keep valid ones

        setPendingRegistrations(enrichedRegistrations as EventRegistration[]);
      }

      // Fetch trainings
      const { data: trainingsData, error: trainingsError } = await supabase
        .from("trainings")
        .select("*")
        .order("date", { ascending: true });

      if (trainingsError) throw trainingsError;
      setTrainings(trainingsData || []);

      // Calculate stats
      const totalVolunteers = profilesData?.length || 0;
      const activeVolunteers = profilesData?.filter(p => p.status === "active").length || 0;
      const pendingVolunteers = profilesData?.filter(p => p.status === "pending").length || 0;
      const completedTasks = tasksData?.filter(t => t.status === "completed").length || 0;
      const totalHours = profilesData?.reduce((sum, p) => sum + (p.hours_volunteered || 0), 0) || 0;
      const pendingRequests = (requestsData || []).filter(r => r.status === "pending").length;
      const unreadMessages = (messagesData || []).filter(m => !m.is_read).length;

      setStats({
        totalVolunteers,
        activeVolunteers,
        pendingVolunteers,
        totalTasks: tasksData?.length || 0,
        completedTasks,
        totalHours,
        pendingRequests,
        unreadMessages,
        totalTrainings: trainingsData?.length || 0,
        pendingRegistrations: pendingRegistrations.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(v =>
    v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.governorate && v.governorate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tasksForSelectedDate = tasks.filter(t => {
    if (!selectedDate) return false;
    const taskDate = new Date(t.date).toDateString();
    return taskDate === selectedDate.toDateString();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Terminé</Badge>;
      case "in_progress":
        return <Badge className="bg-secondary/20 text-secondary border-secondary/30">En cours</Badge>;
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Refusé</Badge>;
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Actif</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let posterUrl: string | null = null;

      // Upload poster if provided
      if (newTask.posterFile) {
        setIsUploadingPoster(true);
        const fileExt = newTask.posterFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, newTask.posterFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('event-posters')
          .getPublicUrl(fileName);

        posterUrl = publicUrl.publicUrl;
        setIsUploadingPoster(false);
      }

      const { error } = await supabase.from("tasks").insert({
        title: newTask.title,
        description: newTask.description || null,
        location: newTask.eventType === "online" ? newTask.location || "En ligne" : newTask.location || null,
        date: newTask.date ? format(newTask.date, "yyyy-MM-dd") : "",
        time: newTask.time || null,
        category: newTask.category,
        created_by: user?.id,
        event_type: newTask.eventType,
        poster_url: posterUrl,
        max_volunteers: newTask.maxVolunteers,
        duration_hours: newTask.durationHours,
      });

      if (error) throw error;

      toast({ title: "Événement créé", description: "Le nouvel événement a été ajouté" });
      setIsAddTaskOpen(false);
      setNewTask({ title: "", description: "", location: "", date: undefined, time: "", category: "event", eventType: "in_person", posterFile: null, maxVolunteers: 10, durationHours: 2 });
      fetchData();
    } catch (error) {
      setIsUploadingPoster(false);
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let posterUrl: string | null = null;

      // Upload poster if provided
      if (newTraining.posterFile) {
        setIsUploadingPoster(true);
        const fileExt = newTraining.posterFile.name.split('.').pop();
        const fileName = `training-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, newTraining.posterFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('event-posters')
          .getPublicUrl(fileName);

        posterUrl = publicUrl.publicUrl;
        setIsUploadingPoster(false);
      }

      const { error } = await supabase.from("trainings").insert({
        title: newTraining.title,
        description: newTraining.description || null,
        location: newTraining.location || null,
        date: newTraining.date,
        trainer: newTraining.trainer || null,
        duration_hours: newTraining.duration_hours,
        max_participants: newTraining.max_participants,
        created_by: user?.id,
        poster_url: posterUrl,
      });

      if (error) throw error;

      toast({ title: "Formation créée", description: "La nouvelle formation a été ajoutée" });
      setIsAddTrainingOpen(false);
      setNewTraining({ title: "", description: "", location: "", date: "", trainer: "", duration_hours: 2, max_participants: 30, posterFile: null });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedVolunteer || !selectedTask) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un bénévole et une tâche", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("task_assignments").insert({
        task_id: selectedTask,
        volunteer_id: selectedVolunteer.user_id,
      });

      if (error) throw error;

      toast({ title: "Tâche assignée", description: "Le bénévole a été assigné à la tâche" });
      setIsAssignTaskOpen(false);
      setSelectedVolunteer(null);
      setSelectedTask("");
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRegistration = async (registrationId: string, status: "in_progress" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("task_assignments")
        .update({ status })
        .eq("id", registrationId);

      if (error) throw error;

      toast({
        title: status === "in_progress" ? "Inscription validée" : "Inscription refusée",
        description: `Le bénévole a été ${status === "in_progress" ? "confirmé" : "retiré"} pour l'événement.`
      });

      // Update local state immediately
      setPendingRegistrations(prev => prev.filter(r => r.id !== registrationId));
      if (currentEvent) {
        fetchEventDetails(currentEvent); // Refresh event details if open
      }
      fetchData(); // Refresh global stats
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const fetchEventDetails = async (task: Task) => {
    setCurrentEvent(task);
    setIsEventDetailsOpen(true);

    try {
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*")
        .eq("task_id", task.id);

      if (error) throw error;

      // Manually join since we have the data
      const enriched = data.map(reg => ({
        ...reg,
        volunteer: volunteers.find(v => v.user_id === reg.volunteer_id)
      })).filter(r => r.volunteer);

      setEventRegistrations(enriched as EventRegistration[]);
    } catch (error) {
      console.error("Error fetching event details", error);
    }
  };

  const handleProcessRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("attestation_requests")
        .update({ status, processed_by: user?.id, processed_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: "Demande traitée", description: `La demande a été ${status === "approved" ? "approuvée" : "refusée"}` });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
      fetchData();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpdated = (newUrl: string) => {
    setLocalAvatarUrl(newUrl);
  };

  const handleApproveVolunteer = async (profileId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Bénévole approuvé",
        description: "Le bénévole peut maintenant accéder à la plateforme"
      });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const openRejectDialog = (volunteer: Profile) => {
    setVolunteerToReject(volunteer);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleCancelTask = (taskId: string) => {
    if (!taskId) return;
    setEventToCancel(taskId);
    setIsCancelEventOpen(true);
  };

  const confirmCancelEvent = async () => {
    if (!eventToCancel) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "cancelled" })
        .eq("id", eventToCancel);

      if (error) throw error;

      // Notify registered volunteers
      const { error: notifyError } = await supabase.functions.invoke('notify-cancellation', {
        body: { entityId: eventToCancel, type: 'event' }
      });

      if (notifyError) {
        console.error("Failed to send notification emails:", notifyError);
        toast({ title: "Attention", description: "L'événement est annulé mais l'envoi des emails a échoué.", variant: "warning" });
      } else {
        toast({ title: "Événement annulé", description: "L'événement a été annulé et les participants ont été notifiés." });
      }

      setIsEventDetailsOpen(false);
      setIsCancelEventOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleCancelTraining = async (trainingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      return;
    }

    try {
      // First verify if it exists and get details if needed, but for deletion we just delete.
      // Notification should ideally happen BEFORE deletion if we need data, but we can do it in parallel or rely on the function fetching before delete?
      // Actually, if we delete first, the function might fail to fetch details.
      // So we should notify FIRST, then delete, OR the function needs to handle it.
      // Let's notify first.

      const { error: notifyError } = await supabase.functions.invoke('notify-cancellation', {
        body: { entityId: trainingId, type: 'training' }
      });

      if (notifyError) console.error("Notification error:", notifyError);

      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingId);

      if (error) throw error;

      toast({ title: "Formation supprimée", description: "La formation a été supprimée." });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleRejectVolunteer = async () => {
    if (!volunteerToReject) return;

    if (!rejectionReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer le motif du refus",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim()
        })
        .eq("id", volunteerToReject.id);

      if (error) throw error;

      toast({
        title: "Inscription refusée",
        description: "L'inscription a été refusée et le motif a été enregistré"
      });
      setIsRejectDialogOpen(false);
      setVolunteerToReject(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportEventVolunteers = async (taskId: string, taskTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('task_id', taskId);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ title: "Info", description: "Aucun bénévole inscrit à cet événement." });
        return;
      }

      // Manually join with volunteers data (which is already fetched in 'volunteers' state)
      const exportData = data.map((assignment: any) => {
        const volunteer = volunteers.find(v => v.user_id === assignment.volunteer_id);

        return {
          "Nom complet": volunteer?.full_name || "Inconnu",
          "Email": volunteer?.email || "N/A",
          "Téléphone": volunteer?.phone || "N/A",
          "Gouvernorat": volunteer?.governorate || "N/A",
          "Ville": volunteer?.city || "N/A",
          "Statut": assignment.status,
          "Date d'inscription": new Date(assignment.created_at).toLocaleDateString("fr-FR"),
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bénévoles");

      // Auto-fit columns
      const cols = Object.keys(exportData[0]).map(key => ({ wch: Math.max(key.length, 20) }));
      ws['!cols'] = cols;

      XLSX.writeFile(wb, `${taskTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_benevoles.xlsx`);
      toast({ title: "Succès", description: "Liste des bénévoles exportée avec succès." });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erreur",
        description: `Erreur lors de l'exportation: ${(error as any).message || "Erreur inconnue"}`,
        variant: "destructive"
      });
    }
  };

  const exportVolunteerData = (volunteer: Profile) => {
    const data = {
      "Nom complet": volunteer.full_name,
      "Email": volunteer.email,
      "Téléphone": volunteer.phone || "N/A",
      "Gouvernorat": volunteer.governorate || "N/A",
      "Ville": volunteer.city || "N/A",
      "Heures de bénévolat": volunteer.hours_volunteered,
      "Compétences": volunteer.skills?.join(", ") || "N/A",
      "Date d'inscription": new Date(volunteer.created_at).toLocaleDateString("fr-FR"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `benevole_${volunteer.full_name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllVolunteers = () => {
    const headers = ["Nom complet", "Email", "Téléphone", "Gouvernorat", "Ville", "Statut", "Heures", "Compétences"];
    const csvContent = [
      headers.join(","),
      ...volunteers.map(v => [
        `"${v.full_name}"`,
        `"${v.email}"`,
        `"${v.phone || ''}"`,
        `"${v.governorate || ''}"`,
        `"${v.city || ''}"`,
        `"${v.status || ''}"`,
        `"${v.hours_volunteered || 0}"`,
        `"${(v.skills || []).join(', ').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tous_les_benevoles_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDuplicateEvent = () => {
    if (!currentEvent) return;

    setNewTask({
      title: `${currentEvent.title} (Copie)`,
      description: currentEvent.description || "",
      location: currentEvent.location || "",
      date: undefined,
      time: currentEvent.time || "",
      category: currentEvent.category || "event",
      eventType: (currentEvent.event_type as "in_person" | "online") || "in_person",
      posterFile: null,
      maxVolunteers: currentEvent.max_volunteers || 10,
      durationHours: currentEvent.duration_hours || 2
    });

    setIsEventDetailsOpen(false);
    setIsAddTaskOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="I-Volunteer" className="h-8 w-auto" />
            <span className="font-semibold hidden sm:block">Espace Coordinateur</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {(stats.unreadMessages + stats.pendingRequests) > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {stats.unreadMessages + stats.pendingRequests}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {(stats.unreadMessages + stats.pendingRequests) > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.unreadMessages + stats.pendingRequests} nouveau(x)
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {messages.filter(m => !m.is_read).length === 0 && attestationRequests.filter(r => r.status === "pending").length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Aucune nouvelle notification
                    </div>
                  ) : (
                    <>
                      {messages.filter(m => !m.is_read).slice(0, 3).map((msg) => (
                        <DropdownMenuItem
                          key={msg.id}
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => {
                            handleMarkMessageRead(msg.id);
                            setActiveTab("messages");
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm truncate flex-1">{msg.subject}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            De: {msg.sender_name}
                          </span>
                        </DropdownMenuItem>
                      ))}
                      {attestationRequests.filter(r => r.status === "pending").slice(0, 3).map((req) => (
                        <DropdownMenuItem
                          key={req.id}
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => setActiveTab("requests")}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <FileText className="h-4 w-4 text-secondary" />
                            <span className="font-medium text-sm truncate flex-1">Demande d'attestation</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            De: {req.volunteer_name}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-primary cursor-pointer"
                  onClick={() => setActiveTab("messages")}
                >
                  Voir toutes les notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {(localAvatarUrl || profile?.avatar_url) ? (
                    <img
                      src={localAvatarUrl || profile?.avatar_url || ""}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {(localAvatarUrl || profile?.avatar_url) ? (
                        <img
                          src={localAvatarUrl || profile?.avatar_url || ""}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{profile?.full_name}</span>
                      <span className="text-xs text-muted-foreground">{profile?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres du compte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("dashboard")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Tableau de bord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("volunteers")}>
                  <Users className="mr-2 h-4 w-4" />
                  Bénévoles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("events")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Événements
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("messages")}>
                  <Inbox className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {profile?.full_name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Nouvel événement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un événement</DialogTitle>
                  <DialogDescription>Ajouter une nouvelle activité ou événement</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Event Type Selection */}
                  <div className="space-y-2">
                    <Label>Type d'événement</Label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={newTask.eventType === "in_person" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewTask(prev => ({ ...prev, eventType: "in_person" }))}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Présentiel
                      </Button>
                      <Button
                        type="button"
                        variant={newTask.eventType === "online" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewTask(prev => ({ ...prev, eventType: "online" }))}
                      >
                        <Monitor className="mr-2 h-4 w-4" />
                        En ligne
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{newTask.eventType === "online" ? "Lien de la réunion" : "Lieu"}</Label>
                    <Input
                      value={newTask.location}
                      onChange={(e) => setNewTask(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={newTask.eventType === "online" ? "https://meet.google.com/..." : "Adresse du lieu"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !newTask.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                            {newTask.date ? format(newTask.date, "dd MMM yyyy", { locale: fr }) : "Choisir une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={newTask.date}
                            onSelect={(date) => setNewTask(prev => ({ ...prev, date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Heure</Label>
                      <Select
                        value={newTask.time}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, time: value }))}
                      >
                        <SelectTrigger className="h-10">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Choisir l'heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, h) =>
                            ["00", "30"].map(m => {
                              const time = `${h.toString().padStart(2, "0")}:${m}`;
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })
                          ).flat()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Durée</Label>
                      <Select
                        value={newTask.durationHours.toString()}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, durationHours: parseInt(value) }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Durée" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                            <SelectItem key={h} value={h.toString()}>
                              {h} heure{h > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nombre max. de bénévoles</Label>
                      <Select
                        value={newTask.maxVolunteers.toString()}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, maxVolunteers: parseInt(value) }))}
                      >
                        <SelectTrigger className="h-10">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Max bénévoles" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30, 50, 100].map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                              {n} bénévoles
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Poster Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Affiche de l'événement
                      <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    {newTask.posterFile ? (
                      <div className="relative border rounded-xl overflow-hidden bg-muted/30">
                        <div className="aspect-video w-full">
                          <img
                            src={URL.createObjectURL(newTask.posterFile)}
                            alt="Aperçu de l'affiche"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Image className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[200px]">
                                {newTask.posterFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(newTask.posterFile.size / 1024 / 1024).toFixed(2)} Mo
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setNewTask(prev => ({ ...prev, posterFile: null }))}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="poster-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewTask(prev => ({ ...prev, posterFile: file }));
                            }
                          }}
                        />
                        <label htmlFor="poster-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Glissez-déposez ou cliquez pour uploader</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Max 10 Mo</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="gradient" disabled={isSubmitting || isUploadingPoster || !newTask.title || !newTask.date}>
                      {(isSubmitting || isUploadingPoster) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {isUploadingPoster ? "Upload en cours..." : "Création..."}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer l'événement
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddTrainingOpen} onOpenChange={setIsAddTrainingOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Nouvelle formation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une formation</DialogTitle>
                  <DialogDescription>Ajouter une nouvelle session de formation</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTraining} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={newTraining.title}
                      onChange={(e) => setNewTraining(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newTraining.description}
                      onChange={(e) => setNewTraining(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Formateur</Label>
                      <Input
                        value={newTraining.trainer}
                        onChange={(e) => setNewTraining(prev => ({ ...prev, trainer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lieu</Label>
                      <Input
                        value={newTraining.location}
                        onChange={(e) => setNewTraining(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTraining.date}
                        onChange={(e) => setNewTraining(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Durée (h)</Label>
                      <Input
                        type="number"
                        value={newTraining.duration_hours}
                        onChange={(e) => setNewTraining(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max. participants</Label>
                      <Input
                        type="number"
                        value={newTraining.max_participants}
                        onChange={(e) => setNewTraining(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Affiche (Optionnel)</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('training-poster-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {newTraining.posterFile ? "Changer l'affiche" : "Ajouter une affiche"}
                      </Button>
                      <input
                        id="training-poster-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewTraining(prev => ({ ...prev, posterFile: file }));
                          }
                        }}
                      />
                    </div>
                    {newTraining.posterFile && (
                      <div className="text-sm text-green-600 flex items-center mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Fichier sélectionné: {newTraining.posterFile.name}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddTrainingOpen(false)}>Annuler</Button>
                    <Button type="submit" variant="gradient" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Créer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full md:w-auto">
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4 hidden sm:block" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="management">
              <Settings className="mr-2 h-4 w-4 hidden sm:block" />
              Gestion des activités
            </TabsTrigger>
            <TabsTrigger value="registrations" className="relative">
              <UserPlus className="mr-2 h-4 w-4 hidden sm:block" />
              Inscriptions
              {volunteers.filter(v => v.status === "pending").length + pendingRegistrations.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {volunteers.filter(v => v.status === "pending").length + pendingRegistrations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="volunteers">
              <Users className="mr-2 h-4 w-4 hidden sm:block" />
              Bénévoles
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4 hidden sm:block" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="inbox" className="relative">
              <Inbox className="mr-2 h-4 w-4 hidden sm:block" />
              Boîte de réception
              {(stats.unreadMessages + stats.pendingRequests + pendingRegistrations.length) > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {stats.unreadMessages + stats.pendingRequests + pendingRegistrations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4 hidden sm:block" />
              Rapports
            </TabsTrigger>

          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bénévoles</p>
                      <p className="text-2xl font-bold">{stats.totalVolunteers}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Événements</p>
                      <p className="text-2xl font-bold">{stats.totalTasks}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Heures totales</p>
                      <p className="text-2xl font-bold">{stats.totalHours}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Formations</p>
                      <p className="text-2xl font-bold">{stats.totalTrainings}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Événements récents</CardTitle>
                  <CardDescription>Dernières activités planifiées</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                      onClick={() => fetchEventDetails(task)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {task.date}
                        {task.location && <span className="ml-4">{task.location}</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Derniers bénévoles inscrits</CardTitle>
                  <CardDescription>Nouvelles inscriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {volunteers.slice(0, 5).map((volunteer) => (
                    <div key={volunteer.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {volunteer.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{volunteer.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{volunteer.email}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{volunteer.hours_volunteered}h</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="events"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Événements
                </TabsTrigger>
                <TabsTrigger
                  value="trainings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Formations
                </TabsTrigger>
              </TabsList>

              {/* Events Management */}
              <TabsContent value="events" className="mt-4">
                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Gestion des événements</CardTitle>
                      <CardDescription>Modifier, annuler ou assigner des bénévoles aux événements.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddTaskOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un événement
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Lieu</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>{task.date}</TableCell>
                            <TableCell>{task.location || "En ligne"}</TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicateEvent()} // Ideally modify this to use task parameter if needed
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    // Pre-fill form logic reuse
                                    setNewTask({
                                      title: task.title,
                                      description: task.description || "",
                                      location: task.location || "",
                                      date: new Date(task.date),
                                      time: task.time || "",
                                      category: task.category || "event",
                                      eventType: (task.event_type as "in_person" | "online") || "in_person",
                                      posterFile: null,
                                      maxVolunteers: task.max_volunteers || 10,
                                      durationHours: task.duration_hours || 2
                                    });
                                    setIsAddTaskOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTask(task.id);
                                    setIsAssignTaskOpen(true);
                                  }}
                                  title="Assigner des bénévoles"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleExportEventVolunteers(task.id, task.title)}
                                  title="Exporter la liste des participants"
                                >
                                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleCancelTask(task.id)}
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trainings Management */}
              <TabsContent value="trainings" className="mt-4">
                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Gestion des formations</CardTitle>
                      <CardDescription>Gérer le catalogue des formations.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddTrainingOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une formation
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Formateur</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainings.map((training) => (
                          <TableRow key={training.id}>
                            <TableCell className="font-medium">{training.title}</TableCell>
                            <TableCell>{new Date(training.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{training.trainer || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancelTraining(training.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Registrations Tab - New Volunteer Approvals */}
          <TabsContent value="registrations">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Inscriptions en attente</CardTitle>
                    <CardDescription>Approuvez ou refusez les nouvelles inscriptions de bénévoles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {volunteers.filter(v => v.status === "pending").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <p className="font-medium">Aucune inscription en attente</p>
                    <p className="text-sm mt-1">Toutes les demandes ont été traitées</p>
                  </div>
                ) : (
                  volunteers
                    .filter(v => v.status === "pending")
                    .map((volunteer) => (
                      <div
                        key={volunteer.id}
                        className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-secondary/10 text-secondary">
                              {volunteer.full_name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{volunteer.full_name}</h3>
                              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                                En attente
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{volunteer.email}</p>
                            {volunteer.governorate && (
                              <p className="text-xs text-muted-foreground">{volunteer.governorate}, {volunteer.city}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Inscrit le {new Date(volunteer.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVolunteer(volunteer);
                                setIsViewVolunteerOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleApproveVolunteer(volunteer.id, volunteer.user_id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(volunteer)}
                            >
                              Refuser
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            {/* Pending Event Registrations Section */}
            <Card className="shadow-card mt-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Participations aux événements</CardTitle>
                    <CardDescription>Bénévoles inscrits en attente de validation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRegistrations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50 text-secondary" />
                    <p className="font-medium">Aucune participation en attente</p>
                  </div>
                ) : (
                  pendingRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {reg.volunteer?.full_name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{reg.volunteer?.full_name}</h3>
                            <Badge variant="outline">
                              {reg.task?.title}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{reg.volunteer?.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Inscrit le {new Date(reg.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleProcessRegistration(reg.id, "in_progress")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleProcessRegistration(reg.id, "cancelled")}
                          >
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Base de données des bénévoles</CardTitle>
                    <CardDescription>Gérez votre équipe de bénévoles</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportAllVolunteers}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter tout
                  </Button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email, gouvernorat..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredVolunteers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun bénévole trouvé</p>
                  </div>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-soft"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {volunteer.full_name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{volunteer.full_name}</h3>
                            {getStatusBadge(volunteer.status || "active")}
                            {volunteer.role === 'admin' ? (
                              <Badge variant="default" className="bg-purple-600 text-white text-xs border-transparent shadow-sm">Admin</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-xs">Bénévole</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{volunteer.email}</p>
                          {volunteer.governorate && (
                            <p className="text-xs text-muted-foreground">{volunteer.governorate}, {volunteer.city}</p>
                          )}
                        </div>
                        <div className="text-right text-sm hidden sm:block">
                          <p className="font-medium">{volunteer.hours_volunteered}h</p>
                          <p className="text-muted-foreground text-xs">heures</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedVolunteer(volunteer);
                              setIsViewVolunteerOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedVolunteer(volunteer);
                              setIsAssignTaskOpen(true);
                            }}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assigner une tâche
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportVolunteerData(volunteer)}>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger la fiche
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="shadow-card lg:col-span-1">
                <CardHeader>
                  <CardTitle>Calendrier</CardTitle>
                  <CardDescription>Sélectionnez une date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    Événements du {selectedDate?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </CardTitle>
                  <CardDescription>Activités planifiées pour cette date</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksForSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun événement pour cette date</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsAddTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un événement
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasksForSelectedDate.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                          onClick={() => fetchEventDetails(task)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            {getStatusBadge(task.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {task.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.time}
                              </span>
                            )}
                            {task.location && <span>{task.location}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Messages */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Messages
                    {stats.unreadMessages > 0 && (
                      <Badge variant="destructive">{stats.unreadMessages}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Messages des bénévoles</CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun message</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-xl border ${message.is_read ? "border-border" : "border-primary/50 bg-primary/5"}`}
                          onClick={() => handleMarkMessageRead(message.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{message.subject}</h3>
                            {!message.is_read && <Badge>Nouveau</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{message.content}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{message.sender_name}</span>
                            <span>{new Date(message.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attestation Requests */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Demandes d'attestation
                    {stats.pendingRequests > 0 && (
                      <Badge variant="destructive">{stats.pendingRequests}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Demandes en attente de traitement</CardDescription>
                </CardHeader>
                <CardContent>
                  {attestationRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune demande</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attestationRequests.map((request) => (
                        <div key={request.id} className="p-4 rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium">
                                {request.request_type === "volunteering" ? "Attestation de bénévolat" :
                                  request.request_type === "training" ? "Attestation de formation" : "Lettre de recommandation"}
                              </h3>
                              <p className="text-sm text-muted-foreground">{request.volunteer_name}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          {request.details && (
                            <p className="text-sm text-muted-foreground mb-3">{request.details}</p>
                          )}
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleProcessRequest(request.id, "rejected")}>
                                Refuser
                              </Button>
                              <Button size="sm" variant="gradient" onClick={() => handleProcessRequest(request.id, "approved")}>
                                Approuver
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Statistiques globales</CardTitle>
                  <CardDescription>Aperçu du département de bénévolat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Bénévoles actifs</p>
                      <p className="text-3xl font-bold">{stats.activeVolunteers}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                      <p className="text-sm text-muted-foreground">Heures cumulées</p>
                      <p className="text-3xl font-bold">{stats.totalHours}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <p className="text-sm text-muted-foreground">Événements terminés</p>
                      <p className="text-3xl font-bold">{stats.completedTasks}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                      <p className="text-sm text-muted-foreground">Formations dispensées</p>
                      <p className="text-3xl font-bold">{stats.totalTrainings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Exporter les données</CardTitle>
                  <CardDescription>Téléchargez les rapports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Liste des bénévoles (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Rapport de participation (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Statistiques mensuelles (Excel)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Heures de bénévolat par personne
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres du compte
            </DialogTitle>
            <DialogDescription>
              Gérez votre photo de profil et votre mot de passe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Avatar Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo de profil
              </Label>
              {user && (
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={localAvatarUrl || profile?.avatar_url || null}
                  onAvatarUpdated={handleAvatarUpdated}
                />
              )}
            </div>

            <div className="border-t border-border" />

            {/* Password Change Section */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Changer le mot de passe
              </Label>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Modifier le mot de passe
                  </>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Volunteer Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <X className="h-5 w-5" />
              Refuser l'inscription
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir refuser l'inscription de{" "}
              <span className="font-medium text-foreground">
                {volunteerToReject?.full_name}
              </span>{" "}
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Motif du refus <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Expliquez la raison du refus (ex: profil incomplet, informations incorrectes, ne correspond pas aux critères...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Ce motif sera enregistré dans le dossier du bénévole.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setVolunteerToReject(null);
                setRejectionReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectVolunteer}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirmer le refus
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Event Confirmation Dialog */}
      <Dialog open={isCancelEventOpen} onOpenChange={setIsCancelEventOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler l'événement ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible et informera les participants.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCancelEventOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={confirmCancelEvent}>
              <X className="mr-2 h-4 w-4" />
              Confirmer l'annulation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Volunteer Dialog - Global */}
      <Dialog open={isViewVolunteerOpen} onOpenChange={setIsViewVolunteerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du bénévole</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedVolunteer.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedVolunteer.full_name}</h2>
                  <p className="text-muted-foreground">{selectedVolunteer.email}</p>
                  {getStatusBadge(selectedVolunteer.status || "pending")}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p>{selectedVolunteer.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Heures de bénévolat</Label>
                  <p className="font-bold text-lg">{selectedVolunteer.hours_volunteered}h</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gouvernorat</Label>
                  <p>{selectedVolunteer.governorate || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ville</Label>
                  <p>{selectedVolunteer.city || "Non renseigné"}</p>
                </div>
              </div>
              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Compétences</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedVolunteer.skills.map((skill, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => exportVolunteerData(selectedVolunteer)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger la fiche
                </Button>
                {selectedVolunteer.status === "pending" && (
                  <>
                    <Button
                      variant="gradient"
                      onClick={() => {
                        handleApproveVolunteer(selectedVolunteer.id, selectedVolunteer.user_id);
                        setIsViewVolunteerOpen(false);
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewVolunteerOpen(false);
                        openRejectDialog(selectedVolunteer);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </>
                )}
                {selectedVolunteer.status !== "pending" && (
                  <Button variant="gradient" onClick={() => {
                    setIsViewVolunteerOpen(false);
                    setIsAssignTaskOpen(true);
                  }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assigner une tâche
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentEvent?.title}</DialogTitle>
            <DialogDescription>Détails et participations</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicateEvent}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancelTask(currentEvent?.id || "")}
              disabled={currentEvent?.status === 'cancelled'}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler l'événement
            </Button>
          </div>

          <div className="space-y-6">
            {/* Event Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{currentEvent?.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{currentEvent?.time || "Toute la journée"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{currentEvent?.location || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{eventRegistrations.filter(r => ['in_progress', 'completed'].includes(r.status)).length} participants validés</span>
              </div>
            </div>
            {currentEvent?.description && (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                {currentEvent.description}
              </p>
            )}

            {/* Registrations List */}
            <div>
              <h3 className="font-medium mb-3 flex items-center justify-between">
                <span>Inscriptions ({eventRegistrations.length})</span>
              </h3>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {eventRegistrations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune inscription pour cet événement.</p>
                ) : (
                  <div className="space-y-3">
                    {eventRegistrations.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{reg.volunteer?.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{reg.volunteer?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{getStatusBadge(reg.status)}</p>
                          </div>
                        </div>
                        {reg.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleProcessRegistration(reg.id, "cancelled")}>Refuser</Button>
                            <Button size="sm" variant="default" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleProcessRegistration(reg.id, "in_progress")}>Valider</Button>
                          </div>
                        )}</div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog - Global */}
      <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner une tâche</DialogTitle>
            <DialogDescription>
              {selectedVolunteer
                ? `Assigner une tâche à ${selectedVolunteer.full_name}`
                : "Sélectionnez un bénévole et une tâche"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!selectedVolunteer && (
              <div className="space-y-2">
                <Label>Bénévole</Label>
                <Select onValueChange={(v) => setSelectedVolunteer(volunteers.find(vol => vol.id === v) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un bénévole" />
                  </SelectTrigger>
                  <SelectContent>
                    {volunteers.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Tâche</Label>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une tâche" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.filter(t => t.status !== "completed").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsAssignTaskOpen(false);
                setSelectedVolunteer(null);
                setSelectedTask("");
              }}>Annuler</Button>
              <Button variant="gradient" onClick={handleAssignTask} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default AdminDashboard;
