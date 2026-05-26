import { Presentation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentPresentacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presentación final</h1>
        <p className="text-muted-foreground">
          Al final de tus prácticas podrás generar y publicar tu presentación.
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Presentation className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Próximamente</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Genera una presentación a partir de tu actividad, aprendizajes y
            entregables. Podrás publicarla como portfolio profesional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
