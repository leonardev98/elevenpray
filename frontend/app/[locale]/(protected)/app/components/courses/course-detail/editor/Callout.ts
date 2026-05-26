import { Node, mergeAttributes } from "@tiptap/core";
import type { CalloutVariant } from "./types";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { variant?: CalloutVariant }) => ReturnType;
      toggleCallout: (attrs?: { variant?: CalloutVariant }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      variant: {
        default: "idea" as CalloutVariant,
        parseHTML: (element) => element.getAttribute("data-variant") || "idea",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-callout": "",
        class: "tt-callout",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant: attrs?.variant ?? "idea" }),
      toggleCallout:
        (attrs) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { variant: attrs?.variant ?? "idea" }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

export default Callout;
