export const noteKeys = {
  all: ["notes"],
  lists: () => [...noteKeys.all, "list"],
  detail: (id: string) => [...noteKeys.all, "detail", id],
};
