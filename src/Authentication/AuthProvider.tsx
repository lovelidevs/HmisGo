import React, {ReactNode, useState} from "react";

import Realm from "realm";

type UserCustomData = {
  _id: string;
  email: string;
  organization: string;
  role: string | null;
  status: string | null;
};

type AuthContextType = {
  logIn: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  user: Realm.User | null;
  organization: string | null;
  role: string | null;
  status: string | null;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

const APP_ID: string = "hmis-go-atzkx";

const AuthProvider = ({children}: {children: ReactNode}) => {
  const app = new Realm.App(APP_ID);

  const [user, setUser] = useState<Realm.User | null>(app.currentUser);

  const logIn = async (email: string, password: string) => {
    try {
      setUser(
        await app.logIn(Realm.Credentials.emailPassword(email, password)),
      );
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        isAuthenticated: user !== null,
        user,
        organization: user
          ? (user.customData as UserCustomData).organization
          : null,
        role: user ? (user.customData as UserCustomData).role : null,
        status: user ? (user.customData as UserCustomData).status : null,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
