import React, { useCallback, useEffect, useRef } from "react";

type DetectOutsideClickProps = {
  onOutsideClick: () => void;
  children: JSX.Element;
};

export default function DetectOutsideClick({
  onOutsideClick,
  children,
}: DetectOutsideClickProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  const escapeListener = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onOutsideClick();
    }
  }, []);

  const clickListener = useCallback(
    (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        onOutsideClick?.();
      }
    },
    [ref.current]
  );

  useEffect(() => {
    document.addEventListener("click", clickListener);
    document.addEventListener("keyup", escapeListener);

    return () => {
      document.removeEventListener("click", clickListener);
      document.removeEventListener("keyup", escapeListener);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
