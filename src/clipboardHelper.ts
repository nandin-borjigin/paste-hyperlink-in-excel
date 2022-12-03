export type Hyperlink = { url: string; displayText: string | null };

export type ReadLinkResult =
  | Hyperlink
  | Hyperlink[] /* There are multiple links in the clipboard */
  | string /* There is some text in the clipboard but it's not recognized as a hyperlink. */
  | false; /* Other types of content in the clipboard */
// | null; /* No content in the clipboard */

export type ClipboardHelper = {
  isSupported: () => boolean;
  getPermissionStatus: () => Promise<PermissionStatus>;
  readLink: () => Promise<ReadLinkResult>;
};

const parser = new DOMParser();

export const clipboardHelper: ClipboardHelper = {
  isSupported() {
    return !!navigator.clipboard;
  },
  async getPermissionStatus() {
    return navigator.permissions.query({ name: "clipboard-read" as any });
  },
  async readLink() {
    const clipboardItems = await navigator.clipboard.read();
    const hyperlinks = [] as Hyperlink[];
    let fallbackText = "";
    for (const item of clipboardItems) {
      await item.getType("text/html").then(
        (blob) =>
          blob.text().then((html) => {
            const doc = parser.parseFromString(html, "text/html");
            const anchors = doc.getElementsByTagName("a");
            if (anchors.length > 0) {
              hyperlinks.push(
                ...Array.from(anchors).map((a) => ({
                  url: a.href,
                  displayText: a.textContent,
                }))
              );
            } else {
              fallbackText += doc.body.textContent;
            }
          }),
        () =>
          item.getType("text/plain").then(
            (blob) =>
              blob.text().then((text) => {
                try {
                  const url = new URL(text);
                  hyperlinks.push({ url: url.href, displayText: null });
                } catch {
                  fallbackText += text;
                }
              }),
            () => {}
          )
      );
    }

    if (hyperlinks.length > 0) {
      return hyperlinks;
    } else {
      return fallbackText || false;
    }
  },
};

export const clipboardHelperMock: ClipboardHelper = {
  isSupported: () => true,
  getPermissionStatus: () => {
    const status = {
      state: "granted" as PermissionState,
      addEventListener(_: unknown, listener: Function) {
        setInterval(() => {
          status.state = status.state === "granted" ? "denied" : "granted";
          listener();
        }, 2000);
      },
    };
    return Promise.resolve(status as any);
  },
  readLink: () =>
    Promise.resolve({ url: "https://example.com", displayText: "Example" }),
};
