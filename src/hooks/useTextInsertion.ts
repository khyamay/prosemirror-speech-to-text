import { EditorView } from "prosemirror-view";
import { useCallback, useRef } from "react";

export const useTextInsertion = (editorView: EditorView | null) => {
  const lastInterimRef = useRef<string>("");

  const insertText = useCallback(
    (text: string, isFinal: boolean) => {
      if (editorView && editorView.hasFocus()) {
        const { state } = editorView;
        let tr = state.tr;

        // Always remove the last transcript (interim or final)
        if (lastInterimRef.current) {
          const lastPos = state.selection.$anchor.pos;
          const startPos = Math.max(0, lastPos - lastInterimRef.current.length);
          if (startPos < lastPos) {
            tr = tr.delete(startPos, lastPos);
          }
        }

        // Insert the new text at the current cursor position
        const pos = tr.selection.$anchor.pos;
        tr = tr.insertText(text.trim(), Math.min(pos, tr.doc.content.size));

        // If it's a final transcript, add a space after it
        if (isFinal) {
          tr = tr.insertText(" ", tr.selection.$anchor.pos);
        }

        editorView.dispatch(tr);

        // Update the last transcript reference
        lastInterimRef.current = isFinal ? "" : text.trim();
      }
    },
    [editorView]
  );

  return { insertText };
};
