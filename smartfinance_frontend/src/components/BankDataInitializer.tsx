import React, { useEffect } from "react";
import { useData } from "../contexts/DataContext";

type BankDataInitializerProps = {
  pendingBanksData:
    | {
        bankName: string;
        accounts: { title: string; number: string; balance: number }[];
      }[]
    | null;
  onDataProcessed: () => void;
  children: React.ReactNode;
};

const BankDataInitializer: React.FC<BankDataInitializerProps> = ({
  pendingBanksData,
  onDataProcessed,
  children,
}) => {
  const { setupUserBanks } = useData();

  useEffect(() => {
    if (pendingBanksData && pendingBanksData.length > 0) {
      // Setup the user's banks from the onboarding data
      setupUserBanks(pendingBanksData);
      // Clear the pending data
      onDataProcessed();
    }
  }, [pendingBanksData, setupUserBanks, onDataProcessed]);

  return <>{children}</>;
};

export default BankDataInitializer;
