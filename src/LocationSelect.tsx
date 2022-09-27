import React, {useContext, useEffect, useState} from "react";
import {View} from "react-native";

import {Picker} from "@react-native-picker/picker";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import {ContactEditorContext} from "./ContactEditor/ContactEditorProvider";
import LLHeaderButton from "./LLComponents/LLHeaderButton";
import {RootStackParamList} from "./NavigationStack";
import {DailyListContext, LocationStrings} from "./Realm/DailyListProvider";
import {LocationContext} from "./Realm/LocationProvider";
import {TW_CYAN_300, TW_GRAY_800} from "./Theme";

const LocationSelect = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "LocationSelect">) => {
  const {context} = route.params;

  const dailyListContext = useContext(DailyListContext);
  const contactEditorContext = useContext(ContactEditorContext);

  let initialValues: LocationStrings = {
    cityUUID: "",
    locationCategoryUUID: "",
    location: "",
  };

  let callback: ((locationStrings: LocationStrings) => void) | undefined;

  if (context === "DailyList" && dailyListContext) {
    initialValues = dailyListContext.currentLocation;
    callback = dailyListContext.setCurrentLocation;
  }

  if (context === "ContactEditor" && contactEditorContext) {
    initialValues = contactEditorContext.currentLocation;
    callback = contactEditorContext.setCurrentLocation;
  }

  const [cityUUID, setCityUUID] = useState<string>(initialValues.cityUUID);
  const [locationCategoryUUID, setLocationCategoryUUID] = useState<string>(
    initialValues.locationCategoryUUID,
  );
  const [location, setLocation] = useState<string>(initialValues.location);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: TW_GRAY_800},
      headerTintColor: TW_CYAN_300,
      headerTitleAlign: "center",
      headerRight: () => (
        <LLHeaderButton
          title="✓"
          onPress={() => {
            if (callback) callback({cityUUID, locationCategoryUUID, location});
            navigation.goBack();
          }}
        />
      ),
    });
  });

  const tw = useTailwind();

  const locationContext = useContext(LocationContext);

  const pickerStyle = tw(
    "rounded-lg border border-gray-300 overflow-hidden p-0 mx-2 mb-2 text-black bg-white max-h-[31%]",
  );

  const itemStyle = tw("text-base");

  return (
    <SafeAreaView>
      <View className="flex flex-col flex-nowrap justify-start items-stretch h-full">
        <Picker
          selectedValue={cityUUID}
          onValueChange={itemValue => {
            setCityUUID(itemValue);
            setLocationCategoryUUID("");
            setLocation("");
          }}
          dropdownIconColor="black"
          style={pickerStyle}
          itemStyle={itemStyle}>
          <Picker.Item key="" label={"SELECT CITY"} value={""} />
          {locationContext &&
            locationContext.locations?.cities?.map(city => (
              <Picker.Item
                key={city.uuid}
                label={city.city}
                value={city.uuid}
              />
            ))}
        </Picker>
        <Picker
          selectedValue={locationCategoryUUID}
          onValueChange={itemValue => {
            setLocationCategoryUUID(itemValue);
            setLocation("");
          }}
          dropdownIconColor="black"
          style={pickerStyle}
          itemStyle={itemStyle}>
          <Picker.Item key="" label={"SELECT CATEGORY"} value={""} />
          {(() => {
            const city = locationContext?.cityFromUUID(cityUUID);
            if (!city) return;

            return city.categories?.map(locationCategory => (
              <Picker.Item
                key={locationCategory.uuid}
                label={locationCategory.category}
                value={locationCategory.uuid}
              />
            ));
          })()}
        </Picker>
        <Picker
          selectedValue={location}
          onValueChange={itemValue => setLocation(itemValue)}
          dropdownIconColor="black"
          style={pickerStyle}
          itemStyle={itemStyle}>
          <Picker.Item key="" label={"SELECT LOCATION"} value={""} />
          {(() => {
            const locationCategory = locationContext?.locationCategoryFromUUIDs(
              cityUUID,
              locationCategoryUUID,
            );
            if (!locationCategory) return;

            return locationCategory.locations?.map(locationObject => {
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
    </SafeAreaView>
  );
};

export default LocationSelect;
