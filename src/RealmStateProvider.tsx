import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import {ServiceDocument} from "./ContactEditor/ContactEditor";
import {LocationDocument} from "./LocationPickers";
import {DailyList} from "./MainView";
import {Client} from "./NewClientView";

type RealmStateType = {
  clients: Client[] | null;
  locations: LocationDocument | null;
  services: ServiceDocument | null;
  dailyList: DailyList | null;
  setDailyList: React.Dispatch<React.SetStateAction<DailyList | null>>;
};

export const RealmStateContext = React.createContext<RealmStateType | null>(
  null,
);

const RealmStateProvider = ({children}: {children: ReactNode}) => {
  const auth = useContext(AuthContext);

  const [clients, setClients] = useState<Client[] | null>(null);
  const [locations, setLocations] = useState<LocationDocument | null>(null);
  const [services, setServices] = useState<ServiceDocument | null>(null);

  const [dailyList, setDailyList] = useState<DailyList | null>(null);

  useEffect(() => {
    if (!auth?.realm) return;

    const listenToCollection = <Type,>(
      objectType: string,
      isSingleDocument: boolean,
      setStateFn: React.Dispatch<React.SetStateAction<Type | null>>,
      sortDescriptor?: Realm.SortDescriptor[],
    ): Realm.Collection<Realm.Object> | void => {
      try {
        let collection = auth?.realm?.objects(objectType);

        if (!collection)
          return console.log(
            `Realm Error: Unable to query objects of type ${objectType}`,
          );

        if (sortDescriptor) collection = collection.sorted(sortDescriptor);

        collection.addListener(coll => {
          const collClone = JSON.parse(JSON.stringify(coll));
          if (isSingleDocument) setStateFn(collClone[0]);
          else setStateFn(collClone);
        });

        return collection;
      } catch (error) {
        Alert.alert("", String(error));
      }
    };

    const clientsCollection = listenToCollection("client", false, setClients, [
      ["lastName", false],
      ["firstName", false],
      ["alias", false],
    ]);

    const locationsCollection = listenToCollection(
      "location",
      true,
      setLocations,
    );

    const servicesCollection = listenToCollection("service", true, setServices);

    return () => {
      if (clientsCollection) clientsCollection.removeAllListeners();
      if (locationsCollection) locationsCollection.removeAllListeners();
      if (servicesCollection) servicesCollection.removeAllListeners();
    };
  }, [auth?.realm]);

  return (
    <RealmStateContext.Provider
      value={{clients, locations, services, dailyList, setDailyList}}>
      {children}
    </RealmStateContext.Provider>
  );
};

export default RealmStateProvider;
