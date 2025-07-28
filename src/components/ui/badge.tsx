import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);
