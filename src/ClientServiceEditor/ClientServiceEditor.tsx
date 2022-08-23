import React from "react";
import {ScrollView, Text, View} from "react-native";

import {ObjectId} from "bson";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";

import LocationPickers, {LocationDocument} from "../LocationPickers";
import {Contact} from "../MainView";

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

// TODO: Clicking the CHECK button in the header submits it, or maybe on dismount? Will have to make sure it doesn't hurt to override the same data

const ClientServiceEditor = ({
  contact,
  onChange,
  services,
  locations,
}: {
  contact: Contact;
  onChange: (contactClone: Contact) => void;
  services: ServiceDocument;
  locations: LocationDocument;
}) => {
  return (
    <SafeAreaView>
      <ScrollView>
        <LocationPickers
          value={{
            city: contact.city,
            locationCategory: contact.locationCategory,
            location: contact.location,
          }}
          onChange={value => {
            const contactClone = cloneDeep(contact);
            contactClone.city = value.city;
            contactClone.locationCategory = value.locationCategory;
            contactClone.location = value.location;
            onChange(contactClone);
          }}
          locations={locations}
        />
        <View>
          {services.categories?.map(category => (
            <Text key={category.uuid}>{category.category}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientServiceEditor;
