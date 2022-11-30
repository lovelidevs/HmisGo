import React, {ReactNode, useCallback, useEffect, useState} from "react";
import {Alert} from "react-native";

import Realm from "realm";

const clientSchema = {
  name: "client",
  properties: {
    _id: "objectId",
    DOB: "string?",
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
    status: "string?",
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
  refreshUserData: () => Promise<void>;
  requestAccess: (organization: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  user: Realm.User | null;
  userData: UserCustomData | null;
  realm: Realm | null;
};

// TODO: Make userCustomData an object in the context instead of splitting them all up

export const AuthContext = React.createContext<AuthContextType | null>(null);

const APP_ID: string = "hmis-go-atzkx";

const AuthProvider = ({children}: {children: ReactNode}) => {
  const app = new Realm.App(APP_ID);

  const [user, setUser] = useState<Realm.User | null>(app.currentUser);

  const [userData, setUserData] = useState<UserCustomData | null>(
    app.currentUser?.customData
      ? (app.currentUser.customData as UserCustomData)
      : null,
  );

  const [realm, setRealm] = useState<Realm | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return setRealm(null);
      if (!userData?.organization) return setRealm(null);

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
            partitionValue: userData.organization,
          },
        });
        setRealm(result);
        return () => {
          result.close();
          setRealm(null);
        };
      } catch (error) {
        if (
          (error as object).hasOwnProperty("message") &&
          (error as object).hasOwnProperty("errorCode")
        ) {
          const errorCopy = error as {message: string; errorCode: number};
          Alert.alert("Error opening Realm", errorCopy.message);
        } else Alert.alert("Error opening Realm", String(error));
      }
    })();
  }, [user, userData?.organization]);

  const refreshUserData = useCallback(async () => {
    if (!user) return setUserData(null);

    await user.refreshCustomData();

    setUserData(user.customData as UserCustomData);
  }, [user]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const logIn = async (email: string, password: string) => {
    const emailToLowerCase = email.toLowerCase();

    try {
      await app.logIn(
        Realm.Credentials.emailPassword(emailToLowerCase, password),
      );

      if (!app.currentUser) throw "No current user";

      if (!app.currentUser.customData) {
        // TODO: Switch the control panel to use insertUserDatum as well
        const result = await app.currentUser.functions.insertUserDatum([
          emailToLowerCase,
        ]);
        if (!result.insertedId) throw result;

        setUserData({
          _id: app.currentUser.id,
          email: emailToLowerCase,
          organization: "",
          role: "",
          status: "",
        });
      }

      setUser(app.currentUser);
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

  const requestAccess = async (organization: string) => {
    if (!user) throw "user is null";

    try {
      // TODO: Switch control panel to use requestAccess
      const result = await user.functions.requestAccess([organization]);
      if (!result.matchedCount) throw result;
      if (result.matchedCount === 0) throw "Unable to find user data";
    } catch (error) {
      throw error;
    }

    refreshUserData();
  };

  const resetPassword = async (email: string) => {
    try {
      await app.emailPasswordAuth.sendResetPasswordEmail({email});
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
        refreshUserData,
        requestAccess,
        resetPassword,
        isAuthenticated: user !== null,
        user,
        userData,
        realm,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
