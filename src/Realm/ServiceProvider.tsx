import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";

import {AuthContext} from "../Authentication/AuthProvider";

export type ServiceDocument = {
  _id: ObjectId;
  organization: string;
  categories: ServiceCategory[] | null;
};

export type ServiceCategory = {
  uuid: string;
  category: string;
  services: Service[] | null;
};

export type Service = {
  uuid: string;
  service: string;
  inputType: string;
  units: string | null;
  customList: string[] | null;
};

type ServiceContextType = {
  services: ServiceDocument | null;
};

export const ServiceContext = React.createContext<ServiceContextType | null>(
  null,
);

const ServiceProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);

  const [services, setServices] = useState<ServiceDocument | null>(null);

  useEffect(() => {
    if (!authContext?.realm) return;

    try {
      const collection = authContext.realm.objects("service");

      if (!collection)
        return Alert.alert("", "Unable to connect to services collection");

      collection.addListener(coll => {
        const collClone = JSON.parse(JSON.stringify(coll));
        setServices(collClone[0]);
      });

      return () => collection.removeAllListeners();
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [authContext?.realm]);

  return (
    <ServiceContext.Provider value={{services}}>
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceProvider;
