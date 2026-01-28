import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";

// Date dropdown helpers
const MONTHS = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const generateDays = () => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => String(currentYear - i));
};

interface VolunteerFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  // Academic
  isStudent: boolean;
  educationLevel: string;
  educationInstitution: string;
  educationSpecialty: string;
  diploma: string;
  languages: { language: string; level: string }[];
  organization: string;
  position: string;
  profession: string;
  isAffiliated: boolean;
  affiliationDetails: string;
  // Contact
  governorate: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  email: string;
  phoneMain: string;
  phoneSecondary: string;
  preferredContact: string[];
  // Skills
  selectedSkills: string[];
  skills: string;
  otherSkills: string;
  selectedInterests: string[];
  interests: string;
  availabilityDays: string[];
  availabilityHours: string[];
  // Experience
  iwatchExperience: boolean;
  iwatchEvents: string;
  iwatchYears: string;
  iwatchRole: string;
  otherVolunteering: boolean;
  otherOrgDetails: string;
  // Additional
  isCommunityMember: boolean;
  referralSource: string;
  onboardingQuestions: string;
  // Consent
  consentTerms: boolean;
  consentDataUsage: boolean;
}

interface Props {
  onSubmit: (data: VolunteerFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<VolunteerFormData>;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_SLOTS = ["8h-10h", "10h-12h", "12h-14h", "14h-16h", "16h-18h", "18h-20h", "20h-22h"];
const EDUCATION_LEVELS = [
  "Secondaire",
  "Baccalauréat",
  "Licence / Diplôme universitaire (Bac+3)",
  "Master (Bac+5)",
  "Doctorat",
  "Formation professionnelle",
  "Autre",
];
const DIPLOMAS = [
  "Baccalauréat",
  "BTS / DUT",
  "Licence",
  "Licence professionnelle",
  "Master",
  "Doctorat",
  "Ingénieur",
  "Certificat professionnel",
  "Autre",
];
const EDUCATION_SPECIALTIES = [
  "Sciences et Technologies",
  "Informatique / Génie logiciel",
  "Génie civil / Architecture",
  "Médecine / Santé",
  "Droit",
  "Économie / Gestion",
  "Commerce / Marketing",
  "Lettres / Langues",
  "Sciences humaines / Sociologie",
  "Sciences politiques",
  "Communication / Journalisme",
  "Arts / Design",
  "Agriculture / Environnement",
  "Éducation / Enseignement",
  "Autre",
];
const LANGUAGE_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Langue maternelle"];
const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
  "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine",
  "Tataouine", "Gafsa", "Tozeur", "Kébili"
];
const STANDARD_SKILLS = [
  "Graphisme",
  "Traduction",
  "Rédaction",
  "Photographie",
  "Gestion de réseaux sociaux",
  "Logistique",
  "Communication",
  "Montage vidéo",
  "Organisation d'événements",
  "Formation / Animation",
  "Développement web",
  "Design UI/UX",
];
const WORK_SECTORS = [
  "Technologies de l'information",
  "Santé / Médical",
  "Éducation / Enseignement",
  "Finance / Banque",
  "Commerce / Vente",
  "Industrie / Production",
  "Administration publique",
  "Tourisme / Hôtellerie",
  "Agriculture",
  "Transport / Logistique",
  "Communication / Médias",
  "Juridique / Droit",
  "Arts / Culture",
  "Construction / BTP",
  "Services aux entreprises",
  "Étudiant(e)",
  "Sans emploi",
  "Autre",
];
const STANDARD_INTERESTS = [
  "Événementiel",
  "Sensibilisation",
  "Formation",
  "Environnement",
  "Droits humains",
  "Éducation",
  "Santé",
  "Culture & Arts",
  "Action sociale",
  "Jeunesse",
  "Citoyenneté",
  "Gouvernance",
];

export function VolunteerRegistrationForm({ onSubmit, isLoading, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VolunteerFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    gender: initialData?.gender || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    isStudent: initialData?.isStudent || false,
    educationLevel: initialData?.educationLevel || "",
    educationInstitution: initialData?.educationInstitution || "",
    educationSpecialty: initialData?.educationSpecialty || "",
    diploma: initialData?.diploma || "",
    languages: initialData?.languages || [
      { language: "Arabe", level: "" },
      { language: "Français", level: "" },
      { language: "Anglais", level: "" },
    ],
    organization: initialData?.organization || "",
    position: initialData?.position || "",
    profession: initialData?.profession || "",
    isAffiliated: initialData?.isAffiliated || false,
    affiliationDetails: initialData?.affiliationDetails || "",
    governorate: initialData?.governorate || "",
    city: initialData?.city || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    postalCode: initialData?.postalCode || "",
    email: initialData?.email || "",
    phoneMain: initialData?.phoneMain || "",
    phoneSecondary: initialData?.phoneSecondary || "",
    preferredContact: initialData?.preferredContact || [],
    selectedSkills: initialData?.selectedSkills || [],
    skills: initialData?.skills || "",
    otherSkills: initialData?.otherSkills || "",
    selectedInterests: initialData?.selectedInterests || [],
    interests: initialData?.interests || "",
    availabilityDays: initialData?.availabilityDays || [],
    availabilityHours: initialData?.availabilityHours || [],
    iwatchExperience: initialData?.iwatchExperience || false,
    iwatchEvents: initialData?.iwatchEvents || "",
    iwatchYears: initialData?.iwatchYears || "",
    iwatchRole: initialData?.iwatchRole || "",
    otherVolunteering: initialData?.otherVolunteering || false,
    otherOrgDetails: initialData?.otherOrgDetails || "",
    isCommunityMember: initialData?.isCommunityMember || false,
    referralSource: initialData?.referralSource || "",
    onboardingQuestions: initialData?.onboardingQuestions || "",
    consentTerms: false,
    consentDataUsage: false,
  });

