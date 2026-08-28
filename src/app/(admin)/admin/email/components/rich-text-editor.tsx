'use client';

import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

import { FontSize } from '../helpers/font-size-extension';

interface RichTextEditorProps {
  editorClassName?: string;
  initialContent?: string;
  onChange: (html: string) => void;
}

const FONT_SIZES = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '48px',
];

const COLORS = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#b7b7b7',
  '#cccccc',
  '#d9d9d9',
  '#efefef',
  '#f3f3f3',
  '#ffffff',
  '#980000',
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#4a86e8',
  '#0000ff',
  '#9900ff',
  '#ff00ff',
  '#e6b8af',
  '#f4cccc',
  '#fce5cd',
  '#fff2cc',
  '#d9ead3',
  '#d0e0e3',
  '#c9daf8',
  '#cfe2f3',
  '#d9d2e9',
  '#ead1dc',
  '#dd7e6b',
  '#ea9999',
  '#f9cb9c',
  '#ffe599',
  '#b6d7a8',
  '#a2c4c9',
  '#a4c2f4',
  '#9fc5e8',
  '#b4a7d6',
  '#d5a6bd',
  '#cc4125',
  '#e06666',
  '#f6b26b',
  '#ffd966',
  '#93c47d',
  '#76a5af',
  '#6d9eeb',
  '#6fa8dc',
  '#8e7cc3',
  '#c27ba0',
  '#a61c00',
  '#cc0000',
  '#e69138',
  '#f1c232',
  '#6aa84f',
  '#45818e',
  '#3c78d8',
  '#3d85c6',
  '#674ea7',
  '#a64d79',
  '#85200c',
  '#990000',
  '#b45f06',
  '#bf9000',
  '#38761d',
  '#134f5c',
  '#1155cc',
  '#0b5394',
  '#351c75',
  '#741b47',
];

const btnBase =
  'rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';
const btnActive =
  'rounded-md p-1.5 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';

function Separator() {
  return <div className="mx-0.5 h-6 w-px bg-slate-200 dark:bg-slate-700" />;
}

