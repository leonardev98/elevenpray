"use client";

import { MOCK_COMMENTS, MOCK_FEED_POSTS } from "../../community-mock-data";
import { CommunityFooter } from "../CommunityFooter";
import { FeedPostCard } from "./FeedPostCard";
import { NewPostComposer } from "./NewPostComposer";

export function FeedTab({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div>
      <NewPostComposer onOpen={onOpenModal} />
      <div className="space-y-4">
        {MOCK_FEED_POSTS.map((post) => (
          <FeedPostCard key={post.id} post={post} comments={MOCK_COMMENTS} />
        ))}
      </div>
      <CommunityFooter />
    </div>
  );
}
