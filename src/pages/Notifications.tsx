import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  application_id: string | null;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const markAsRead = async (id: string) => {
    await (supabase as any).from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await (supabase as any).from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 ${!n.read
                      ? "bg-primary/5 border border-primary/10"
                      : "hover:bg-muted/30"
                    }`}
                >
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground/70">{new Date(n.created_at).toLocaleString()}</span>
                      {n.application_id && (
                        <Link to={`/dashboard/applications/${n.application_id}`} className="text-xs text-primary hover:underline font-medium">
                          View Application →
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => markAsRead(n.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
