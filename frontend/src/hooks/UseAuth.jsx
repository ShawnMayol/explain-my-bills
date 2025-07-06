import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export const UseAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    setUser(currentUser);
  }, []);

  return user;
};
