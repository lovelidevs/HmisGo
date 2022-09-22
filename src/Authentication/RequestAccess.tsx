import React, {useContext, useEffect, useState} from "react";
import {Alert, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";

import LogoutIcon from "../Icons/logout.svg";
import LLButton from "../LLComponents/LLButton";
import LLHeaderButton from "../LLComponents/LLHeaderButton";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";
import {AuthContext} from "./AuthProvider";

const RequestAccess = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "RequestAccess">) => {
  const authContext = useContext(AuthContext);

  const [organization, setOrganization] = useState<string>("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <LLHeaderButton onPress={() => authContext?.logOut()}>
          <LogoutIcon width="100%" height="100%" />
        </LLHeaderButton>
      ),
    });
  }, [navigation, authContext]);

  return (
    <SafeAreaView className="px-6">
      <View className="flex flex-col justify-start items-stretch space-y-4 mt-6">
        <Text className="text-black text-lg">
          Request to join an organization:
        </Text>
        <View>
          <LLTextInput
            value={organization}
            onChange={(value: string) => setOrganization(value)}
            placeholder="Organization ID"
          />
        </View>
        <View>
          <LLButton
            title="Send Request"
            onPress={async () => {
              try {
                await authContext?.requestAccess(organization);
              } catch (error) {
                Alert.alert("", String(error));
              }
            }}
          />
        </View>
        <View>
          {authContext?.userData?.status !== "" && (
            <>
              <Text className="text-black text-lg mb-4">{`Request is ${authContext?.userData?.status.toUpperCase()} to join organization ${
                authContext?.userData?.organization
              }`}</Text>
              <LLButton
                title="REFRESH"
                onPress={() => {
                  authContext?.refreshUserData();
                }}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RequestAccess;
