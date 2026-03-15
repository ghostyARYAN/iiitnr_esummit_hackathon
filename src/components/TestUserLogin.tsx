import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Users, Shield, HardHat, Gavel } from "lucide-react";

interface TestUserLoginProps {
  onLogin: (email: string, pass: string) => void;
}

const testUsers = [
  {
    role: "Mom Team",
    email: "demomom@prarivesh.app",
    pass: "123456",
    icon: Users,
    color: "text-blue-500",
  },
  {
    role: "Scrutiny Team",
    email: "demioscrutiny@prarivesh.app",
    pass: "123456",
    icon: Shield,
    color: "text-purple-500",
  },
  {
    role: "Project Proponent",
    email: "demoproponent@prarivesh.app",
    pass: "123456",
    icon: HardHat,
    color: "text-orange-500",
  },
  {
    role: "Admin",
    email: "demoadmin@prarivesh.app",
    pass: "123456",
    icon: Gavel,
    color: "text-red-500",
  },
];

export const TestUserLogin = ({ onLogin }: TestUserLoginProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          >
            <User className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Login (Dev)
          </div>
          {testUsers.map((user) => (
            <DropdownMenuItem
              key={user.role}
              onClick={() => onLogin(user.email, user.pass)}
              className="flex items-center gap-2 cursor-pointer py-2"
            >
              <user.icon className={`h-4 w-4 ${user.color}`} />
              <div className="flex flex-col">
                <span className="font-medium">{user.role}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
