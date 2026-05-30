export type PracticeType = "fp" | "university" | "internal";
export type StudentStatus = "active" | "completed" | "paused" | "cancelled";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";
export type DocumentType =
  | "convenio"
  | "pfi"
  | "seguro"
  | "anexo"
  | "evaluacion"
  | "informe_final"
  | "cv"
  | "otro";
export type EvaluationType = "inicial" | "intermedia" | "final";
export type UserRole = "owner" | "admin" | "member" | "student";
export type PlanStatus = "draft" | "approved" | "in_progress" | "completed" | "archived";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type CalendarEventType =
  | "task"
  | "milestone"
  | "meeting"
  | "deliverable"
  | "final_presentation";
export type MentorRole = "user" | "assistant";
export type MentorTone = "cercano" | "formal" | "profesional" | "didactico";

export interface MentorConfig {
  id: string;
  organization_id: string;
  company_description: string | null;
  industry: string | null;
  tone: MentorTone | null;
  mentor_personality: string | null;
  knowledge_base: string | null;
  resources: { label: string; url: string }[] | null;
  custom_instructions: string | null;
  updated_at: string;
  updated_by: string | null;
}

export const MENTOR_TONE_LABELS: Record<MentorTone, string> = {
  cercano: "Cercano",
  formal: "Formal",
  profesional: "Profesional",
  didactico: "Didáctico",
};

export type MilestoneType =
  | "problem_solved"
  | "project_completed"
  | "practice_completed"
  | "company_recommendation"
  | "custom";

