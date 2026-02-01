import * as React from "react";
import { Link } from "react-router-dom";

type BlobButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
};

type BlobButtonAsButtonProps = BlobButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never;
  };

type BlobButtonAsLinkProps = BlobButtonBaseProps & {
  to: string;
};

export type BlobButtonProps = BlobButtonAsButtonProps | BlobButtonAsLinkProps;

export function BlobButton(props: BlobButtonProps) {
  const { children, className, size = "default" } = props;

  const sizeClassName = size === "lg" ? "blob-btn--lg" : "blob-btn--default";

  const commonClassName = ["blob-btn", sizeClassName, className].filter(Boolean).join(" ");

  const inner = (
    <>
      <span className="blob-btn__content">{children}</span>
      <span className="blob-btn__inner" aria-hidden="true">
        <span className="blob-btn__blobs">
          <span className="blob-btn__blob" />
          <span className="blob-btn__blob" />
          <span className="blob-btn__blob" />
          <span className="blob-btn__blob" />
        </span>
      </span>
    </>
  );

  if ("to" in props) {
    return (
      <Link to={props.to} className={commonClassName}>
        {inner}
      </Link>
    );
  }

  const { to: _to, ...buttonProps } = props;

  return (
    <button {...buttonProps} className={commonClassName}>
      {inner}
    </button>
  );
}
