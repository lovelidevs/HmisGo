import React, {useContext, useEffect, useState} from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {useTailwind} from "tailwindcss-react-native";

import LLDateInput from "../LLComponents/LLDateInput";
import LLHeaderButton from "../LLComponents/LLHeaderButton";
import {RootStackParamList} from "../NavigationStack";
import {ClientContext, ClientService} from "../Realm/ClientProvider";
import {Note, NoteContext} from "../Realm/NoteProvider";
import {TW_CYAN_300, TW_GRAY_800} from "../Theme";
import ReviewContactLI from "./ReviewContactLI";

dayjs.extend(utc);

export type ReviewContact = {
  lastName: string;
  firstName: string;
  alias?: string;
  hmisID?: string;
  timestamp?: dayjs.Dayjs;
  location?: string;
  services?: ClientService[];
};

const ReviewView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Review">) => {
  const tw = useTailwind();

  const clientContext = useContext(ClientContext);
  const noteContext = useContext(NoteContext);

  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Note[] | null>(null);
  const [reviewContacts, setReviewContacts] = useState<ReviewContact[] | null>(
    null,
  );

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: TW_GRAY_800},
      headerTintColor: TW_CYAN_300,
      headerTitleAlign: "center",
      headerRight: () => (
        <LLHeaderButton title="✓" onPress={() => navigation.goBack()} />
      ),
    });
  });

  useEffect(() => {
    if (!date) return setReviewNotes(null);
    if (!noteContext)
      return Alert.alert("", "Unable to connect to notes collection");

    try {
      setReviewNotes(noteContext.getNotesOnDate(date));
    } catch (error) {
      return Alert.alert("", String(error));
    }
  }, [date, noteContext]);

  useEffect(() => {
    if (!date) return setReviewContacts(null);
    if (!clientContext)
      return Alert.alert("", "Unable to connect to clients collection");

    const result: ReviewContact[] = [];

    try {
      const clients = clientContext.getClientsWithContactOnDate(date);

      for (const client of clients)
        if (client.serviceHistory)
          for (const contact of client.serviceHistory)
            if (contact.date === date.local().format("YYYY-MM-DD"))
              result.push({
                lastName: client.lastName,
                firstName: client.firstName,
                alias: client.alias,
                hmisID: client.hmisID,
                timestamp: dayjs.utc(contact.time),
                location: contact.location,
                services: contact.services,
              });
    } catch (error) {
      Alert.alert("", String(error));
    }

    result.sort((a, b) => {
      if (a.timestamp?.isBefore(b.timestamp)) return -1;
      if (a.timestamp?.isAfter(b.timestamp)) return 1;
      return 0;
    });

    setReviewContacts(result);
  }, [date, clientContext]);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={tw("px-6 pb-6")}>
        <View className={Platform.OS === "android" ? "mt-6" : "mt-4"}>
          <LLDateInput
            value={date}
            onChange={(value: dayjs.Dayjs) => setDate(value)}
            placeholder="REVIEW DATE"
            dateFormat="MMMM DD, YYYY"
            twStyles="text-center text-grey-800 bg-cyan-300 font-bold"
          />
        </View>
        {reviewNotes && reviewNotes.length > 0 ? (
          <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mt-4">
            {reviewNotes.map(note => (
              <View
                key={note._id.toString()}
                className="flex flex-col justify-start items-start">
                <Text className="color-black font-bold text-base">
                  {dayjs(note.datetime).local().format("h:mm A")}
                </Text>
                <Text className="color-black text-base">{note.content}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {reviewContacts && reviewContacts.length > 0 && (
          <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mt-4">
            {reviewContacts.map(contact => (
              <View
                key={
                  contact.lastName +
                  contact.firstName +
                  contact.alias +
                  dayjs(contact.timestamp)
                    .local()
                    .format("hh:mm:ss on YYYY-MM-DD")
                }>
                <ReviewContactLI contact={contact} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewView;
