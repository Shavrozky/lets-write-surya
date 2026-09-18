import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { communityApi } from "../services/communityApi";

const CommunityAuthContext = createContext(null);

export function CommunityAuthProvider({ children }) {
  const initialToken = localStorage.getItem("community_token");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("community_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!initialToken) return;

    let isMounted = true;

    communityApi
      .getMe()
      .then((data) => {
        if (!isMounted) return;

        setUser(data.user);
        localStorage.setItem("community_user", JSON.stringify(data.user));
      })
      .catch(() => {
        if (!isMounted) return;

        localStorage.removeItem("community_token");
        localStorage.removeItem("community_user");
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialToken]);

  const authenticate = ({ token, user: authenticatedUser }) => {
    localStorage.setItem("community_token", token);
    localStorage.setItem("community_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("community_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const signOut = async () => {
    await communityApi.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authenticate,
      updateUser,
      signOut,
    }),
    [user, isLoading],
  );

  return (
    <CommunityAuthContext.Provider value={value}>
      {children}
    </CommunityAuthContext.Provider>
  );
}

export function useCommunityAuth() {
  const context = useContext(CommunityAuthContext);

  if (!context) {
    throw new Error(
      "useCommunityAuth must be used within a CommunityAuthProvider.",
    );
  }

  return context;
}
