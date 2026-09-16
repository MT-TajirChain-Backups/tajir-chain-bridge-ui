import { FC, PropsWithChildren, useEffect, useRef } from "react";

import { useInfiniteScrollStyles } from "src/views/activity/components/infinite-scroll/infinite-scroll.styles";
import { Spinner } from "src/views/shared/spinner/spinner.view";

type InfiniteScrollProps = PropsWithChildren<{
  isLoading: boolean;
  onLoadNextPage: () => void;
}>;

export const InfiniteScroll: FC<InfiniteScrollProps> = ({
  children,
  isLoading,
  onLoadNextPage,
}) => {
  const classes = useInfiniteScrollStyles();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          onLoadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const loaderNode = loaderRef.current;
    if (loaderNode) {
      observer.observe(loaderNode);
    }

    return () => {
      if (loaderNode) {
        observer.unobserve(loaderNode);
      }
    };
  }, [isLoading, onLoadNextPage]);

  return (
    <div className={classes.root}>
      {children}
      <div ref={loaderRef} style={{ height: "1px", width: "100%" }} />
      {isLoading && (
        <div className={classes.spinnerWrapper}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
};
