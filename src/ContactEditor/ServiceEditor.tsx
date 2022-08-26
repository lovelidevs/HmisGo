import React, {useContext, useEffect, useState} from "react";
import {Alert, Platform, Text} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import {RealmStateContext} from "../RealmStateProvider";
import {Service} from "./ContactEditor";
import {
  ContactEditorContext,
  ContactEditorStackParamList,
} from "./ContactEditorNavigator";

const ServiceEditor = ({
  navigation,
  route,
}: NativeStackScreenProps<ContactEditorStackParamList, "ServiceEditor">) => {
  const {serviceUUID, categoryUUID} = route.params;

  const realmState = useContext(RealmStateContext);
  const editorContext = useContext(ContactEditorContext);

  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    if (service || !realmState?.services) return;

    const category = realmState.services.categories?.find(
      cat => cat.uuid === categoryUUID,
    );
    if (!category) return Alert.alert("", "Unable to find services category");

    const result = category.services?.find(serv => serv.uuid === serviceUUID);
    if (!result) return Alert.alert("", "Unable to find service");

    navigation.setOptions({title: result.service});
    setService(result);
  }, [service, realmState?.services, serviceUUID, categoryUUID, navigation]);

  if (!service || !editorContext?.contact) return <LLActivityIndicatorView />;

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <Text>{"Test"}</Text>
    </SafeAreaView>
  );
};

export default ServiceEditor;
