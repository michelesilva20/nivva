import { FinanceLoadGate } from "@/features/finance";
import { WalletScreen } from "@/features/wallet";

export default function WalletRoute() {
  return (
    <FinanceLoadGate>
      <WalletScreen />
    </FinanceLoadGate>
  );
}
