import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminNavigation from "@/components/admin-navigation";
import MessageModal from "@/components/message-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
} from "lucide-react";

interface MessageLog {
  id: string;
  guestId?: string;
  phoneNumber: string;
  message: string;
  status: string;
  sentAt: string;
  guest?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminMessages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access admin panel",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: messageLogs = [], isLoading: logsLoading } = useQuery<
    MessageLog[]
  >({
    queryKey: ["/api/admin/message-logs"],
    retry: false,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
    retry: false,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-secondary/10 text-secondary">Sent</Badge>;
      case "delivered":
        return (
          <Badge className="bg-secondary/10 text-secondary">Delivered</Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    totalSent: messageLogs.length,
    successful: messageLogs.filter(
      (log) => log.status === "sent" || log.status === "delivered"
    ).length,
    failed: messageLogs.filter((log) => log.status === "failed").length,
    pending: messageLogs.filter((log) => log.status === "pending").length,
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-serif font-bold text-foreground mb-2"
                data-testid="messages-title"
              >
                WhatsApp Messages
              </h1>
              <p className="text-muted-foreground">
                Manage guest communication and view message history
              </p>
            </div>
            <Button
              onClick={() => setMessageModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-new-message"
            >
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-total-messages">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Sent
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-total-value"
                  >
                    {stats.totalSent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-successful">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Successful
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-successful-value"
                  >
                    {stats.successful}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-failed">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-destructive" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Failed
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-failed-value"
                  >
                    {stats.failed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Pending
                  </h3>
                  <p
                    className="text-2xl font-semibold text-foreground"
                    data-testid="stat-pending-value"
                  >
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message History */}
        <Card data-testid="card-message-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messageLogs.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Messages Sent
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start communicating with your guests by sending your first
                  message.
                </p>
                <Button
                  onClick={() => setMessageModalOpen(true)}
                  data-testid="button-first-message"
                >
                  Send First Message
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messageLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        data-testid={`message-row-${log.id}`}
                      >
                        <TableCell>
                          {log.guest ? (
                            <div className="font-medium">
                              {log.guest.firstName} {log.guest.lastName}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              Unknown Guest
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">
                            {log.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm truncate" title={log.message}>
                              {log.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(log.sentAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Modal */}
        <MessageModal
          open={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          onSuccess={() => {
            setMessageModalOpen(false);
            // Refresh message logs
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