  // Date of birth dropdown state
  const days = useMemo(() => generateDays(), []);
  const years = useMemo(() => generateYears(), []);

  const parsedDate = formData.dateOfBirth ? formData.dateOfBirth.split("-") : ["", "", ""];
  const birthYear = parsedDate[0] || "";
  const birthMonth = parsedDate[1] || "";
  const birthDay = parsedDate[2] || "";

  const handleDatePartChange = (part: "day" | "month" | "year", value: string) => {
    let newYear = birthYear;
    let newMonth = birthMonth;
    let newDay = birthDay;

    if (part === "day") newDay = value;
    if (part === "month") newMonth = value;
    if (part === "year") newYear = value;

    if (newYear && newMonth && newDay) {
      updateField("dateOfBirth", `${newYear}-${newMonth}-${newDay}`);
    } else if (newYear || newMonth || newDay) {
      // Store partial date for UI state
      updateField("dateOfBirth", `${newYear || "0000"}-${newMonth || "00"}-${newDay || "00"}`);
    }
  };

  const updateField = (field: keyof VolunteerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLanguage = (index: number, field: "language" | "level", value: string) => {
    const newLanguages = [...formData.languages];
    newLanguages[index][field] = value;
    updateField("languages", newLanguages);
  };

  const addLanguage = () => {
    updateField("languages", [...formData.languages, { language: "", level: "" }]);
  };

  const removeLanguage = (index: number) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    updateField("languages", newLanguages);
  };

  const isDefaultLanguage = (lang: string) => {
    return ["Arabe", "Français", "Anglais"].includes(lang);
  };

  const toggleDay = (day: string) => {
    const days = formData.availabilityDays.includes(day)
      ? formData.availabilityDays.filter(d => d !== day)
      : [...formData.availabilityDays, day];
    updateField("availabilityDays", days);
  };

  const toggleSkill = (skill: string) => {
    const skills = formData.selectedSkills.includes(skill)
      ? formData.selectedSkills.filter(s => s !== skill)
      : [...formData.selectedSkills, skill];
    updateField("selectedSkills", skills);
  };

