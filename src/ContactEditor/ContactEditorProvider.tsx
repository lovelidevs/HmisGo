import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";

import {Contact, DailyListContext} from "../Realm/DailyListProvider";

type ContactEditorContextType = {
  contact: Contact | null;
  setContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  setContactClientId: React.Dispatch<React.SetStateAction<ObjectId | null>>;
};

export const ContactEditorContext =
  React.createContext<ContactEditorContextType | null>(null);

const ContactEditorProvider = ({children}: {children: ReactNode}) => {
  const dailyListContext = useContext(DailyListContext);

  const [contact, setContact] = useState<Contact | null>(null);
  const [contactClientId, setContactClientId] = useState<ObjectId | null>(null);

  useEffect(() => {
    if (contact?.clientId.toString() === contactClientId?.toString()) return;
    if (!dailyListContext?.dailyList) return;

    const result = dailyListContext.dailyList.contacts?.find(
      con => con.clientId.toString() === contactClientId?.toString(),
    );

    if (!result) return Alert.alert("", "Unable to load contact");

    setContact(result);
  }, [contact, contactClientId, dailyListContext?.dailyList]);

  return (
    <ContactEditorContext.Provider
      value={{contact, setContact, setContactClientId}}>
      {children}
    </ContactEditorContext.Provider>
  );
};

export default ContactEditorProvider;
