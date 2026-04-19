import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<{ types: string[] }>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.fontSize || null,
            renderHTML: (attributes: Record<string, string>) => {
              if (attributes.fontSize === undefined || attributes.fontSize === null) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
          ({ chain }) =>
            chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        // eslint-disable-next-line unicorn/consistent-function-scoping
          ({ chain }) =>
            chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});
