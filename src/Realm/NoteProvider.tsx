import {ReactNode, useContext} from "react";
import React from "react";

import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {AuthContext} from "../Authentication/AuthProvider";

dayjs.extend(utc);

export type Note = {
  _id: ObjectId;
  organization: string;
  datetime: string;
  content: string[];
};

type NoteContextType = {
  getNotesOnDate: (date: dayjs.Dayjs) => Note[];
};

export const NoteContext = React.createContext<NoteContextType | null>(null);

const NoteProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);

  const getNotesOnDate = (date: dayjs.Dayjs): Note[] => {
    if (!authContext?.realm) throw "Unable to connect to Realm";

    const startOfDate = date
      .utc()
      .startOf("date")
      .format("YYYY-MM-DD@HH:mm:ss");
    const endOfDate = date.utc().endOf("date").format("YYYY-MM-DD@HH:mm:ss");

    try {
      const notes = authContext.realm
        .objects("note")
        .sorted([["datetime", true]])
        .filtered(`datetime >= ${startOfDate} AND datetime <= ${endOfDate}`);

      return notes as unknown as Note[];
    } catch (error) {
      throw error;
    }
  };

  return (
    <NoteContext.Provider value={{getNotesOnDate}}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteProvider;
