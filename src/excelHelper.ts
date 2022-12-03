import { Hyperlink } from "./clipboardHelper";

export type SelectionStatus = "none" | "single" | "multiple";
export type ExcelHelper = {
  onSelectionStatusChanged: (
    callback: (status: SelectionStatus) => void
  ) => void;
  paste: (link: Hyperlink | string) => void;
};

export const excelHelper: ExcelHelper =
  typeof Excel !== "undefined"
    ? {
        async onSelectionStatusChanged(callback) {
          await readyPromise();

          Excel.run(async (context) => {
            context.workbook.onSelectionChanged.add(({ workbook }) =>
              getSelectionStatus(workbook).then(callback)
            );

            await getSelectionStatus(context.workbook).then(callback);
          });
        },

        async paste(link) {
          await readyPromise();

          Excel.run(async (context) => {
            const count = await getAreasCount(context.workbook);

            if (count === 1) {
              const cell = context.workbook
                .getSelectedRanges()
                .areas.getItemAt(0)
                .getCell(0, 0);

              paste(cell, link);
            } else {
              console.error("multiple ranges selected");
            }
          });
        },
      }
    : {
        onSelectionStatusChanged(callback) {
          callback("single");
        },
        paste(link) {
          console.log("[ExcelHelperMock] paste", link);
        },
      };

const readyPromise = (() => {
  let p!: Promise<unknown>;
  return () => {
    p = p || new Promise((resolve) => Office.onReady(resolve));
    return p;
  };
})();

function paste(cell: Excel.Range, link: string | Hyperlink) {
  if (typeof link === "string") {
    cell.values = [[link]];
  } else {
    cell.hyperlink = {
      address: link.url,
      textToDisplay: link.displayText ?? link.url,
    };
  }
}

async function getAreasCount(workbook: Excel.Workbook): Promise<number> {
  const ranges = workbook.getSelectedRanges();
  ranges.load("areaCount");
  await ranges.context.sync();
  return ranges.areaCount;
}

async function getSelectionStatus(workbook: Excel.Workbook) {
  const count = await getAreasCount(workbook);
  return count === 0 ? "none" : count === 1 ? "single" : "multiple";
}
