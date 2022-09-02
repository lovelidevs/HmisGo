import React, {ReactNode} from "react";

import ClientProvider from "./ClientProvider";
import DailyListProvider from "./DailyListProvider";
import LocationProvider from "./LocationProvider";
import ServiceProvider from "./ServiceProvider";

const RealmProvider = ({children}: {children: ReactNode}) => {
  return (
    <LocationProvider>
      <ServiceProvider>
        <ClientProvider>
          <DailyListProvider>{children}</DailyListProvider>
        </ClientProvider>
      </ServiceProvider>
    </LocationProvider>
  );
};

export default RealmProvider;
