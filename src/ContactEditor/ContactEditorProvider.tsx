import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import {ObjectId} from "bson";

import {Contact, RealmStateContext} from "../RealmStateProvider";

type ContactEditorContextType = {
  contact: Contact | null;
  setContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  setContactClientId: React.Dispatch<React.SetStateAction<ObjectId | null>>;
};

export const ContactEditorContext =
  React.createContext<ContactEditorContextType | null>(null);

const ContactEditorProvider = ({children}: {children: ReactNode}) => {
  const realmState = useContext(RealmStateContext);

  const [contact, setContact] = useState<Contact | null>(null);
  const [contactClientId, setContactClientId] = useState<ObjectId | null>(null);

  useEffect(() => {
    if (contact?.clientId.toString() === contactClientId?.toString()) return;
    if (!realmState?.dailyList) return;

    const result = realmState.dailyList.contacts?.find(
      con => con.clientId.toString() === contactClientId?.toString(),
    );

    if (!result) return Alert.alert("", "Unable to load contact");

    setContact(result);
  }, [contact, contactClientId, realmState?.dailyList]);

  return (
    <ContactEditorContext.Provider
      value={{contact, setContact, setContactClientId}}>
      {children}
    </ContactEditorContext.Provider>
  );
};

export default ContactEditorProvider;
