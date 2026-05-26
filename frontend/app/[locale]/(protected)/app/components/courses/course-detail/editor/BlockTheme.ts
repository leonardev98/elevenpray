import { Extension } from "@tiptap/core";
import type { BlockTheme as BlockThemeId } from "./types";

export interface BlockThemeOptions {
  /** Tipos de nodo a los que añadir el atributo `theme`. */
  types: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockTheme: {
      /** Aplica una etiqueta de tema al bloque actual (null para limpiar). */
      setBlockTheme: (theme: BlockThemeId | null) => ReturnType;
    };
  }
}

export const BlockTheme = Extension.create<BlockThemeOptions>({
  name: "blockTheme",

  addOptions() {
    return {
      types: ["paragraph", "heading", "bulletList", "orderedList", "taskList", "blockquote", "callout"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          theme: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-theme") || null,
            renderHTML: (attributes) => {
              if (!attributes.theme) return {};
              return { "data-theme": attributes.theme };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBlockTheme:
        (theme) =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return true;
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              theme,
            });
            changed = true;
          });
          if (changed && dispatch) {
            dispatch(tr);
          }
          return changed;
        },
    };
  },
});

export default BlockTheme;
