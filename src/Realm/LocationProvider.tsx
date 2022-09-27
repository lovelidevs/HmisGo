import React, {ReactNode, useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import "react-native-get-random-values";
import {ObjectId} from "bson";

import {AuthContext} from "../Authentication/AuthProvider";

export type LocationDocument = {
  _id: ObjectId;
  organization: string;
  cities?: City[];
};

export type City = {
  uuid: string;
  city: string;
  categories?: LocationCategory[];
};

export type LocationCategory = {
  uuid: string;
  category: string;
  locations?: Location[];
};

export type Location = {
  uuid: string;
  location: string;
  places?: string[];
};

type LocationContextType = {
  locations: LocationDocument | null;
  getAllLocations: () => string[];
  cityFromUUID: (cityUUID: string) => City | undefined;
  locationCategoryFromUUIDs: (
    cityUUID: string,
    locationCategoryUUID: string,
  ) => LocationCategory | undefined;
  locationsFromUUIDs: (
    cityUUID: string,
    locationCategoryUUID: string,
  ) => string[];
};

export const LocationContext = React.createContext<LocationContextType | null>(
  null,
);

const LocationProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);

  const [locations, setLocations] = useState<LocationDocument | null>(null);

  useEffect(() => {
    if (!authContext?.realm) return;

    try {
      const collection = authContext.realm.objects("location");

      if (!collection)
        return Alert.alert("", "Unable to connect to locations collection");

      collection.addListener(coll => {
        const collClone = JSON.parse(JSON.stringify(coll));
        setLocations(collClone[0]);
      });

      return () => collection.removeAllListeners();
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [authContext?.realm]);

  const getAllLocations = (): string[] => {
    if (!locations?.cities) return [];

    const result: string[] = [];

    for (const city of locations.cities)
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

  const cityFromUUID = (cityUUID: string): City | undefined =>
    locations?.cities?.find(city => city.uuid === cityUUID);

  const locationCategoryFromUUIDs = (
    cityUUID: string,
    locationCategoryUUID: string,
  ): LocationCategory | undefined =>
    cityFromUUID(cityUUID)?.categories?.find(
      category => category.uuid === locationCategoryUUID,
    );

  const locationsFromUUIDs = (
    cityUUID: string,
    locationCategoryUUID: string,
  ): string[] => {
    const locationCategory = locationCategoryFromUUIDs(
      cityUUID,
      locationCategoryUUID,
    );

    if (!locationCategory || !locationCategory.locations) return [];

    const result: string[] = [];

    for (const location of locationCategory.locations) {
      result.push(location.location);

      if (!location.places) continue;

      for (const place of location.places) result.push(place);
    }

    return result;
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        getAllLocations,
        cityFromUUID,
        locationCategoryFromUUIDs,
        locationsFromUUIDs,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
