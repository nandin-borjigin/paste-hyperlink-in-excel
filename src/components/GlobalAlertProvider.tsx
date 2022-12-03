import { AlertProps } from "@fluentui/react-components/unstable";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type AlertData = {
  id: number;
  intent: AlertProps["intent"];
  content: string | JSX.Element;
};

export type PostAlert = (
  intent: AlertProps["intent"],
  content: string | JSX.Element,
  timeout?: number
) => void;

const Context1 = createContext([] as AlertData[]);
const Context2 = createContext((() => {}) as PostAlert);

export const GlobalAlertProvider: FC<PropsWithChildren> = ({ children }) => {
  const alertId = useRef(0);

  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const postAlert = useCallback(
    (
      intent: AlertProps["intent"],
      content: string | JSX.Element,
      timeout = 3000
    ) => {
      const id = alertId.current++;
      setAlerts((alerts) => [{ id, intent, content }, ...alerts.slice(0, 3)]);

      if (timeout != Infinity) {
        setTimeout(
          () => setAlerts((alerts) => alerts.filter((a) => a.id !== id)),
          timeout
        );
      }
    },
    [alertId]
  );

  return (
    <Context1.Provider value={alerts}>
      <Context2.Provider value={postAlert}>{children}</Context2.Provider>
    </Context1.Provider>
  );
};

export function useAlerts() {
  return useContext(Context1);
}

export function usePostAlert() {
  return useContext(Context2);
}
