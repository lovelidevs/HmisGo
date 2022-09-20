import React, {ReactNode, useEffect, useState} from "react";
import {Alert} from "react-native";

import Realm from "realm";

const userdatumSchema = {
  name: "userdatum",
  properties: {
    _id: "string",
    email: "string",
    organization: "string",
    role: "string",
    status: "string",
  },
  primaryKey: "_id",
};

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
    serviceHistory: "client_serviceHistory[]",
  },
  primaryKey: "_id",
};

const client_serviceHistorySchema = {
  name: "client_serviceHistory",
  embedded: true,
  properties: {
    city: "string?",
    date: "string",
    location: "string?",
    locationCategory: "string?",
    services: "client_serviceHistory_services[]",
    time: "date?",
  },
};

const client_serviceHistory_servicesSchema = {
  name: "client_serviceHistory_services",
  embedded: true,
  properties: {
    count: "int?",
    list: "string[]",
    service: "string",
    text: "string?",
    units: "string?",
  },
};

const locationSchema = {
  name: "location",
  properties: {
    _id: "objectId",
    cities: "location_cities[]",
    organization: "string",
  },
  primaryKey: "_id",
};

const location_citiesSchema = {
  name: "location_cities",
  embedded: true,
  properties: {
    categories: "location_cities_categories[]",
    city: "string",
    uuid: "string",
  },
};

const location_cities_categoriesSchema = {
  name: "location_cities_categories",
  embedded: true,
  properties: {
    category: "string",
    locations: "location_cities_categories_locations[]",
    uuid: "string",
  },
};

const location_cities_categories_locationsSchema = {
  name: "location_cities_categories_locations",
  embedded: true,
  properties: {
    location: "string",
    places: "string[]",
    uuid: "string",
  },
};

const serviceSchema = {
  name: "service",
  properties: {
    _id: "objectId",
    categories: "service_categories[]",
    organization: "string",
  },
  primaryKey: "_id",
};

const service_categoriesSchema = {
  name: "service_categories",
  embedded: true,
  properties: {
    category: "string",
    services: "service_categories_services[]",
    uuid: "string",
  },
};

const service_categories_servicesSchema = {
  name: "service_categories_services",
  embedded: true,
  properties: {
    customList: "string[]",
    inputType: "string",
    service: "string",
    units: "string?",
    uuid: "string",
  },
};

const dailylistSchema = {
  name: "dailylist",
  properties: {
    _id: "objectId",
    contacts: "dailylist_contacts[]",
    creator: "string",
    note: "string[]",
    organization: "string",
    timestamp: "date",
  },
  primaryKey: "_id",
};

const dailylist_contactsSchema = {
  name: "dailylist_contacts",
  embedded: true,
  properties: {
    cityUUID: "string",
    clientId: "objectId",
    location: "string",
    locationCategoryUUID: "string",
    services: "dailylist_contacts_services[]",
    timestamp: "date",
  },
};

const dailylist_contacts_servicesSchema = {
  name: "dailylist_contacts_services",
  embedded: true,
  properties: {
    count: "int?",
    list: "string[]",
    service: "string",
    text: "string?",
    units: "string?",
    uuid: "string",
  },
};

const noteSchema = {
  name: "note",
  properties: {
    _id: "objectId",
    content: "string[]",
    datetime: "date",
    organization: "string",
  },
  primaryKey: "_id",
};

type UserCustomData = {
  _id: string;
  email: string;
  organization: string;
  role: string;
  status: string;
};

type AuthContextType = {
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  user: Realm.User | null;
  userEmail: string | null;
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

  const [userEmail, setUserEmail] = useState<string>(
    app.currentUser?.customData
      ? (app.currentUser?.customData as UserCustomData).email
      : "",
  );
  const [organization, setOrganization] = useState<string>(
    app.currentUser?.customData
      ? (app.currentUser?.customData as UserCustomData).organization
      : "",
  );
  const [role, setRole] = useState<string>(
    app.currentUser?.customData
      ? (app.currentUser?.customData as UserCustomData).role
      : "",
  );
  const [status, setStatus] = useState<string>(
    app.currentUser?.customData
      ? (app.currentUser?.customData as UserCustomData).status
      : "",
  );

  useEffect(() => {
    (async () => {
      if (!user) {
        realm?.close();
        setRealm(null);
        return;
      }

      if (!organization) {
        realm?.close();
        setRealm(null);
        return;
      }

      try {
        const result = await Realm.open({
          schema: [
            clientSchema,
            client_serviceHistorySchema,
            client_serviceHistory_servicesSchema,
            locationSchema,
            location_citiesSchema,
            location_cities_categoriesSchema,
            location_cities_categories_locationsSchema,
            serviceSchema,
            service_categoriesSchema,
            service_categories_servicesSchema,
            dailylistSchema,
            dailylist_contactsSchema,
            dailylist_contacts_servicesSchema,
            noteSchema,
          ],
          sync: {
            user: user,
            partitionValue: organization,
          },
        });
        setRealm(result);
        return () => {
          result.close();
          setRealm(null);
        };
      } catch (error) {
        Alert.alert("Error opening Realm", String(error));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const logIn = async (email: string, password: string) => {
    try {
      const realmUser = await app.logIn(
        Realm.Credentials.emailPassword(email, password),
      );

      if (!app.currentUser?.customData) await createUserDatum(realmUser, email);

      setUser(realmUser);
    } catch (error) {
      throw error;
    }
  };

  const createUserDatum = async (realmUser: Realm.User, email: string) => {
    try {
      const tempRealm = await Realm.open({
        schema: [userdatumSchema],
        sync: {user: realmUser, partitionValue: ""},
      });

      const userDatum: UserCustomData = {
        _id: realmUser.id,
        email,
        organization: "",
        role: "",
        status: "",
      };

      tempRealm.write(() => {
        tempRealm.create("userdatum", userDatum);
      });

      setUserEmail(email);
      setOrganization("");
      setRole("");
      setStatus("");

      tempRealm.close();
    } catch (error) {
      throw error;
    }
  };

  const logOut = async () => {
    await app.currentUser?.logOut();
    setUser(null);
  };

  const registerUser = async (email: string, password: string) => {
    try {
      await app.emailPasswordAuth.registerUser({email, password});
    } catch (error) {
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      await app.emailPasswordAuth.resendConfirmationEmail({email});
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        registerUser,
        logOut,
        resendConfirmation,
        isAuthenticated: user !== null,
        user,
        userEmail,
        organization,
        role,
        status,
        realm,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
