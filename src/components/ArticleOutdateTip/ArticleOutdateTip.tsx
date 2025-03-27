import { formatDistanceToNow, isAfter, subDays } from "date-fns";
import { enUS } from "date-fns/locale";
import IconInformationFill from "~icons/mingcute/information-fill";
import { twMerge } from "tailwind-merge";

export interface ArticleOutdateTipProps
  extends React.ComponentPropsWithoutRef<"div"> {
  updateDate: Date;
  outdateLimit?: number;
}

export default function ArticleOutdateTip({
  updateDate,
  outdateLimit = 30,
  className,
  ...rest
}: ArticleOutdateTipProps) {
  const distance = formatDistanceToNow(updateDate, {
    addSuffix: true,
    locale: enUS,
  });
  return isAfter(updateDate, subDays(Date.now(), outdateLimit)) ? null : (
    <div
      className={twMerge(
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 p-3",
        className
      )}
      {...rest}
    >
      <IconInformationFill className="w-5 h-5 inline align-middle mr-2" />
      <p className="inline align-middle">
        This article was last updated on {distance}, the content in this article
        may be outdated, please be careful to distinguish it.
      </p>
    </div>
  );
}
