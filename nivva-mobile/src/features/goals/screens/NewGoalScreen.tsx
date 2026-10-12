import { GoalForm } from "../components/GoalForm";
import { useGoals } from "../context/GoalProvider";

export function NewGoalScreen() {
  const { createGoal } = useGoals();

  return (
    <GoalForm
      mode="create"
      onSubmit={async (values) => {
        await createGoal(values);
      }}
    />
  );
}
