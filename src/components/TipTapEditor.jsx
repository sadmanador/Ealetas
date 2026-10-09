'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Undo,
  Redo,
  Upload,
} from 'lucide-react';

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[350px] p-4 text-[#0d2342]',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImageUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-[#d2e2f6] rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Toolbar */}
      <div className="bg-[#f8fbfe] border-b border-[#e4edf8] p-2 flex flex-wrap items-center gap-1.5 text-xs text-[#0d2342]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('bold') ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('italic') ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#d2e2f6] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#d2e2f6] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('bulletList') ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('orderedList') ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-md hover:bg-[#e0edfb] transition-colors ${
            editor.isActive('blockquote') ? 'bg-[#0f388a] text-white' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#d2e2f6] mx-1" />

        {/* Insert Image via URL */}
        <button
          type="button"
          onClick={addImageUrl}
          className="p-2 rounded-md hover:bg-[#e0edfb] transition-colors flex items-center gap-1"
          title="Insert Image by URL"
        >
          <ImageIcon className="w-4 h-4 text-[#0f388a]" />
          <span className="hidden sm:inline text-[11px] font-medium">Image URL</span>
        </button>

        {/* Upload Image anywhere */}
        <label
          className="p-2 rounded-md hover:bg-[#e0edfb] transition-colors flex items-center gap-1 cursor-pointer"
          title="Upload image from device"
        >
          <Upload className="w-4 h-4 text-[#0f388a]" />
          <span className="hidden sm:inline text-[11px] font-medium">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        <div className="w-px h-5 bg-[#d2e2f6] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-md hover:bg-[#e0edfb] transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-md hover:bg-[#e0edfb] transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
