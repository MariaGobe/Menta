import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

// =====================================================
// Pricing Menta (mayo 2026)
// =====================================================

export type PlanId = "base" | "pro" | "custom";
export type BillingCycle = "monthly" | "yearly";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** alumnos incluidos */
  includedStudents: number;
  /** precio anual base en € */
  yearlyPrice: number | null;
  /** precio mensual en € */
  monthlyPrice: number | null;
  /** precio por alumno extra (anual) en € */
  extraStudentYearly: number;
  /** descripción corta */
  tagline: string;
  /** features destacados */
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "base",
    name: "Base",
    includedStudents: 2,
    yearlyPrice: 690,
    monthlyPrice: 64,
    extraStudentYearly: 49,
    tagline: "Para empresas que reciben alumnos puntualmente.",
    features: [
      "Mentor virtual configurable",
      "Plan de prácticas con plantillas",
      "Calendario, tareas, diario",
      "Entregables y evaluación automática",
      "Informes para empresa y centro educativo",
      "Hitos públicos del alumno y portfolio LinkedIn",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    includedStudents: 10,
    yearlyPrice: 1200,
    monthlyPrice: 110,
    extraStudentYearly: 49,
    highlight: true,
    tagline: "Para empresas que forman a varios alumnos al año.",
    features: [
      "Todo lo del plan Base",
      "Funcionalidades avanzadas de mentor (analítica)",
      "Retos abiertos para captar talento",
      "Recomendaciones y endorsements en LinkedIn",
      "Soporte prioritario por email",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    includedStudents: 0,
    yearlyPrice: null,
    monthlyPrice: null,
    extraStudentYearly: 0,
    tagline: "Para empresas grandes con necesidades específicas.",
    features: [
      "Plan a medida con tu equipo",
      "Más de 25 alumnos / año",
      "SSO y branding propio",
      "Integraciones con tus sistemas",
      "Soporte dedicado y SLA",
    ],
  },
];

export function getPlan(id: PlanId): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === id);
}

/**
 * Calcula precio total de un plan con alumnos extra.
 */
export function calculatePlanPrice(input: {
  planId: PlanId;
  cycle: BillingCycle;
  students: number;
}): { total: number | null; basePrice: number | null; extras: number; extraCost: number } {
  const plan = getPlan(input.planId);
  if (!plan || plan.yearlyPrice === null) {
    return { total: null, basePrice: null, extras: 0, extraCost: 0 };
  }
  const basePrice =
    input.cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice ?? plan.yearlyPrice;
  const extras = Math.max(0, input.students - plan.includedStudents);
  // El precio por alumno extra siempre es anual (49€/año). Si el ciclo es mensual,
  // lo mensualizamos: 49/12 ≈ 4.08 redondeado a 5€/mes para simpleza.
  const perExtra =
    input.cycle === "monthly"
      ? Math.round(plan.extraStudentYearly / 12)
      : plan.extraStudentYearly;
  const extraCost = extras * perExtra;
  return { total: basePrice + extraCost, basePrice, extras, extraCost };
}

/** Ahorro anual frente al pago mensual */
export function annualSavings(plan: PlanDefinition): number {
  if (plan.monthlyPrice === null || plan.yearlyPrice === null) return 0;
  return Math.max(0, plan.monthlyPrice * 12 - plan.yearlyPrice);
}

/**
 * @deprecated mantén compatibilidad: usar `calculatePlanPrice`.
 */
export function calculatePrice(extraStudents: number) {
  return 690 + Math.max(0, extraStudents) * 49;
}
