import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check if user has explicitly logged out
  const isLoggedOut = localStorage.getItem("admin-logged-out") === "true";
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isLoggedOut, // Don't query if user is logged out
  });

  return {
    user: isLoggedOut ? null : user,
    isLoading: isLoggedOut ? false : isLoading,
    isAuthenticated: !isLoggedOut && !!user,
  };
}
