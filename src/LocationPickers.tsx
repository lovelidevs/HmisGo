import React, {useContext} from "react";
import {View} from "react-native";

import {Picker} from "@react-native-picker/picker";
import {useTailwind} from "tailwindcss-react-native";

import {LocationContext} from "./Realm/LocationProvider";

type LocationStrings = {
  cityUUID: string;
  locationCategoryUUID: string;
  location: string;
};

const LocationPickers = ({
  value,
  onChange,
}: {
  value: LocationStrings;
  onChange: (value: LocationStrings) => void;
}) => {
  const tw = useTailwind();

  const locationContext = useContext(LocationContext);

  const viewStyle = tw("rounded-lg border border-gray-300 overflow-hidden");
  const pickerStyle = tw("text-black bg-white");

  return (
    <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-4">
      <View style={viewStyle}>
        <Picker
          selectedValue={value.cityUUID}
          onValueChange={itemValue =>
            onChange({
              cityUUID: itemValue,
              locationCategoryUUID: "",
              location: "",
            })
          }
          dropdownIconColor="black"
          style={pickerStyle}>
          <Picker.Item
            key=""
            label={value.cityUUID ? "" : "SELECT CITY"}
            value={""}
          />
          {locationContext &&
            locationContext.locations?.cities?.map(cityObject => (
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
          selectedValue={value.locationCategoryUUID}
          onValueChange={itemValue =>
            onChange({
              cityUUID: value.cityUUID,
              locationCategoryUUID: itemValue,
              location: "",
            })
          }
          dropdownIconColor="black"
          style={pickerStyle}>
          <Picker.Item
            key=""
            label={value.locationCategoryUUID ? "" : "SELECT LOCATION CATEGORY"}
            value={""}
          />
          {(() => {
            const tempCity = locationContext?.locations?.cities?.find(
              cityObject => cityObject.uuid === value.cityUUID,
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
              cityUUID: value.cityUUID,
              locationCategoryUUID: value.locationCategoryUUID,
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
            const tempCity = locationContext?.locations?.cities?.find(
              cityObject => cityObject.uuid === value.cityUUID,
            );
            if (!tempCity) return;

            const tempCategories = tempCity.categories?.find(
              categoryObject =>
                categoryObject.uuid === value.locationCategoryUUID,
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
