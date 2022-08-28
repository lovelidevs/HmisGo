import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {AuthContext} from "./Authentication/AuthProvider";
import {Contact, ServiceDocument} from "./ContactEditor/ContactEditor";
import {LocationDocument} from "./LocationPickers";
import {DailyList} from "./MainView";
import {Client} from "./NewClientView";

dayjs.extend(utc);

type RealmStateType = {
  clients: Client[] | null;
  locations: LocationDocument | null;
  services: ServiceDocument | null;
  dailyListKeys: DailyListKey[] | null;
  dailyListId: ObjectId | null;
  setDailyListId: React.Dispatch<React.SetStateAction<ObjectId | null>>;
  dailyList: DailyList | null;
  updateDailyListNote: (note: string[]) => void;
  updateDailyListContacts: (contacts: Contact[]) => void;
};

type DailyListKey = {
  _id: ObjectId;
  creator: string;
  timestamp: string;
};

export const RealmStateContext = React.createContext<RealmStateType | null>(
  null,
);

const RealmStateProvider = ({children}: {children: ReactNode}) => {
  const auth = useContext(AuthContext);

  const [clients, setClients] = useState<Client[] | null>(null);
  const [locations, setLocations] = useState<LocationDocument | null>(null);
  const [services, setServices] = useState<ServiceDocument | null>(null);

  const [dailyListKeys, setDailyListKeys] = useState<DailyListKey[] | null>(
    null,
  );
  const [dailyListId, setDailyListId] = useState<ObjectId | null>(null);
  const [dailyList, setDailyList] = useState<DailyList | null>(null);

  useEffect(() => {
    if (!auth?.realm) return;

    const listenToCollection = <Type,>(
      objectType: string,
      setStateFn: React.Dispatch<React.SetStateAction<Type | null>>,
      listenerCallback?: (coll: Realm.Collection<Realm.Object>) => void,
      sortDescriptor?: Realm.SortDescriptor[],
    ): Realm.Collection<Realm.Object> | void => {
      try {
        let collection = auth?.realm?.objects(objectType);

        if (!collection)
          return Alert.alert(
            "Realm Error",
            `Unable to query objects of type ${objectType}`,
          );

        if (sortDescriptor) collection = collection.sorted(sortDescriptor);

        collection.addListener(
          listenerCallback
            ? listenerCallback
            : coll => {
                const collClone = JSON.parse(JSON.stringify(coll));
                setStateFn(collClone[0]);
              },
        );

        return collection;
      } catch (error) {
        Alert.alert("", String(error));
      }
    };

    const locationsCollection = listenToCollection("location", setLocations);

    const servicesCollection = listenToCollection("service", setServices);

    const clientsCollection = listenToCollection(
      "client",
      setClients,
      (coll: Realm.Collection<Realm.Object>) => {
        const collClone: Client[] = JSON.parse(JSON.stringify(coll));

        collClone.forEach((client: Client, index: number) => {
          collClone[index]._id = new ObjectId(client._id);
        });

        setClients(collClone);
      },
      [
        ["lastName", false],
        ["firstName", false],
        ["alias", false],
      ],
    );

    const dailyListCollection = listenToCollection(
      "dailylist",
      setDailyListKeys,
      (coll: Realm.Collection<Realm.Object>) => {
        const collClone = JSON.parse(JSON.stringify(coll));

        let result: DailyListKey[] = [];
        for (const list of collClone as DailyList[])
          result.push({
            _id: new ObjectId(list._id),
            creator: list.creator,
            timestamp: dayjs.utc(list.timestamp).toISOString(),
          });

        setDailyListKeys(result);
      },
      [["timestamp", true]],
    );

    return () => {
      if (clientsCollection) clientsCollection.removeAllListeners();
      if (locationsCollection) locationsCollection.removeAllListeners();
      if (servicesCollection) servicesCollection.removeAllListeners();
      if (dailyListCollection) dailyListCollection.removeAllListeners();
    };
  }, [auth?.realm]);

  useEffect(() => {
    if (!auth?.realm) return;

    if (!dailyListId) return setDailyList(null);

    try {
      const result = auth.realm
        .objects("dailylist")
        .filtered(`_id == oid(${dailyListId.toString()})`);

      if (!result || result.length === 0)
        return Alert.alert("Realm Error", "Unable to find daily list");

      const object = result[0];

      object.addListener(obj => {
        const objectClone: DailyList = JSON.parse(JSON.stringify(obj));
        objectClone._id = new ObjectId(objectClone._id);

        objectClone.contacts?.forEach((contact: Contact, index: number) => {
          if (objectClone.contacts)
            objectClone.contacts[index].clientId = new ObjectId(
              contact.clientId,
            );
        });

        console.log("UPDATE");
        setDailyList(objectClone);
      });

      return () => {
        object.removeAllListeners();
      };
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [auth?.realm, dailyListId]);

  const updateDailyListNote = (note: string[]) => {
    try {
      auth?.realm?.write(() => {
        const result = auth.realm
          ?.objects("dailylist")
          .filtered(`_id == oid(${dailyListId?.toString()})`);

        if (!result || result.length === 0)
          return Alert.alert("Realm Error", "Unable to find daily list");

        const object = result[0] as unknown as DailyList;

        object.note = note;
      });
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

  const updateDailyListContacts = (contacts: Contact[]) => {
    try {
      auth?.realm?.write(() => {
        const result = auth.realm
          ?.objects("dailylist")
          .filtered(`_id == oid(${dailyListId?.toString()})`);

        if (!result || result.length === 0)
          return Alert.alert("Realm Error", "Unable to find daily list");

        const object = result[0] as unknown as DailyList;

        object.contacts = contacts;
      });
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

  /*
  const updateDailyList = (list: DailyList) => {
    try {
      auth?.realm?.write(() => {
        auth.realm?.create("dailylist", list, Realm.UpdateMode.Modified);
      });
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };
  */

  return (
    <RealmStateContext.Provider
      value={{
        clients,
        locations,
        services,
        dailyListKeys,
        dailyListId,
        setDailyListId,
        dailyList,
        updateDailyListNote,
        updateDailyListContacts,
      }}>
      {children}
    </RealmStateContext.Provider>
  );
};

export default RealmStateProvider;
