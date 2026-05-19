import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  organizationName: string;
  userName: string;
}

export function Topbar({ organizationName, userName }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <p className="text-xs text-muted-foreground">Organización</p>
        <p className="text-sm font-semibold">{organizationName}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{userName}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-100 text-sm font-semibold text-mint-800">
          {userName.charAt(0).toUpperCase()}
        </div>
        <form action="/auth/signout" method="POST">
          <Button variant="ghost" size="icon" type="submit" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
