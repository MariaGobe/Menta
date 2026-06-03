import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StudentForm } from "@/components/students/student-form";

export default function NuevoAlumnoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/alumnos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a alumnos
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo alumno</h1>
        <p className="text-muted-foreground">Da de alta un alumno en prácticas.</p>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}
