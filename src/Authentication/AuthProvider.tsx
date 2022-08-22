import React, {ReactNode, useEffect, useState} from "react";
import {Alert} from "react-native";

import Realm from "realm";

const clientSchema = {
  name: "client",
  properties: {
    _id: "objectId",
    DOB: "string",
    alias: "string?",
    firstName: "string",
    hmisID: "string?",
    lastName: "string",
    organization: "string",
  },
  primaryKey: "_id",
};

type UserCustomData = {
  _id: string;
  email: string;
  organization: string;
  role: string | null;
  status: string | null;
};

type AuthContextType = {
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  isAuthenticated: boolean;
  user: Realm.User | null;
  organization: string | null;
  role: string | null;
  status: string | null;
  realm: Realm | null;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

const APP_ID: string = "hmis-go-atzkx";

const AuthProvider = ({children}: {children: ReactNode}) => {
  const app = new Realm.App(APP_ID);

  const [user, setUser] = useState<Realm.User | null>(app.currentUser);
  const [realm, setRealm] = useState<Realm | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;

      const organization = (user.customData as UserCustomData).organization;

      if (!organization) return;

      try {
        if (realm) realm.close();
        setRealm(
          await Realm.open({
            schema: [clientSchema],
            sync: {
              user: user,
              partitionValue: organization,
            },
          }),
        );
      } catch (error) {
        Alert.alert("", String(error));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    return () => {
      if (realm) {
        realm.close();
        setRealm(null);
      }
    };
  }, [realm]);

  const logIn = async (email: string, password: string) => {
    try {
      setUser(
        await app.logIn(Realm.Credentials.emailPassword(email, password)),
      );
    } catch (error) {
      throw error;
    }
  };

  const logOut = async () => {
    await app.currentUser?.logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        isAuthenticated: user !== null,
        user,
        organization: user
          ? (user.customData as UserCustomData).organization
          : null,
        role: user ? (user.customData as UserCustomData).role : null,
        status: user ? (user.customData as UserCustomData).status : null,
        realm,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
