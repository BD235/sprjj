export type AccountActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<string, string>>;
};

export const initialAccountActionState: AccountActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
