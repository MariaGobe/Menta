import { type PracticeType } from "@/types/database";

export interface TemplateTask {
  title: string;
  description?: string;
  estimated_hours: number;
  deliverable_required?: boolean;
  /** Día offset desde el inicio del plan (relativo a start_date) */
  due_day_offset: number;
}

export interface TemplatePhase {
  name: string;
  description?: string;
  /** Porcentaje del plan que ocupa esta fase (suma de fases = 100) */
  weight_pct: number;
  tasks: TemplateTask[];
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  default_objectives: string[];
  phases: TemplatePhase[];
}

/**
 * Plantillas base por tipo de práctica.
 * Las plantillas son meramente un punto de partida; al generar un plan,
 * las fechas concretas se calculan en función de start_date / end_date
 * del alumno y los porcentajes de cada fase.
 */
export const PLAN_TEMPLATES: Record<PracticeType, PlanTemplate> = {
  fp: {
    id: "fp_default",
    name: "Plan estándar de FP",
    description:
      "Plan tipo para alumnos de FP basado en PFI: onboarding, aprendizaje guiado, proyecto principal y cierre con memoria.",
    default_objectives: [
      "Aplicar las competencias adquiridas en el ciclo en un entorno real",
      "Familiarizarse con las herramientas y procesos de la empresa",
      "Desarrollar autonomía y trabajo en equipo",
      "Producir entregables que demuestren el aprendizaje",
    ],
    phases: [
      {
        name: "1. Onboarding e integración",
        description: "Conocer la empresa, equipo, herramientas y normativa.",
        weight_pct: 15,
        tasks: [
          {
            title: "Reunión de bienvenida con el tutor",
            description: "Presentación del equipo y revisión del PFI.",
            estimated_hours: 1,
            due_day_offset: 1,
          },
          {
            title: "Acceso a herramientas y cuentas",
            estimated_hours: 2,
            due_day_offset: 2,
          },
          {
            title: "Lectura de documentación interna",
            estimated_hours: 4,
            due_day_offset: 5,
          },
          {
            title: "Definición de objetivos concretos con el tutor",
            estimated_hours: 1,
            due_day_offset: 5,
          },
        ],
      },
      {
        name: "2. Aprendizaje guiado",
        description: "Tareas dirigidas para adquirir competencias clave.",
        weight_pct: 35,
        tasks: [
          {
            title: "Primera tarea acompañada por el tutor",
            estimated_hours: 8,
            due_day_offset: 10,
            deliverable_required: true,
          },
          {
            title: "Sesión de feedback con el tutor",
            estimated_hours: 1,
            due_day_offset: 12,
          },
          {
            title: "Segunda tarea con mayor autonomía",
            estimated_hours: 12,
            due_day_offset: 20,
            deliverable_required: true,
          },
        ],
      },
      {
        name: "3. Proyecto principal",
        description:
          "Trabajo más extenso que demuestra competencias adquiridas.",
        weight_pct: 35,
        tasks: [
          {
            title: "Definición del proyecto",
            estimated_hours: 2,
            due_day_offset: 25,
          },
          {
            title: "Desarrollo del proyecto",
            estimated_hours: 40,
            due_day_offset: 50,
            deliverable_required: true,
          },
          {
            title: "Revisión intermedia",
            estimated_hours: 2,
            due_day_offset: 40,
          },
        ],
      },
      {
        name: "4. Cierre y memoria",
        description: "Memoria, presentación final y evaluación.",
        weight_pct: 15,
        tasks: [
          {
            title: "Redacción de la memoria de prácticas",
            estimated_hours: 8,
            due_day_offset: 75,
            deliverable_required: true,
          },
          {
            title: "Presentación final al tutor",
            estimated_hours: 2,
            due_day_offset: 80,
          },
          {
            title: "Evaluación final",
            estimated_hours: 1,
            due_day_offset: 82,
          },
        ],
      },
    ],
  },
  university: {
    id: "university_default",
    name: "Plan estándar universitario",
    description:
      "Plan tipo para alumnos universitarios con foco en proyecto y memoria final.",
    default_objectives: [
      "Aplicar conocimientos académicos en un contexto profesional",
      "Desarrollar un proyecto que aporte valor a la empresa",
      "Mejorar la capacidad de análisis y comunicación",
    ],
    phases: [
      {
        name: "1. Inmersión",
        weight_pct: 10,
        tasks: [
          { title: "Bienvenida y conocimiento del equipo", estimated_hours: 1, due_day_offset: 1 },
          { title: "Estudio del contexto y herramientas", estimated_hours: 4, due_day_offset: 5 },
          { title: "Definición del proyecto con tutor", estimated_hours: 2, due_day_offset: 7 },
        ],
      },
      {
        name: "2. Investigación y diseño",
        weight_pct: 25,
        tasks: [
          { title: "Investigación previa", estimated_hours: 10, due_day_offset: 15, deliverable_required: true },
          { title: "Diseño de la solución", estimated_hours: 8, due_day_offset: 22, deliverable_required: true },
        ],
      },
      {
        name: "3. Desarrollo",
        weight_pct: 45,
        tasks: [
          { title: "Implementación del proyecto", estimated_hours: 40, due_day_offset: 60, deliverable_required: true },
          { title: "Revisión intermedia con tutor académico", estimated_hours: 1, due_day_offset: 40 },
          { title: "Pruebas y validación", estimated_hours: 10, due_day_offset: 65 },
        ],
      },
      {
        name: "4. Memoria y defensa",
        weight_pct: 20,
        tasks: [
          { title: "Redacción de la memoria", estimated_hours: 15, due_day_offset: 78, deliverable_required: true },
          { title: "Preparación de la defensa", estimated_hours: 4, due_day_offset: 82 },
          { title: "Defensa final", estimated_hours: 1, due_day_offset: 84 },
        ],
      },
    ],
  },
  internal: {
    id: "internal_default",
    name: "Plan de formación interna",
    description:
      "Plan tipo para formación interna en la empresa: onboarding, aprendizaje y proyecto.",
    default_objectives: [
      "Dominar la herramienta o proceso objeto de la formación",
      "Aplicar lo aprendido en un proyecto real",
      "Documentar el aprendizaje para futuros compañeros",
    ],
    phases: [
      {
        name: "1. Onboarding",
        weight_pct: 20,
        tasks: [
          { title: "Sesión de bienvenida", estimated_hours: 1, due_day_offset: 1 },
          { title: "Materiales y recursos iniciales", estimated_hours: 4, due_day_offset: 3 },
          { title: "Objetivos concretos definidos", estimated_hours: 1, due_day_offset: 5 },
        ],
      },
      {
        name: "2. Aprendizaje",
        weight_pct: 40,
        tasks: [
          { title: "Tutoriales / formación guiada", estimated_hours: 10, due_day_offset: 15 },
          { title: "Ejercicio práctico 1", estimated_hours: 5, due_day_offset: 20, deliverable_required: true },
          { title: "Ejercicio práctico 2", estimated_hours: 8, due_day_offset: 28, deliverable_required: true },
        ],
      },
      {
        name: "3. Proyecto aplicado",
        weight_pct: 30,
        tasks: [
          { title: "Proyecto aplicado a caso real", estimated_hours: 16, due_day_offset: 45, deliverable_required: true },
          { title: "Revisión con responsable", estimated_hours: 1, due_day_offset: 47 },
        ],
      },
      {
        name: "4. Documentación y cierre",
        weight_pct: 10,
        tasks: [
          { title: "Documentar el aprendizaje", estimated_hours: 4, due_day_offset: 55, deliverable_required: true },
          { title: "Sesión de cierre y feedback", estimated_hours: 1, due_day_offset: 58 },
        ],
      },
    ],
  },
};