export function RichTextEditor({
  editorClassName = 'prose prose-sm dark:prose-invert max-w-none min-h-50 px-4 py-3 focus:outline-none',
  initialContent = '',
  onChange,
}: RichTextEditorProps) {
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontColor, setShowFontColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const closeAllDropdowns = () => {
    setShowFontSize(false);
    setShowFontColor(false);
    setShowBgColor(false);
    setShowLinkInput(false);
  };

  const editor = useEditor({
    content: initialContent,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            style:
              'margin: 16px 0 16px 16px; padding: 12px 16px; border-left: 4px solid #cbd5e1; background-color: #f8fafc; color: #475569; font-size: 14px; line-height: 1.6;',
          },
        },
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  if (editor === null) {
    return null;
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    });
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleSetLink = () => {
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const openLinkInput = () => {
    const existingHref = editor.getAttributes('link').href as
      | string
      | undefined;
    setLinkUrl(existingHref ?? '');
    closeAllDropdowns();
    setShowLinkInput(true);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Toolbar row 1: text formatting */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5 dark:border-slate-700">
        {/* Undo / Redo */}
        <button
          className={btnBase}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 14l-4-4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className={btnBase}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M21 10H11a5 5 0 00-5 5v0a5 5 0 005 5h5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 14l4-4-4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Separator />

        {/* Heading dropdown-like buttons */}
        <button
          className={
            editor.isActive('heading', { level: 1 }) ? btnActive : btnBase
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
          type="button"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          className={
            editor.isActive('heading', { level: 2 }) ? btnActive : btnBase
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
          type="button"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          className={
            editor.isActive('heading', { level: 3 }) ? btnActive : btnBase
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
          type="button"
        >
          <span className="text-xs font-bold">H3</span>
        </button>

        <Separator />

        {/* Bold / Italic / Underline / Strikethrough */}
        <button
          className={editor.isActive('bold') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
          </svg>
        </button>
        <button
          className={editor.isActive('italic') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4h6l-1 2h-2l-3 12h2l-1 2H5l1-2h2l3-12H9l1-2z" />
          </svg>
        </button>
        <button
          className={editor.isActive('underline') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 3v7a6 6 0 0012 0V3h-2v7a4 4 0 01-8 0V3H6zM4 20h16v2H4v-2z" />
          </svg>
        </button>
        <button
          className={editor.isActive('strike') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 12h18v1H3v-1zm5-1V7a4 4 0 118 0v1h-2V7a2 2 0 00-4 0v4H8zm4 3v4a4 4 0 01-8 0v-1h2v1a2 2 0 004 0v-4h2z" />
          </svg>
        </button>

        <Separator />

        {/* Font size */}
        <div className="relative">
          <button
            className={btnBase}
            onClick={() => {
              closeAllDropdowns();
              setShowFontSize(!showFontSize);
            }}
            title="Font size"
            type="button"
          >
            <span className="flex items-center gap-0.5 text-xs font-medium">
              Size
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {showFontSize && (
            <div className="absolute left-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {FONT_SIZES.map((size) => (
                <button
                  className="block w-full px-4 py-1 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  key={size}
                  onClick={() => {
                    editor.chain().focus().setFontSize(size).run();
                    setShowFontSize(false);
                  }}
                  type="button"
                >
                  {size}
                </button>
              ))}
              <button
                className="block w-full border-t border-slate-100 px-4 py-1 text-left text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={() => {
                  editor.chain().focus().unsetFontSize().run();
                  setShowFontSize(false);
                }}
                type="button"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Font color */}
        <div className="relative">
          <button
            className={btnBase}
            onClick={() => {
              closeAllDropdowns();
              setShowFontColor(!showFontColor);
            }}
            title="Font color"
            type="button"
          >
            <span className="flex flex-col items-center">
              <span className="text-xs font-bold leading-none">A</span>
              <span
                className="mt-0.5 h-1 w-3.5 rounded-sm"
                style={{
                  backgroundColor:
                    (editor.getAttributes('textStyle').color as string) ||
                    '#000',
                }}
              />
            </span>
          </button>
          {showFontColor && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="grid grid-cols-10 gap-0.5">
                {COLORS.map((color) => (
                  <button
                    className="h-4 w-4 rounded-sm border border-slate-300/50 transition hover:scale-125 dark:border-slate-600/50"
                    key={`fc-${color}`}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowFontColor(false);
                    }}
                    style={{ backgroundColor: color }}
                    title={color}
                    type="button"
                  />
                ))}
              </div>
              <button
                className="mt-1.5 w-full rounded px-2 py-0.5 text-center text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowFontColor(false);
                }}
                type="button"
              >
                Reset color
              </button>
            </div>
          )}
        </div>

        {/* Background color */}
        <div className="relative">
          <button
            className={btnBase}
            onClick={() => {
              closeAllDropdowns();
              setShowBgColor(!showBgColor);
            }}
            title="Highlight / Background color"
            type="button"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 14c-.092.064-2 2.083-2 3.5a2 2 0 104 0c0-1.417-1.908-3.436-2-3.5zM9.586 14L2 6.414 3.414 5l2.293 2.293L12.293.707a1 1 0 011.414 0l5.586 5.586a1 1 0 010 1.414L12.707 14H9.586zm3.121-2L16 8.707 12 4.707 5.414 11.293 5.707 12h7z" />
            </svg>
          </button>
          {showBgColor && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="grid grid-cols-10 gap-0.5">
                {COLORS.map((color) => (
                  <button
                    className="h-4 w-4 rounded-sm border border-slate-300/50 transition hover:scale-125 dark:border-slate-600/50"
                    key={`bg-${color}`}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color }).run();
                      setShowBgColor(false);
                    }}
                    style={{ backgroundColor: color }}
                    title={color}
                    type="button"
                  />
                ))}
              </div>
              <button
                className="mt-1.5 w-full rounded px-2 py-0.5 text-center text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowBgColor(false);
                }}
                type="button"
              >
                Reset highlight
              </button>
            </div>
          )}
        </div>

        <Separator />

        {/* Text alignment */}
        <button
          className={
            editor.isActive({ textAlign: 'left' }) ? btnActive : btnBase
          }
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          className={
            editor.isActive({ textAlign: 'center' }) ? btnActive : btnBase
          }
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          className={
            editor.isActive({ textAlign: 'right' }) ? btnActive : btnBase
          }
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
          </svg>
        </button>

        <Separator />

        {/* Lists */}
        <button
          className={editor.isActive('bulletList') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="4" cy="7" r="1.5" />
            <circle cx="4" cy="12" r="1.5" />
            <circle cx="4" cy="17" r="1.5" />
            <path d="M8 6h13v2H8V6zm0 5h13v2H8v-2zm0 5h13v2H8v-2z" />
          </svg>
        </button>
        <button
          className={editor.isActive('orderedList') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 5.5V4h2v3H4V5.5H3zm1 6.5h1.5v.5H4v1h1.5v.5H3v1h3v-4H4v-.5h1.5v-1H3v2zm0 6h1v.5H3v1h1v.5H3v1h3v-1H4.5v-.5H6v-1H4.5V18H6v-1H3v1zM8 6h13v2H8V6zm0 5h13v2H8v-2zm0 5h13v2H8v-2z" />
          </svg>
        </button>

        {/* Blockquote */}
        <button
          className={editor.isActive('blockquote') ? btnActive : btnBase}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.7 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.404-.56-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.7 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.404-.56-2.917-1.179z" />
          </svg>
        </button>

        {/* Horizontal rule */}
        <button
          className={btnBase}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 11h18v2H3v-2z" />
          </svg>
        </button>

        <Separator />

        {/* Link */}
        <div className="relative">
          <button
            className={editor.isActive('link') ? btnActive : btnBase}
            onClick={openLinkInput}
            title="Insert link"
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showLinkInput && (
            <div className="absolute left-0 top-full z-20 mt-1 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <input
                className="w-52 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetLink();
                  }
                }}
                placeholder="https://example.com"
                type="url"
                value={linkUrl}
              />
              <button
                className="rounded-md bg-sky-500 px-2 py-1 text-xs font-medium text-white hover:bg-sky-600"
                onClick={handleSetLink}
                type="button"
              >
                Set
              </button>
              {editor.isActive('link') && (
                <button
                  className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange('link')
                      .unsetLink()
                      .run();
                    setShowLinkInput(false);
                  }}
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inline image — input inside label so file picker works on all devices */}
        <label
          className={`${btnBase} relative cursor-pointer overflow-hidden`}
          title="Insert inline image"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <rect height="18" rx="2" width="18" x="3" y="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <input
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleImageFile}
            type="file"
          />
        </label>

        <Separator />

        {/* Clear formatting */}
        <button
          className={btnBase}
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          title="Clear formatting"
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M4 7h7m-2 9l3-9m6-3l-8 16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 4l4 4m0-4l-4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
