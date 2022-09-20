import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {AuthContext} from "../Authentication/AuthProvider";

dayjs.extend(utc);

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

type ClientContextType = {
  clients: Client[] | null;
  createClient: (
    lastName: string,
    firstName: string,
    DOB?: dayjs.Dayjs,
    alias?: string,
    hmisID?: string,
  ) => Client;
  pushContactToClient: (clientId: ObjectId, contact: ClientContact) => void;
  getClientsWithContactOnDate: (date: dayjs.Dayjs) => Client[];
};
export const ClientContext = React.createContext<ClientContextType | null>(
  null,
);

const ClientProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);

  const [clientsCollection, setClientsCollection] =
    useState<Realm.Collection<Realm.Object> | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);

  useEffect(() => {
    if (!authContext?.realm) return;

    try {
      const collection = authContext.realm.objects("client").sorted([
        ["lastName", false],
        ["firstName", false],
        ["alias", false],
      ]);

      if (!collection)
        return Alert.alert("", "Unable to connect to clients collection");

      collection.addListener(coll => {
        const collClone: Client[] = JSON.parse(JSON.stringify(coll));

        collClone.forEach((client: Client, index: number) => {
          collClone[index]._id = new ObjectId(client._id);
        });

        setClients(collClone);
      });

      setClientsCollection(collection);
      return () => collection.removeAllListeners();
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [authContext?.realm]);

  const createClient = (
    lastName: string,
    firstName: string,
    DOB?: dayjs.Dayjs,
    alias?: string,
    hmisID?: string,
  ): Client => {
    if (!lastName) throw "last name required";
    if (!firstName) throw "first name required";

    if (!authContext?.realm) throw "unable to connect to realm";

    let properties: object = {
      organization: authContext.organization,
      _id: new ObjectId(),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
    };

    if (DOB)
      properties = {
        ...properties,
        DOB: DOB.local().format("YYYY-MM-DD"),
      };
    if (alias) properties = {...properties, alias: alias.trim()};
    if (hmisID) properties = {...properties, hmisID: hmisID.trim()};

    try {
      let clientObject: Realm.Object | undefined;
      authContext.realm.write(() => {
        clientObject = authContext.realm?.create("client", properties);
      });

      if (clientObject) return clientObject as unknown as Client;
      else throw "Unable to create client";
    } catch (error) {
      throw error;
    }
  };

  const pushContactToClient = (clientId: ObjectId, contact: ClientContact) => {
    if (!authContext?.realm) throw "Unable to connect to Realm";

    try {
      authContext.realm.write(() => {
        const results = clientsCollection?.filtered(
          `_id == oid(${clientId.toString()})`,
        );

        if (!results || results.length === 0)
          throw "Unable to connect to clients collection";
        const client = results[0] as unknown as Client;

        if (client.serviceHistory) client.serviceHistory.push(contact);
        else client.serviceHistory = [contact];
      });
    } catch (error) {
      throw error;
    }
  };

  const getClientsWithContactOnDate = (date: dayjs.Dayjs): Client[] => {
    if (!authContext?.realm) throw "Unable to connect to Realm";

    const dateString = date.local().format("YYYY-MM-DD");

    try {
      let results = clientsCollection?.filtered(
        `ANY serviceHistory.date == '${dateString}'`,
      );

      if (!results) throw "Unable to query objects of type client";

      return results as unknown as Client[];
    } catch (error) {
      throw error;
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        createClient,
        pushContactToClient,
        getClientsWithContactOnDate,
      }}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientProvider;
