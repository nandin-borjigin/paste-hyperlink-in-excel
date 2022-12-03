import {
  FluentProvider,
  Link,
  makeStyles,
  shorthands,
  tokens,
  webLightTheme,
} from "@fluentui/react-components";
import { FC, useCallback, useEffect, useState } from "react";
import { clipboardHelper, ReadLinkResult } from "./clipboardHelper";
import { Alert } from "./components/Alert";
import { LinkPaster } from "./components/LinkPaster";

import {
  GlobalAlertProvider,
  useAlerts,
  usePostAlert,
} from "./components/GlobalAlertProvider";
import { Info } from "./components/Info";
import { Switch } from "./components/Switch";
import { WithAsync } from "./components/WithAsync";
import { excelHelper, SelectionStatus } from "./excelHelper";

export const useAlertStyles = makeStyles({
  root: {
    alignItems: "start",
    boxSizing: "border-box",
    ...shorthands.padding("12px"),
  },
  icon: {
    fontSize: tokens.lineHeightBase300,
  },
});

const useStyles = makeStyles({
  container: {
    height: "100vh",
    boxSizing: "border-box",
    ...shorthands.padding("20px"),

    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },

  spacer: {
    flexGrow: 1,
  },
});

const App_: FC = () => {
  const classes = useStyles();
  const alerts = useAlerts();
  const postAlert = usePostAlert();
  const [selectionStatus, setSelectionStatus] =
    useState<SelectionStatus>("none");
  const [permission, setPermission] = useState<
    Promise<PermissionState | "not-supported">
  >(new Promise(() => {}));

  useEffect(() => {
    if (clipboardHelper.isSupported()) {
      setPermission(
        clipboardHelper.getPermissionStatus().then((status) => {
          status.addEventListener("change", () =>
            setPermission(Promise.resolve(status.state))
          );
          return status.state;
        })
      );
    } else {
      setPermission(Promise.resolve("not-supported"));
    }
  }, []);

  useEffect(() => {
    excelHelper.onSelectionStatusChanged(setSelectionStatus);
  }, []);

  const paste = useCallback((result: Exclude<ReadLinkResult, unknown[]>) => {
    if (typeof result === "string") {
      excelHelper.paste(result);
      postAlert(
        "warning",
        "Pasted the text from clipboard, it may not be a hyperlink."
      );
    } else if (result) {
      excelHelper.paste(result);
      postAlert("success", "Successfully pasted the hyperlink from clipboard.");
    } else if (result === false) {
      postAlert(
        "warning",
        "Clipboard has non-text content, please paste it manually."
      );
    } else {
      postAlert("warning", "Clipboard is empty");
    }
  }, []);

  const Paster = (
    <Switch value={selectionStatus}>
      {(Cases) => (
        <Cases
          none={NoSelectionAlert}
          multiple={MultipleSelectionAlert}
          single={
            <LinkPaster clipboardHelper={clipboardHelper} onPaste={paste} />
          }
        />
      )}
    </Switch>
  );

  const Main = (
    <WithAsync promise={permission}>
      {(permission) => (
        <Switch value={permission}>
          {(Cases) => (
            <Cases
              granted={Paster}
              prompt={Paster}
              not-supported={ClipboardAPIIsNotSupportedAlert}
              denied={ClipboardPermissionIsNotGrantedAlert}
            />
          )}
        </Switch>
      )}
    </WithAsync>
  );

  return (
    <FluentProvider theme={webLightTheme} className={classes.container}>
      <Info />
      {Main}

      <div className={classes.spacer}></div>

      {alerts.map((alert) => (
        <Alert key={alert.id} intent={alert.intent}>
          {alert.content}
        </Alert>
      ))}
    </FluentProvider>
  );
};

export const App = () => (
  <GlobalAlertProvider>
    <App_ />
  </GlobalAlertProvider>
);

const NoSelectionAlert = (
  <Alert intent="warning">Please select a cell in the spreadsheet</Alert>
);

const MultipleSelectionAlert = (
  <Alert intent="warning">
    Please select <b>only one</b> cell in the spreadsheet
  </Alert>
);

const ClipboardAPIIsNotSupportedAlert = (
  <Alert intent="error">
    This add-in requires{" "}
    <Link
      href="https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API"
      target="_blank"
    >
      Clipboard API
    </Link>{" "}
    which is not supported in this context.
  </Alert>
);

const ClipboardPermissionIsNotGrantedAlert = (
  <Alert intent="warning">Clipboard access is not granted</Alert>
);
