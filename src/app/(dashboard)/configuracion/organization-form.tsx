"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface Props {
  organization: {
    id: string;
    name: string;
    nif: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
  };
}

export function OrganizationForm({ organization }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      nif: (fd.get("nif") as string) || null,
      email: (fd.get("email") as string) || null,
      phone: (fd.get("phone") as string) || null,
      address: (fd.get("address") as string) || null,
      city: (fd.get("city") as string) || null,
      postal_code: (fd.get("postal_code") as string) || null,
    };

    await supabase.from("organizations").update(payload).eq("id", organization.id);
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name">Nombre de la empresa *</Label>
        <Input id="name" name="name" defaultValue={organization.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nif">NIF / CIF</Label>
        <Input id="nif" name="nif" defaultValue={organization.nif ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email de contacto</Label>
        <Input id="email" type="email" name="email" defaultValue={organization.email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={organization.phone ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" defaultValue={organization.address ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postal_code">Código postal</Label>
        <Input id="postal_code" name="postal_code" defaultValue={organization.postal_code ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Población</Label>
        <Input id="city" name="city" defaultValue={organization.city ?? ""} />
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-mint-700">
            <Check className="h-4 w-4" /> Cambios guardados
          </span>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
