import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {AuthContext} from "../Authentication/AuthProvider";
import {ClientContact, ClientContext, ClientService} from "./ClientProvider";
import {LocationContext} from "./LocationProvider";

dayjs.extend(utc);

export type DailyListKey = {
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

type DailyListContextType = {
  dailyListKeys: DailyListKey[] | null;
  dailyListId: ObjectId | null;
  setDailyListId: React.Dispatch<React.SetStateAction<ObjectId | null>>;
  dailyList: DailyList | null;
  createDailyList: () => ObjectId;
  updateDailyListNote: (note: string[]) => void;
  updateDailyListContacts: (contacts: Contact[]) => void;
  submitDailyList: () => void;
};

export const DailyListContext =
  React.createContext<DailyListContextType | null>(null);

const DailyListProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);
  const locationContext = useContext(LocationContext);
  const clientContext = useContext(ClientContext);

  // TODO: get rid of getDailyListRealmObject and replace with submitDailyList

  const [dailyListKeys, setDailyListKeys] = useState<DailyListKey[] | null>(
    null,
  );
  const [dailyListId, setDailyListId] = useState<ObjectId | null>(null);
  const [dailyListRealmObject, setDailyListRealmObject] =
    useState<Realm.Object | null>(null);
  const [dailyList, setDailyList] = useState<DailyList | null>(null);

  useEffect(() => {
    if (!authContext?.realm) return;

    try {
      const collection = authContext.realm.objects("dailylist");

      if (!collection)
        return Alert.alert("", "Unable to connect to dailylists collection");

      collection.addListener((coll, changes) => {
        changes.deletions.forEach(index => {
          if (
            dailyListKeys &&
            dailyListKeys[index]._id.toString() === dailyListId?.toString()
          )
            setDailyListId(null);
        });

        const collClone = JSON.parse(JSON.stringify(coll));

        let keys: DailyListKey[] = [];
        for (const list of collClone as DailyList[])
          keys.push({
            _id: new ObjectId(list._id),
            creator: list.creator,
            timestamp: dayjs.utc(list.timestamp).toISOString(),
          });

        setDailyListKeys(keys);
      });

      return () => collection.removeAllListeners();
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [authContext?.realm, dailyListId, dailyListKeys]);

  useEffect(() => {
    if (!dailyListId) {
      setDailyListRealmObject(null);
      setDailyList(null);
      return;
    }

    if (!authContext?.realm) return;

    try {
      const result = authContext?.realm
        ?.objects("dailylist")
        .filtered(`_id == oid(${dailyListId?.toString()})`);

      if (!result || result.length === 0)
        return Alert.alert("Realm Error", "Unable to find daily list");

      const realmObject = result[0];
      setDailyListRealmObject(realmObject);

      realmObject.addListener(object => {
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

      return () => realmObject.removeAllListeners();
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [dailyListId, authContext?.realm]);

  const createDailyList = (): ObjectId => {
    if (!authContext?.realm) throw "Unable to connect to Realm";

    const newDailyList: DailyList = {
      _id: new ObjectId(),
      organization: authContext.organization ? authContext.organization : "",
      creator: authContext.userEmail ? authContext.userEmail.split("@")[0] : "",
      timestamp: dayjs.utc().toISOString(),
      note: [],
      contacts: [],
    };

    try {
      authContext.realm.write(() => {
        authContext.realm?.create("dailylist", newDailyList);
      });

      return newDailyList._id;
    } catch (error) {
      throw error;
    }
  };

  const updateDailyListNote = (note: string[]) => {
    if (!dailyListRealmObject)
      return Alert.alert("Update Error", "Unable to update note");

    try {
      authContext?.realm?.write(
        () => ((dailyListRealmObject as unknown as DailyList).note = note),
      );
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

  const updateDailyListContacts = (contacts: Contact[]) => {
    if (!dailyListRealmObject)
      return Alert.alert("Update Error", "Unable to update contacts");

    try {
      authContext?.realm?.write(
        () =>
          ((dailyListRealmObject as unknown as DailyList).contacts = contacts),
      );
    } catch (error) {
      Alert.alert("Update Error", String(error));
    }
  };

  const clientServicesFromContactServices = (
    contactServices: ContactService[],
  ): ClientService[] | undefined => {
    if (contactServices.length === 0) return undefined;

    const clientServices: ClientService[] = [];
    for (const service of contactServices)
      clientServices.push({
        service: service.service,
        text: service.text ? service.text : undefined,
        count: service.count ? service.count : undefined,
        units: service.units ? service.units : undefined,
        list: service.list ? service.list : undefined,
      });
    return clientServices;
  };

  const clientContactFromContact = (contact: Contact): ClientContact => {
    return {
      date: dayjs(contact.timestamp).format("YYYY-MM-DD"),
      time: contact.timestamp,
      city: locationContext?.cityFromUUID(contact.cityUUID),
      locationCategory: locationContext?.locationCategoryFromUUIDs(
        contact.cityUUID,
        contact.locationCategoryUUID,
      ),
      location: contact.location ? contact.location : undefined,
      services: clientServicesFromContactServices(contact.services),
    };
  };

  const submitDailyList = () => {
    if (!dailyList) throw "Unable to connect to daily list";
    if (!authContext?.realm) throw "Unable to connect to Realm";
    if (!clientContext) throw "No client context";

    if (dailyList.note && dailyList.note.length > 0)
      try {
        authContext.realm.write(() => {
          authContext.realm?.create("note", {
            _id: new ObjectId(),
            organization: authContext.organization,
            datetime: dayjs.utc().toISOString(),
            content: dailyList.note,
          });
        });
      } catch (error) {
        throw error;
      }

    if (dailyList.contacts && dailyList.contacts.length > 0)
      try {
        for (const contact of dailyList.contacts)
          clientContext.pushContactToClient(
            contact.clientId,
            clientContactFromContact(contact),
          );
      } catch (error) {
        throw error;
      }

    try {
      authContext.realm.write(() => {
        authContext.realm?.delete(dailyListRealmObject);
      });

      setDailyListId(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <DailyListContext.Provider
      value={{
        dailyListKeys,
        dailyListId,
        setDailyListId,
        dailyList,
        createDailyList,
        updateDailyListNote,
        updateDailyListContacts,
        submitDailyList,
      }}>
      {children}
    </DailyListContext.Provider>
  );
};
export default DailyListProvider;