  const toggleInterest = (interest: string) => {
    const interests = formData.selectedInterests.includes(interest)
      ? formData.selectedInterests.filter(i => i !== interest)
      : [...formData.selectedInterests, interest];
    updateField("selectedInterests", interests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const totalSteps = 7;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step > i + 1
                  ? "bg-primary text-primary-foreground"
                  : step === i + 1
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-8 md:w-16 h-1 mx-1 ${step > i + 1 ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>A. Informations Personnelles</CardTitle>
            <CardDescription>Vos informations de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom de famille *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genre *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(v) => updateField("gender", v)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="homme" id="homme" />
                  <Label htmlFor="homme">Homme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femme" id="femme" />
                  <Label htmlFor="femme">Femme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autre" id="autre" />
                  <Label htmlFor="autre">Autre / Préfère ne pas répondre</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Date de naissance *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={birthDay}
                  onValueChange={(v) => handleDatePartChange("day", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={birthMonth}
                  onValueChange={(v) => handleDatePartChange("month", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={birthYear}
                  onValueChange={(v) => handleDatePartChange("year", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Academic & Professional */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>B. Parcours Académique et Professionnel</CardTitle>
            <CardDescription>Votre formation et expérience professionnelle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section 1: Formation Académique */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-lg font-semibold text-primary">1.</span>
                <h3 className="text-lg font-semibold">Formation Académique</h3>
              </div>
              
              {/* Student checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <Checkbox
                  id="isStudent"
                  checked={formData.isStudent}
                  onCheckedChange={(c) => updateField("isStudent", c)}
                  className="h-5 w-5"
                />
                <Label htmlFor="isStudent" className="text-base font-medium cursor-pointer">
                  Êtes-vous actuellement étudiant(e) ?
                </Label>
              </div>

              {/* Education Level & Diploma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Niveau d'études *</Label>
                  <Select value={formData.educationLevel} onValueChange={(v) => updateField("educationLevel", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionnez votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Diplôme obtenu *</Label>
                  <Select value={formData.diploma} onValueChange={(v) => updateField("diploma", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionnez votre diplôme" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIPLOMAS.map((diploma) => (
                        <SelectItem key={diploma} value={diploma}>{diploma}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Institution & Specialty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="educationInstitution" className="text-sm font-medium">Établissement d'éducation *</Label>
                  <Input
                    id="educationInstitution"
                    value={formData.educationInstitution}
                    onChange={(e) => updateField("educationInstitution", e.target.value)}
                    placeholder="Nom de votre dernier établissement"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Spécialité / Filière *</Label>
                  <Select value={formData.educationSpecialty} onValueChange={(v) => updateField("educationSpecialty", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionnez votre spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Langues */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-lg font-semibold text-primary">2.</span>
                <h3 className="text-lg font-semibold">Langues parlées</h3>
              </div>
              
              <div className="space-y-3">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/40">
                    {isDefaultLanguage(lang.language) ? (
                      <span className="min-w-[100px] text-sm font-medium text-foreground">{lang.language}</span>
                    ) : (
                      <Input
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, "language", e.target.value)}
                        placeholder="Nom de la langue"
                        className="min-w-[100px] max-w-[140px] h-10"
                      />
                    )}
                    <Select value={lang.level} onValueChange={(v) => updateLanguage(index, "level", v)}>
                      <SelectTrigger className="flex-1 h-10">
                        <SelectValue placeholder="Sélectionnez le niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isDefaultLanguage(lang.language) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(index)}
                        className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLanguage}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une langue
              </Button>
            </div>

            {/* Section 3: Situation Professionnelle */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-lg font-semibold text-primary">3.</span>
                <h3 className="text-lg font-semibold">Situation Professionnelle</h3>
              </div>
              
              {/* Organization & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium">Organisation / Institution *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => updateField("organization", e.target.value)}
                    placeholder="Nom de votre organisation"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">Poste occupé *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => updateField("position", e.target.value)}
                    placeholder="Votre poste actuel"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Work Sector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Secteur d'activité *</Label>
                <Select value={formData.profession} onValueChange={(v) => updateField("profession", v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionnez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliation */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Checkbox
                    id="isAffiliated"
                    checked={formData.isAffiliated}
                    onCheckedChange={(c) => updateField("isAffiliated", c)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="isAffiliated" className="text-base cursor-pointer">
                    Êtes-vous affilié(e) à une ONG, un syndicat, un parti politique ou un club ?
                  </Label>
                </div>
                {formData.isAffiliated && (
                  <Input
                    placeholder="Si oui, lequel/laquelle ?"
                    value={formData.affiliationDetails}
                    onChange={(e) => updateField("affiliationDetails", e.target.value)}
                    className="h-11"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>C. Coordonnées</CardTitle>
            <CardDescription>Vos informations de contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gouvernorat *</Label>
                <Select value={formData.governorate} onValueChange={(v) => updateField("governorate", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATES.map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Adresse (Ligne 1) *</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Adresse (Ligne 2)</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code Postal *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneMain">Téléphone principal *</Label>
                <Input
                  id="phoneMain"
                  type="tel"
                  value={formData.phoneMain}
                  onChange={(e) => updateField("phoneMain", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneSecondary">Téléphone secondaire</Label>
                <Input
                  id="phoneSecondary"
                  type="tel"
                  value={formData.phoneSecondary}
                  onChange={(e) => updateField("phoneSecondary", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Moyen de contact préféré *</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact-email"
                    checked={formData.preferredContact.includes("email")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField("preferredContact", [...formData.preferredContact, "email"]);
                      } else {
                        updateField("preferredContact", formData.preferredContact.filter(c => c !== "email"));
                      }
                    }}
                  />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact-phone"
                    checked={formData.preferredContact.includes("phone")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField("preferredContact", [...formData.preferredContact, "phone"]);
                      } else {
                        updateField("preferredContact", formData.preferredContact.filter(c => c !== "phone"));
                      }
                    }}
                  />
                  <Label htmlFor="contact-phone">Téléphone (Appel)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact-whatsapp"
                    checked={formData.preferredContact.includes("whatsapp")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField("preferredContact", [...formData.preferredContact, "whatsapp"]);
                      } else {
                        updateField("preferredContact", formData.preferredContact.filter(c => c !== "whatsapp"));
                      }
                    }}
                  />
                  <Label htmlFor="contact-whatsapp">SMS / WhatsApp</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Skills & Interests */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>D. Compétences et Intérêts</CardTitle>
            <CardDescription>Vos compétences et disponibilités</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Compétences spécifiques * (sélection rapide)</Label>
              <div className="flex flex-wrap gap-2">
                {STANDARD_SKILLS.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant={formData.selectedSkills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherSkills">Autres compétences (précisez)</Label>
              <Textarea
                id="otherSkills"
                value={formData.otherSkills}
                onChange={(e) => updateField("otherSkills", e.target.value)}
                placeholder="Listez vos autres compétences..."
              />
            </div>

            <div className="space-y-2">
              <Label>Domaines d'intérêt pour le bénévolat * (sélection rapide)</Label>
              <div className="flex flex-wrap gap-2">
                {STANDARD_INTERESTS.map((interest) => (
                  <Button
                    key={interest}
                    type="button"
                    variant={formData.selectedInterests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Autres domaines d'intérêt (précisez)</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => updateField("interests", e.target.value)}
                placeholder="Listez vos autres domaines d'intérêt..."
              />
            </div>

            <div className="space-y-2">
              <Label>Disponibilité (jours) *</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.availabilityDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plages horaires préférées *</Label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={formData.availabilityHours.includes(slot) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (formData.availabilityHours.includes(slot)) {
                        updateField("availabilityHours", formData.availabilityHours.filter(s => s !== slot));
                      } else {
                        updateField("availabilityHours", [...formData.availabilityHours, slot]);
                      }
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Experience */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>E. Expérience en Bénévolat</CardTitle>
            <CardDescription>Votre expérience passée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Avec IWATCH</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="iwatchExperience"
                  checked={formData.iwatchExperience}
                  onCheckedChange={(c) => updateField("iwatchExperience", c)}
                />
                <Label htmlFor="iwatchExperience">
                  Avez-vous déjà participé à des événements avec IWATCH ?
                </Label>
              </div>
              {formData.iwatchExperience && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="iwatchEvents">Lequel/lesquels ?</Label>
                    <Input
                      id="iwatchEvents"
                      value={formData.iwatchEvents}
                      onChange={(e) => updateField("iwatchEvents", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iwatchYears">Année(s)</Label>
                    <Input
                      id="iwatchYears"
                      value={formData.iwatchYears}
                      onChange={(e) => updateField("iwatchYears", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iwatchRole">Quel était votre rôle ?</Label>
                    <Input
                      id="iwatchRole"
                      value={formData.iwatchRole}
                      onChange={(e) => updateField("iwatchRole", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Avec d'autres organismes</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="otherVolunteering"
                  checked={formData.otherVolunteering}
                  onCheckedChange={(c) => updateField("otherVolunteering", c)}
                />
                <Label htmlFor="otherVolunteering">
                  Avez-vous déjà été bénévole pour d'autres organismes ?
                </Label>
              </div>
              {formData.otherVolunteering && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="otherOrgDetails">
                    Nom de l'organisme, événement, année(s) et rôle
                  </Label>
                  <Textarea
                    id="otherOrgDetails"
                    value={formData.otherOrgDetails}
                    onChange={(e) => updateField("otherOrgDetails", e.target.value)}
                    placeholder="Décrivez votre expérience..."
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Additional Info */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>F. Informations Complémentaires</CardTitle>
            <CardDescription>Questions additionnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCommunityMember"
                checked={formData.isCommunityMember}
                onCheckedChange={(c) => updateField("isCommunityMember", c)}
              />
              <Label htmlFor="isCommunityMember">
                Êtes-vous membre de la communauté ? (Si applicable)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralSource">Comment avez-vous entendu parler de nous ?</Label>
              <Input
                id="referralSource"
                value={formData.referralSource}
                onChange={(e) => updateField("referralSource", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboardingQuestions">
                Avez-vous des questions sur la session d'intégration (Onboarding session) ?
              </Label>
              <Textarea
                id="onboardingQuestions"
                value={formData.onboardingQuestions}
                onChange={(e) => updateField("onboardingQuestions", e.target.value)}
                placeholder="Vos questions..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Consent & Confirmation */}
      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>G. Confirmation & Consentement</CardTitle>
            <CardDescription>Veuillez lire et accepter les conditions avant de soumettre votre inscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Important</h4>
              <p className="text-sm text-muted-foreground">
                Après soumission de votre inscription, votre compte sera en attente de validation par un administrateur. 
                Vous recevrez une notification une fois votre compte activé et pourrez alors accéder à toutes les fonctionnalités de la plateforme.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentTerms"
                  checked={formData.consentTerms}
                  onCheckedChange={(c) => updateField("consentTerms", c)}
                />
                <Label htmlFor="consentTerms" className="text-sm leading-relaxed">
                  J'accepte les conditions générales d'utilisation de la plateforme et je m'engage à respecter la charte du bénévole. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentDataUsage"
                  checked={formData.consentDataUsage}
                  onCheckedChange={(c) => updateField("consentDataUsage", c)}
                />
                <Label htmlFor="consentDataUsage" className="text-sm leading-relaxed">
                  J'autorise la collecte et l'utilisation de mes données personnelles dans le cadre de mes activités de bénévolat, conformément à la politique de confidentialité. *
                </Label>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm">
                En soumettant ce formulaire, je certifie que les informations fournies sont exactes et complètes. 
                Je comprends que mon compte sera activé après validation par l'équipe administrative.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Précédent
        </Button>
        
        {step < totalSteps ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
            Suivant
          </Button>
        ) : (
          <Button 
            type="submit" 
            variant="gradient" 
            disabled={isLoading || !formData.consentTerms || !formData.consentDataUsage}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Confirmer et soumettre mon inscription"
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
