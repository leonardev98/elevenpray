import type { PostType } from "../community-types";
import { POST_TYPE_BADGE, POST_TYPE_LABELS } from "../community-constants";

export function PostTypeBadge({ type }: { type: PostType }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${POST_TYPE_BADGE[type]}`}
    >
      {POST_TYPE_LABELS[type]}
    </span>
  );
}
