import { Button, Caption1, Text } from "@fluentui/react-components";
import { Card, CardHeader } from "@fluentui/react-components/unstable";
import { FC, useCallback, useState } from "react";
import { ClipboardHelper, Hyperlink, ReadLinkResult } from "../clipboardHelper";
import { usePostAlert } from "./GlobalAlertProvider";
import { Switch } from "./Switch";

type Props = {
  clipboardHelper: ClipboardHelper;
  onPaste: (result: Exclude<ReadLinkResult, unknown[]>) => void;
};

const Idle = makeDisplayState("idle");
const PickOne = (links: Hyperlink[]) => makeDisplayState("pick-one", { links });
type DisplayState = typeof Idle | ReturnType<typeof PickOne>;

export const LinkPaster: FC<Props> = ({ clipboardHelper, onPaste }) => {
  const [displayState, setDisplayState] = useState<DisplayState>(Idle);
  const postAlert = usePostAlert();

  const paste = useCallback(
    (result: Exclude<ReadLinkResult, unknown[]>) => {
      onPaste(result);
      setDisplayState(Idle);
    },
    [onPaste]
  );

  async function onClick() {
    try {
      const result = await clipboardHelper.readLink();
      if (Array.isArray(result)) {
        setDisplayState(PickOne(result));
      } else {
        paste(result);
      }
    } catch (e) {
      postAlert(
        "error",
        e instanceof Error
          ? e.message
          : e instanceof Object
          ? e.toString()
          : `${e}`
      );
    }
  }

  return (
    <Switch value={displayState} switchOn={"status"}>
      {(Cases) => (
        <Cases
          idle={
            <Button appearance="primary" onClick={onClick}>
              Paste
            </Button>
          }
          pick-one={({ links }) => (
            <MultipleLinks links={links} onSelect={paste} />
          )}
        />
      )}
    </Switch>
  );
};

const MultipleLinks: FC<{
  links: Hyperlink[];
  onSelect: (link: Hyperlink) => void;
}> = ({ links, onSelect }) => (
  <>
    {links.map((link, i) => (
      <Card
        key={i}
        onClick={() => onSelect(link)}
        as="button"
        appearance="filled-alternative"
      >
        <CardHeader
          header={<Text weight="semibold">{link.displayText}</Text>}
          description={<Caption1>{link.url}</Caption1>}
        />
      </Card>
    ))}
  </>
);

function makeDisplayState<Status extends string>(
  status: Status
): { status: Status };
function makeDisplayState<Status extends string, Data>(
  status: Status,
  data: Data
): { status: Status } & Data;
function makeDisplayState<Status extends string, Data = {}>(
  status: Status,
  data?: Data
) {
  return {
    status,
    ...(data || {}),
  };
}
