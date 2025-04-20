"use client";
import * as React from "react";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  numColumns?: number;
  children: React.ReactNode;
}

const Grid = ({ numColumns = 1, children, ...props }: GridProps) => {
  const gridTemplateColumns = `repeat(${numColumns}, minmax(0, 1fr))`;
  return (
    <div style={{ display: "grid", gridTemplateColumns, gap: "1rem" }} {...props}>
      {children}
    </div>
  );
};

export { Grid };
