import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentEntregablesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entregables</h1>
        <p className="text-muted-foreground">
          Sube los archivos de tus tareas y entregas finales.
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Próximamente</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Aquí podrás subir entregables asociados a tus tareas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