export interface GeneratedTask {
  title: string;
  description: string | null;
  estimated_hours: number;
  deliverable_required: boolean;
  due_date: string;
  order_index: number;
}

export interface GeneratedPhase {
  name: string;
  description: string | null;
  order_index: number;
  start_date: string;
  end_date: string;
  tasks: GeneratedTask[];
}

export interface GeneratedPlan {
  title: string;
  description: string;
  objectives: string[];
  start_date: string;
  end_date: string;
  total_hours: number;
  phases: GeneratedPhase[];
}

interface GenerateInput {
  practiceType: PracticeType;
  studentName: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  customObjectives?: string[];
  companyContext?: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)));
}

/**
 * Genera un plan concreto adaptando la plantilla a las fechas y horas del alumno.
 * Las due_day_offset de las plantillas (basadas en 84 días) se escalan al período
 * real entre start_date y end_date.
 */
export function generatePlanFromTemplate(input: GenerateInput): GeneratedPlan {
  const template = PLAN_TEMPLATES[input.practiceType];
  const totalDays = diffDays(input.startDate, input.endDate);
  // Las plantillas están calibradas a ~84 días; calculamos un factor de escala
  const scaleFactor = totalDays / 84;

  let cumulativePct = 0;
  const phases: GeneratedPhase[] = template.phases.map((p, idx) => {
    const phaseStartPct = cumulativePct;
    cumulativePct += p.weight_pct;
    const phaseEndPct = cumulativePct;

    const phaseStart = addDays(
      input.startDate,
      Math.round((phaseStartPct / 100) * totalDays),
    );
    const phaseEnd = addDays(
      input.startDate,
      Math.round((phaseEndPct / 100) * totalDays),
    );

    const tasks: GeneratedTask[] = p.tasks.map((t, tIdx) => ({
      title: t.title,
      description: t.description ?? null,
      estimated_hours: t.estimated_hours,
      deliverable_required: t.deliverable_required ?? false,
      due_date: addDays(input.startDate, Math.round(t.due_day_offset * scaleFactor)),
      order_index: tIdx,
    }));

    return {
      name: p.name,
      description: p.description ?? null,
      order_index: idx,
      start_date: phaseStart,
      end_date: phaseEnd,
      tasks,
    };
  });

  return {
    title: `Plan de prácticas — ${input.studentName}`,
    description:
      input.companyContext ??
      `Plan generado automáticamente a partir de plantilla "${template.name}".`,
    objectives:
      input.customObjectives && input.customObjectives.length > 0
        ? input.customObjectives
        : template.default_objectives,
    start_date: input.startDate,
    end_date: input.endDate,
    total_hours: input.totalHours,
    phases,
  };
}
