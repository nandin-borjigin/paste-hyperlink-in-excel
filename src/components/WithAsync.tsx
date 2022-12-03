import { useEffect, useState } from "react";

export function WithAsync<T>({
  promise,
  children,
  loading = null,
  error: errorComponent = () => null,
}: {
  promise: Promise<T>;
  children: (value: T) => JSX.Element | null;
  loading?: JSX.Element | null;
  error?: (error: unknown) => JSX.Element | null;
}): JSX.Element | null {
  const [status, setStatus] = useState<"loading" | "resolved" | "rejected">(
    "loading"
  );
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    promise
      .then((value) => {
        setValue(value);
        setStatus("resolved");
      })
      .catch((e) => {
        setError(e);
        setStatus("rejected");
      });
  }, [promise]);

  switch (status) {
    case "loading":
      return loading;
    case "rejected":
      return errorComponent(error);
    case "resolved":
      return children(value!);
  }
}
