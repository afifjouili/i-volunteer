import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VolunteerRegistrationForm } from "@/components/volunteer/VolunteerRegistrationForm";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

interface VolunteerFormData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  isStudent: boolean;
  educationLevel: string;
  languages: { language: string; level: string }[];
  organization: string;
  position: string;
  profession: string;
  isAffiliated: boolean;
  affiliationDetails: string;
  governorate: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  email: string;
  phoneMain: string;
  phoneSecondary: string;
  preferredContact: string[];
  skills: string;
  otherSkills: string;
  interests: string;
  availabilityDays: string[];
  availabilityHours: string[];
  iwatchExperience: boolean;
  iwatchEvents: string;
  iwatchYears: string;
  iwatchRole: string;
  otherVolunteering: boolean;
  otherOrgDetails: string;
  isCommunityMember: boolean;
  referralSource: string;
  onboardingQuestions: string;
}

export default function VolunteerOnboarding() {
  const { user, profile, isLoading: authLoading, userRole, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      
      // If admin, redirect to admin dashboard
      if (userRole === "admin") {
        navigate("/admin");
        return;
      }

      // Check if profile is already complete
      if (profile && isProfileComplete(profile)) {
        navigate("/dashboard");
      }
    }
  }, [user, profile, userRole, authLoading, navigate]);

  const isProfileComplete = (p: any) => {
    return p.gender && p.date_of_birth && p.governorate && p.city && p.phone;
  };

  const handleSubmit = async (formData: VolunteerFormData) => {
    if (!user || !profile) return;
    
    setIsSubmitting(true);
    
    // Helper to convert empty strings to null for database
    const toNullIfEmpty = (value: string) => value.trim() === "" ? null : value;
    
    try {
      // Update profile with form data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          gender: toNullIfEmpty(formData.gender),
          date_of_birth: toNullIfEmpty(formData.dateOfBirth),
          is_student: formData.isStudent,
          education_level: toNullIfEmpty(formData.educationLevel),
          organization: toNullIfEmpty(formData.organization),
          position: toNullIfEmpty(formData.position),
          profession: toNullIfEmpty(formData.profession),
          is_affiliated: formData.isAffiliated,
          affiliation_details: toNullIfEmpty(formData.affiliationDetails),
          governorate: toNullIfEmpty(formData.governorate),
          city: toNullIfEmpty(formData.city),
          address_line1: toNullIfEmpty(formData.addressLine1),
          address_line2: toNullIfEmpty(formData.addressLine2),
          postal_code: toNullIfEmpty(formData.postalCode),
          phone: toNullIfEmpty(formData.phoneMain),
          phone_secondary: toNullIfEmpty(formData.phoneSecondary),
          preferred_contact: formData.preferredContact.length > 0 ? formData.preferredContact.join(",") : null,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          other_skills: toNullIfEmpty(formData.otherSkills),
          interests: formData.interests.split(",").map((i) => i.trim()).filter(Boolean),
          availability_days: formData.availabilityDays.length > 0 ? formData.availabilityDays : null,
          availability_hours: formData.availabilityHours.length > 0 ? formData.availabilityHours.join(",") : null,
          iwatch_experience: formData.iwatchExperience,
          iwatch_events: toNullIfEmpty(formData.iwatchEvents),
          iwatch_years: toNullIfEmpty(formData.iwatchYears),
          iwatch_role: toNullIfEmpty(formData.iwatchRole),
          other_volunteering: formData.otherVolunteering,
          other_org_details: toNullIfEmpty(formData.otherOrgDetails),
          is_community_member: formData.isCommunityMember,
          referral_source: toNullIfEmpty(formData.referralSource),
          onboarding_questions: toNullIfEmpty(formData.onboardingQuestions),
          status: "pending",
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Send notification email to admin
      try {
        await supabase.functions.invoke("notify-admin-new-volunteer", {
          body: {
            volunteerName: `${formData.firstName} ${formData.lastName}`.trim(),
            volunteerEmail: formData.email,
            volunteerPhone: formData.phoneMain || undefined,
          },
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
        // Don't block the registration if email fails
      }

      // Save languages
      const languagesToInsert = formData.languages
        .filter((l) => l.level)
        .map((l) => ({
          volunteer_id: profile.id,
          language: l.language,
          level: l.level,
        }));

      if (languagesToInsert.length > 0) {
        // Delete existing languages first
        await supabase
          .from("volunteer_languages")
          .delete()
          .eq("volunteer_id", profile.id);

        const { error: langError } = await supabase
          .from("volunteer_languages")
          .insert(languagesToInsert);

        if (langError) throw langError;
      }

      // Refresh auth context profile so dashboard redirect checks pass
      await refreshUserData();

      toast({
        title: "Inscription envoyée !",
        description: "Votre demande a été soumise. Un administrateur examinera votre profil avant de vous donner accès à la plateforme.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get initial data from existing profile
  const nameParts = profile?.full_name?.split(" ") || [];
  const initialData = {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: profile?.email || user?.email || "",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="I-Volunteer" className="h-8 w-auto" />
            <span className="font-semibold">I-Volunteer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complétez votre profil</h1>
          <p className="text-muted-foreground">
            Pour accéder à votre espace bénévole, veuillez compléter les informations suivantes.
          </p>
        </div>

        <VolunteerRegistrationForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          initialData={initialData}
        />
      </main>
    </div>
  );
}
