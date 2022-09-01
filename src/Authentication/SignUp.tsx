import React, {useContext, useState} from "react";
import {Alert, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";

import LLButton from "../LLComponents/LLButton";
import LLSafeAreaView from "../LLComponents/LLSafeAreaView";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";
import {AuthContext} from "./AuthProvider";

const SignUp = ({
  route,
}: NativeStackScreenProps<RootStackParamList, "SignUp">) => {
  const auth = useContext(AuthContext);

  const [email, setEmail] = useState<string>(route.params.email);
  const [emailConfirm, setEmailConfirm] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [confirmationEmailSent, setConfirmationEmailSent] =
    useState<boolean>(false);

  return (
    <LLSafeAreaView>
      <View className="flex flex-col flex-nowrap justify-center items-stretch space-y-4 px-6">
        <View>
          <LLTextInput
            value={email}
            onChange={(value: string) => setEmail(value)}
            placeholder="email"
            type="email"
          />
        </View>
        <View>
          <LLTextInput
            value={emailConfirm}
            onChange={(value: string) => setEmailConfirm(value)}
            placeholder="email"
            type="email"
          />
        </View>
        <View>
          <LLTextInput
            value={password}
            onChange={(value: string) => setPassword(value)}
            placeholder="password"
            type="password"
          />
        </View>
        <View>
          <LLTextInput
            value={passwordConfirm}
            onChange={(value: string) => setPasswordConfirm(value)}
            placeholder="password"
            type="password"
          />
        </View>
        <View>
          <LLButton
            title={
              confirmationEmailSent
                ? "Resend Confirmation Email"
                : "Send Confirmation Email"
            }
            onPress={async () => {
              if (!email) return Alert.alert("", "Email address is required");
              if (!password) return Alert.alert("", "Password is required");
              if (email !== emailConfirm)
                return Alert.alert("", "Emails do not match");
              if (password !== passwordConfirm)
                return Alert.alert("", "Passwords do not match");

              if (confirmationEmailSent)
                try {
                  await auth?.resendConfirmation(email);
                } catch (error) {
                  return Alert.alert("", String(error));
                }
              else {
                try {
                  await auth?.registerUser(email, password);
                } catch (error) {
                  return Alert.alert("", String(error));
                }

                setConfirmationEmailSent(true);
              }
            }}
          />
        </View>
      </View>
    </LLSafeAreaView>
  );
};

export default SignUp;
