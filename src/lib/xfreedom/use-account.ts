import { useCallback, useEffect, useState } from "react";
import { getAccount } from "./server";

export type Account = Awaited<ReturnType<typeof getAccount>>;

export function useAccount() {
  const [data, setData] = useState<Account | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const next = await getAccount();
      setData(next);
      setErr(null);
      return next;
    } catch {
      setErr("Не удалось загрузить кабинет");
      return null;
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, err, reload };
}
