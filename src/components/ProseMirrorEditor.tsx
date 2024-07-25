import React, { useEffect, useRef, useState } from "react";

import { buildMenuItems, exampleSetup } from "prosemirror-example-setup";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import "prosemirror-menu/style/menu.css";
import "prosemirror-view/style/prosemirror.css";

import useSpeechToText from "@/hooks/useSpeechToText";
import { useTextInsertion } from "@/hooks/useTextInsertion";
import { createSpeechPlugin } from "@/utils/speechPlugin";
import { MenuItem } from "prosemirror-menu";

// Create a schema with list support
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
});

const ProseMirrorEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const { transcript, interimTranscript, setListening } = useSpeechToText();
  const { insertText } = useTextInsertion(editorView);

  useEffect(() => {
    if (editorRef.current && !editorView) {
      const speechPlugin = createSpeechPlugin(setListening);
      const menuItems = buildMenuItems(mySchema);
      // menuItems.fullMenu.push([speechPlugin.menuItem]);
      const menuItemsArray: MenuItem[][] = menuItems.fullMenu.map((row) =>
        row.filter((item): item is MenuItem => item instanceof MenuItem)
      );

      menuItemsArray.push([speechPlugin.menuItem]);

      const state = EditorState.create({
        schema: mySchema,
        plugins: [
          ...exampleSetup({
            schema: mySchema,
            menuContent: menuItemsArray
          }),
          speechPlugin.plugin
        ]
      });

      const view = new EditorView(editorRef.current, { state });
      setEditorView(view);

      return () => {
        view.destroy();
      };
    }
  }, [editorRef]);

  useEffect(() => {
    if (interimTranscript) {
      insertText(interimTranscript, false);
    }
  }, [interimTranscript, insertText]);

  useEffect(() => {
    if (transcript) {
      insertText(transcript, true);
    }
  }, [transcript, insertText]);

  return <div ref={editorRef} />;
};

export default ProseMirrorEditor;
