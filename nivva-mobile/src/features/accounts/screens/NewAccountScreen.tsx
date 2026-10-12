import { AccountForm } from "../components/AccountForm";
import { useAccounts } from "../context/AccountProvider";

export function NewAccountScreen() {
  const { addAccount } = useAccounts();

  return (
    <AccountForm
      mode="create"
      onSubmit={async (values) => {
        await addAccount(values);
      }}
    />
  );
}
