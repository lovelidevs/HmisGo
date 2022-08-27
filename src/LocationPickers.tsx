import React from "react";
import {View} from "react-native";

import {Picker} from "@react-native-picker/picker";
import {ObjectId} from "bson";
import {useTailwind} from "tailwindcss-react-native";

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

type LocationStrings = {
  city: string;
  locationCategory: string;
  location: string;
};

export const locationsArrayFromLocationDocument = (
  document: LocationDocument,
): string[] => {
  if (!document.cities) return [];

  const result: string[] = [];

  for (const city of document.cities)
    if (city.categories)
      for (const category of city.categories)
        if (category.locations)
          for (const location of category.locations) {
            result.push(location.location);

            if (location.places)
              for (const place of location.places)
                result.push(location.location + ": " + place);
          }

  return result.sort((a, b) =>
    a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
  );
};

const LocationPickers = ({
  value,
  onChange,
  locations,
}: {
  value: LocationStrings;
  onChange: (value: LocationStrings) => void;
  locations: LocationDocument;
}) => {
  const tw = useTailwind();
  const viewStyle = tw("rounded-lg border overflow-hidden");
  const pickerStyle = tw("text-black bg-white");

  return (
    <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-4">
      <View style={viewStyle}>
        <Picker
          selectedValue={value.city}
          onValueChange={itemValue =>
            onChange({city: itemValue, locationCategory: "", location: ""})
          }
          dropdownIconColor="black"
          style={pickerStyle}>
          <Picker.Item
            key=""
            label={value.city ? "" : "SELECT CITY"}
            value={""}
          />
          {locations.cities?.map(cityObject => (
            <Picker.Item
              key={cityObject.uuid}
              label={cityObject.city}
              value={cityObject.uuid}
            />
          ))}
        </Picker>
      </View>
      <View style={viewStyle}>
        <Picker
          selectedValue={value.locationCategory}
          onValueChange={itemValue =>
            onChange({
              city: value.city,
              locationCategory: itemValue,
              location: "",
            })
          }
          dropdownIconColor="black"
          style={pickerStyle}>
          <Picker.Item
            key=""
            label={value.locationCategory ? "" : "SELECT LOCATION CATEGORY"}
            value={""}
          />
          {(() => {
            const tempCity = locations.cities?.find(
              cityObject => cityObject.uuid === value.city,
            );
            if (!tempCity) return;

            return tempCity.categories?.map(categoryObject => (
              <Picker.Item
                key={categoryObject.uuid}
                label={categoryObject.category}
                value={categoryObject.uuid}
              />
            ));
          })()}
        </Picker>
      </View>
      <View style={viewStyle}>
        <Picker
          selectedValue={value.location}
          onValueChange={itemValue =>
            onChange({
              city: value.city,
              locationCategory: value.locationCategory,
              location: itemValue,
            })
          }
          dropdownIconColor="black"
          style={pickerStyle}>
          <Picker.Item
            key=""
            label={value.location ? "" : "SELECT LOCATION"}
            value={""}
          />
          {(() => {
            const tempCity = locations.cities?.find(
              cityObject => cityObject.uuid === value.city,
            );
            if (!tempCity) return;

            const tempCategories = tempCity.categories?.find(
              categoryObject => categoryObject.uuid === value.locationCategory,
            );
            if (!tempCategories) return;

            return tempCategories.locations?.map(locationObject => {
              const items = [
                <Picker.Item
                  key={locationObject.uuid}
                  label={locationObject.location}
                  value={locationObject.location}
                />,
              ];

              if (!locationObject.places) return items;

              for (const place of locationObject.places)
                items.push(
                  <Picker.Item
                    key={locationObject.uuid + place}
                    label={locationObject.location + ": " + place}
                    value={locationObject.location + ": " + place}
                  />,
                );

              return items;
            });
          })()}
        </Picker>
      </View>
    </View>
  );
};

export default LocationPickers;
