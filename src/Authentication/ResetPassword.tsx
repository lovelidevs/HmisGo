import React, {useContext, useState} from "react";
import {Alert, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";

import LLButton from "../LLComponents/LLButton";
import LLSafeAreaView from "../LLComponents/LLSafeAreaView";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";
import {AuthContext} from "./AuthProvider";

const ResetPassword = ({
  route,
}: NativeStackScreenProps<RootStackParamList, "ResetPassword">) => {
  const authContext = useContext(AuthContext);

  const [email, setEmail] = useState<string>(route.params.email);

  return (
    <LLSafeAreaView>
      <View className="flex flex-col flex-nowrap justify-center items-strech space-y-4 px-6">
        <View>
          <LLTextInput
            value={email}
            onChange={(value: string) => setEmail(value)}
            placeholder="email"
            type="email"
          />
        </View>
        <View>
          <LLButton
            title="Send Reset Password Email"
            onPress={async () => {
              if (!email) return Alert.alert("", "Email address is required");

              try {
                await authContext?.resetPassword(email);
              } catch (error) {
                return Alert.alert("", String(error));
              }

              Alert.alert("", "reset password email sent to " + email);
            }}
          />
        </View>
      </View>
    </LLSafeAreaView>
  );
};

export default ResetPassword;
