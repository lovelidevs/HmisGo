import React from "react";
import {Text, View} from "react-native";

import {ReviewContact} from "./ReviewView";

// TODO: Merge these methods with the methods in ClientLI

const reviewContactToIdInfo = (contact: ReviewContact): string => {
  const stringArray = [contact.lastName, contact.firstName];

  if (contact.alias) stringArray.push("(" + contact.alias + ")");
  if (contact.hmisID) stringArray.push(contact.hmisID);

  return stringArray.join(" ");
};

const reviewContactToTimeAtLocation = (contact: ReviewContact): string => {
  const stringArray = [];

  if (contact.timestamp)
    stringArray.push(contact.timestamp.local().format("h:mm A"));
  if (contact.location) stringArray.push(contact.location);

  return stringArray.join(" @ ");
};

const reviewContactToServices = (contact: ReviewContact): string => {
  const stringArray = [];

  if (!contact.services) return "";

  for (const service of contact.services) {
    let text = service.service;

    if (
      service.text ||
      service.count ||
      (service.list && service.list.length > 0)
    )
      text +=
        " (" +
        ((): string => {
          if (service.text) return service.text;
          if (service.count) return service.count + " " + service.units;
          if (service.list) return service.list.join(", ");
          return "";
        })() +
        ")";

    stringArray.push(text);
  }

  return stringArray.join(", ");
};

const ReviewContactLI = ({contact}: {contact: ReviewContact}) => {
  const twBaseTextStyle = "text-gray-800 text-base";
  const twIndentedTextStyle = twBaseTextStyle + " ml-4";

  return (
    <View className="flex flex-col flex-nowrap justify-start items-start">
      <Text className={twBaseTextStyle + " font-bold"}>
        {reviewContactToIdInfo(contact)}
      </Text>
      {(contact.timestamp || contact.location) && (
        <Text className={twIndentedTextStyle}>
          {reviewContactToTimeAtLocation(contact)}
        </Text>
      )}
      {contact.services && contact.services.length > 0 && (
        <Text className={twIndentedTextStyle}>
          {reviewContactToServices(contact)}
        </Text>
      )}
    </View>
  );
};

export default ReviewContactLI;
