import React, {useContext, useEffect, useState} from "react";
import {Alert, Platform, SafeAreaView, ScrollView, View} from "react-native";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "../Authentication/AuthProvider";
import LLDateInput from "../LLComponents/LLDateInput";
import {Client, ClientService} from "../RealmStateProvider";
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

const ReviewView = () => {
  const tw = useTailwind();

  const auth = useContext(AuthContext);

  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [reviewContacts, setReviewContacts] = useState<ReviewContact[] | null>(
    null,
  );

  useEffect(() => {
    if (!auth?.realm || !date) return setReviewContacts(null);

    const dateString = date.local().format("YYYY-MM-DD");

    const result: ReviewContact[] = [];

    try {
      let collection = auth?.realm
        ?.objects("client")
        .filtered(`ANY serviceHistory.date == '${dateString}'`);

      if (!collection)
        return Alert.alert(
          "Realm Error",
          "Unable to query objects of type client",
        );

      const clients = collection as unknown as Client[];

      for (const client of clients)
        if (client.serviceHistory)
          for (const contact of client.serviceHistory)
            if (contact.date === dateString)
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
  }, [auth?.realm, date]);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={tw("px-6 pb-6")}>
        <View className={Platform.OS === "android" ? "mt-6" : ""}>
          <LLDateInput
            value={date}
            onChange={(value: dayjs.Dayjs) => setDate(value)}
            placeholder="REVIEW DATE"
            dateFormat="MMMM DD, YYYY"
            twStyles="text-center bg-cyan-300 font-bold"
          />
        </View>
        <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2 mt-4">
          {reviewContacts &&
            reviewContacts.map(contact => (
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewView;
