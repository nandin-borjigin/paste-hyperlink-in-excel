import { FC, useCallback } from "react";

export function Switch<T extends string>(props: {
  value: T;
  children: (
    Cases: FC<{
      [K in T]: JSX.Element | null;
    }>
  ) => JSX.Element | null;
}): JSX.Element | null;
export function Switch<
  T extends Record<string, unknown>,
  SwitcherKey extends keyof T
>({
  value,
  switchOn,
  children,
}: {
  value: T;
  switchOn: keyof {
    [K in keyof T as T[K] extends string ? K : never]: unknown;
  };
  children: (
    Cases: FC<{
      [K in string & T[SwitcherKey]]:
        | JSX.Element
        | null
        | ((
            value: Extract<
              T,
              {
                [KK in SwitcherKey]: K;
              }
            >
          ) => JSX.Element | null);
    }>
  ) => JSX.Element | null;
}): JSX.Element | null;
export function Switch({ value, switchOn, children }: any) {
  const Cases = useCallback(
    (cases: Record<string, FC<unknown>>) => {
      const Case =
        cases[typeof value === "string" ? value : (value[switchOn] as string)];
      return typeof Case === "function" ? Case(value) : Case;
    },
    [value, switchOn]
  );
  return children(Cases as any);
}
