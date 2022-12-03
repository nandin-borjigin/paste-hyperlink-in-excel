import { Text } from "@fluentui/react-components";
import {
  Alert as Alert_,
  AlertProps,
} from "@fluentui/react-components/unstable";
import { FC } from "react";
import { useAlertStyles } from "../App";

export const Alert: FC<AlertProps> = (props) => {
  const classes = useAlertStyles();
  return (
    <Alert_
      {...props}
      className={classes.root}
      icon={{ className: classes.icon }}
    >
      <Text>{props.children}</Text>
    </Alert_>
  );
};