export interface Milestone {
  id: string;
  organization_id: string;
  student_id: string;
  type: MilestoneType;
  title: string;
  description: string | null;
  task_id: string | null;
  deliverable_id: string | null;
  company_endorsement: string | null;
  endorsed_by: string | null;
  endorsed_at: string | null;
  is_published: boolean;
  public_slug: string | null;
  published_at: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export const MILESTONE_TYPE_LABELS: Record<MilestoneType, string> = {
  problem_solved: "Problema resuelto",
  project_completed: "Proyecto completado",
  practice_completed: "Fin de prácticas",
  company_recommendation: "Recomendación de empresa",
  custom: "Hito personalizado",
};

export type ChallengeStatus = "draft" | "published" | "closed" | "archived";
export type ChallengePaymentStatus = "free" | "pending" | "paid";
export type ApplicationStatus =
  | "registered"
  | "in_progress"
  | "submitted"
  | "withdrawn"
  | "shortlisted"
  | "contacted";

export interface Challenge {
  id: string;
  organization_id: string;
  title: string;
  short_description: string | null;
  problem_statement: string | null;
  requirements: string | null;
  evaluation_criteria: string | null;
  deliverable_format: string | null;
  tags: string[] | null;
  start_date: string;
  end_date: string;
  max_applicants: number | null;
  status: ChallengeStatus;
  payment_status: ChallengePaymentStatus;
  stripe_payment_intent_id: string | null;
  public_slug: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeApplication {
  id: string;
  challenge_id: string;
  organization_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  applicant_linkedin: string | null;
  applicant_education: string | null;
  share_with_company: boolean;
  status: ApplicationStatus;
  score: number | null;
  highlighted: boolean;
  review_notes: string | null;
  applied_at: string;
  submitted_at: string | null;
  shortlisted_at: string | null;
}

export interface ChallengeSubmission {
  id: string;
  application_id: string;
  challenge_id: string;
  content: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  external_url: string | null;
  submitted_at: string;
}

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  archived: "Archivado",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  registered: "Registrado",
  in_progress: "En curso",
  submitted: "Entregado",
  withdrawn: "Retirado",
  shortlisted: "Preseleccionado",
  contacted: "Contactado",
};

export const MILESTONE_TYPE_HINTS: Record<MilestoneType, { placeholder: string; cta: string }> = {
  problem_solved: {
    placeholder:
      "Cuenta brevemente qué problema te encontraste, qué solución diseñaste y qué impacto tuvo. Sé concreto: tecnologías, métricas, contexto.",
    cta: "Solución a un problema",
  },
  project_completed: {
    placeholder:
      "Describe el proyecto: objetivo, tu rol, qué tecnologías usaste, resultado y aprendizajes.",
    cta: "Proyecto completado",
  },
  practice_completed: {
    placeholder:
      "Reflexiona sobre tu paso por la empresa: qué aprendiste, qué te llevas, qué le agradeces al equipo.",
    cta: "He terminado mis prácticas",
  },
  company_recommendation: {
    placeholder:
      "Texto de la empresa recomendando al alumno: actitud, resultados, valores que ha demostrado.",
    cta: "Recomendación recibida",
  },
  custom: {
    placeholder: "Comparte lo que te apetezca destacar de tu experiencia.",
    cta: "Otro hito",
  },
};

export interface Organization {
  id: string;
  name: string;
  nif: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  extra_students_count: number;
  current_period_end: string | null;
  plan_id: "base" | "pro" | "custom" | null;
  billing_cycle: "monthly" | "yearly" | null;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  student_id: string | null;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
}

export interface PracticePlan {
  id: string;
  organization_id: string;
  student_id: string;
  title: string;
  description: string | null;
  objectives: string[] | null;
  status: PlanStatus;
  start_date: string | null;
  end_date: string | null;
  total_hours: number | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticePhase {
  id: string;
  plan_id: string;
  organization_id: string;
  name: string;
  description: string | null;
  order_index: number;
  start_date: string | null;
  end_date: string | null;
}

export interface PracticeTask {
  id: string;
  plan_id: string;
  phase_id: string | null;
  organization_id: string;
  student_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  estimated_hours: number | null;
  deliverable_required: boolean;
  order_index: number;
  completed_at: string | null;
  completed_by: string | null;
}

export interface CalendarEvent {
  id: string;
  organization_id: string;
  student_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
}

export interface DailyActivityLog {
  id: string;
  organization_id: string;
  student_id: string;
  log_date: string;
  tasks_done: string | null;
  hours_worked: number | null;
  learnings: string | null;
  difficulties: string | null;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  organization_id: string;
  student_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  feedback: string | null;
}

export interface MentorMessage {
  id: string;
  student_id: string;
  role: MentorRole;
  content: string;
  created_at: string;
}

export interface FinalPresentation {
  id: string;
  organization_id: string;
  student_id: string;
  title: string | null;
  summary: string | null;
  achievements: { title: string; detail?: string }[] | null;
  competencies: { name: string; level?: string }[] | null;
  highlights: Record<string, unknown> | null;
  is_public: boolean;
  public_slug: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Borrador",
  approved: "Aprobado",
  in_progress: "En curso",
  completed: "Completado",
  archived: "Archivado",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completada",
  blocked: "Bloqueada",
};

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  task: "Tarea",
  milestone: "Hito",
  meeting: "Reunión",
  deliverable: "Entregable",
  final_presentation: "Presentación final",
};

export interface Student {
  id: string;
  organization_id: string;
  full_name: string;
  dni: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  practice_type: PracticeType;
  institution_name: string | null;
  program_name: string | null;
  tutor_academic_name: string | null;
  tutor_academic_email: string | null;
  tutor_academic_phone: string | null;
  tutor_company_name: string | null;
  tutor_company_email: string | null;
  start_date: string | null;
  end_date: string | null;
  total_hours: number;
  weekly_hours: number | null;
  status: StudentStatus;
  notes: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  student_id: string | null;
  type: DocumentType;
  name: string;
  description: string | null;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface Evaluation {
  id: string;
  organization_id: string;
  student_id: string;
  type: EvaluationType;
  evaluation_date: string;
  score: number | null;
  competencies: Record<string, number> | null;
  strengths: string | null;
  improvements: string | null;
  notes: string | null;
  created_at: string;
}

export interface HourLog {
  id: string;
  organization_id: string;
  student_id: string;
  log_date: string;
  hours: number;
  description: string | null;
  approved: boolean;
  created_at: string;
}

export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  fp: "Formación Profesional",
  university: "Universidad",
  internal: "Formación interna",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  convenio: "Convenio",
  pfi: "PFI (Programa Formativo Individual)",
  seguro: "Seguro",
  anexo: "Anexo",
  evaluacion: "Evaluación",
  informe_final: "Informe final",
  cv: "Currículum",
  otro: "Otro",
};

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "Pausado",
  cancelled: "Cancelado",
};

/**
 * Documentos requeridos según el tipo de práctica.
 * El PFI solo es necesario para alumnos de FP.
 */
export const REQUIRED_DOCUMENTS: Record<PracticeType, DocumentType[]> = {
  fp: ["convenio", "pfi", "seguro"],
  university: ["convenio", "seguro"],
  internal: ["convenio"],
};
