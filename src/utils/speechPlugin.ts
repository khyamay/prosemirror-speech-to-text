import { MenuItem } from "prosemirror-menu";
import { Plugin, PluginKey } from "prosemirror-state";

const speechPluginKey = new PluginKey("speech-to-text");

export const createSpeechPlugin = (setListening: (active: boolean) => void) => {
  const plugin = new Plugin({
    key: speechPluginKey,
    state: {
      init() {
        return { active: false };
      },
      apply(tr, value) {
        const action = tr.getMeta(speechPluginKey);
        if (action && action.type === "toggle") {
          return { active: !value.active };
        }
        return value;
      }
    },
    view() {
      return {
        update: (view, prevState) => {
          const { active } = speechPluginKey.getState(view.state);
          if (active !== speechPluginKey.getState(prevState).active) {
            setListening(active);
          }
        }
      };
    }
  });

  const menuItem = new MenuItem({
    title: "Toggle Speech-to-Text",
    label: "Speech",
    icon: {
      width: 24,
      height: 24,
      path: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
    },
    select: () => true,
    run: (_state, _dispatch, view) => {
      if (view) {
        view.dispatch(
          view.state.tr.setMeta(speechPluginKey, { type: "toggle" })
        );
        const { active } = speechPluginKey.getState(view.state);
        view.dispatch(view.state.tr.setMeta("markActive", active));
      }
      return true;
    },
    active(state) {
      return speechPluginKey.getState(state).active;
    }
  });

  return { plugin, menuItem };
};
