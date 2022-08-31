import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {AuthContext} from "./Authentication/AuthProvider";

dayjs.extend(utc);

type RealmStateType = {
  clients: Client[] | null;
  locations: LocationDocument | null;
  services: ServiceDocument | null;
  dailyListKeys: DailyListKey[] | null;
  dailyListId: ObjectId | null;
  setDailyListId: React.Dispatch<React.SetStateAction<ObjectId | null>>;
  dailyList: DailyList | null;
  getDailyListRealmObject: () => void | Realm.Object;
  updateDailyListNote: (note: string[]) => void;
  updateDailyListContacts: (contacts: Contact[]) => void;
};

export type Client = {
  _id: ObjectId;
  organization: string;
  lastName: string;
  firstName: string;
  DOB?: string;
  alias?: string;
  hmisID?: string;
  serviceHistory?: ClientContact[];
};

export type ClientContact = {
  date: string;
  time?: string;
  city?: string;
  locationCategory?: string;
  location?: string;
  services?: ClientService[];
};

export type ClientService = {
  service: string;
  text?: string;
  count?: number;
  units?: string;
  list?: string[];
};

export type LocationDocument = {
  _id: ObjectId;
  organization: string;
  cities?: City[];
};

type City = {
  uuid: string;
  city: string;
  categories?: LocationCategory[];
};

type LocationCategory = {
  uuid: string;
  category: string;
  locations?: Location[];
};

type Location = {
  uuid: string;
  location: string;
  places?: string[];
};

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

type DailyListKey = {
  _id: ObjectId;
  creator: string;
  timestamp: string;
};

export type DailyList = {
  _id: ObjectId;
  organization: string;
  creator: string;
  timestamp: string;
  note: string[] | null;
  contacts: Contact[] | null;
};

export type Contact = {
  clientId: ObjectId;
  timestamp: string;
  cityUUID: string;
  locationCategoryUUID: string;
  location: string;
  services: ContactService[];
};

export type ContactService = {
  uuid: string;
  service: string;
  text?: string;
  count?: number;
  units?: string;
  list?: string[];
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

  const getDailyListRealmObject = useCallback(() => {
    const result = auth?.realm
      ?.objects("dailylist")
      .filtered(`_id == oid(${dailyListId?.toString()})`);

    if (!result || result.length === 0)
      return Alert.alert("Realm Error", "Unable to find daily list");
    return result[0];
  }, [auth?.realm, dailyListId]);

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
      const dailyListObject = getDailyListRealmObject();

      dailyListObject?.addListener(object => {
        const objectClone: DailyList = JSON.parse(JSON.stringify(object));
        objectClone._id = new ObjectId(objectClone._id);

        objectClone.contacts?.forEach((contact: Contact, index: number) => {
          if (objectClone.contacts)
            objectClone.contacts[index].clientId = new ObjectId(
              contact.clientId,
            );
        });

        setDailyList(objectClone);
      });

      return () => {
        dailyListObject?.removeAllListeners();
      };
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [auth?.realm, dailyListId, getDailyListRealmObject]);

  const updateDailyListNote = (note: string[]) => {
    try {
      auth?.realm?.write(() => {
        const dailyListObject =
          getDailyListRealmObject() as unknown as DailyList;
        dailyListObject.note = note;
      });
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

  const updateDailyListContacts = (contacts: Contact[]) => {
    try {
      auth?.realm?.write(() => {
        const dailyListObject =
          getDailyListRealmObject() as unknown as DailyList;
        dailyListObject.contacts = contacts;
      });
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

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
        getDailyListRealmObject,
        updateDailyListNote,
        updateDailyListContacts,
      }}>
      {children}
    </RealmStateContext.Provider>
  );
};

export default RealmStateProvider;
