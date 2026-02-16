"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  compact?: boolean;
}

const PRESET_COLORS = [
  "#000000", "#374151", "#6b7280", "#dc2626", "#ea580c",
  "#d97706", "#16a34a", "#0891b2", "#2563eb", "#7c3aed",
  "#db2777",
];

export function TiptapEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요...",
  minHeight = "200px",
  compact = false,
}: TiptapEditorProps) {
  const { authHeaders } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products/content");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: authHeaders as any,
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          alert(data.error || "이미지 업로드 실패");
        }
      } catch {
        alert("이미지 업로드 중 오류가 발생했습니다");
      }
    },
    [editor, authHeaders]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
      e.target.value = "";
    },
    [handleImageUpload]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("이미지 URL을 입력하세요");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden tiptap-editor-wrapper focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* 텍스트 포맷 */}
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="굵게"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="기울임"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="밑줄"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        {!compact && (
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="취소선"
          >
            <span className="line-through">S</span>
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* 제목 (full 모드만) */}
        {!compact && (
          <>
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="제목 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="제목 3"
            >
              H3
            </ToolbarButton>
            <ToolbarDivider />
          </>
        )}

        {/* 리스트 */}
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="순서 없는 목록"
        >
          &#8226;
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="순서 있는 목록"
        >
          1.
        </ToolbarButton>

        {/* 정렬 (full 모드만) */}
        {!compact && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="왼쪽 정렬"
            >
              &#9776;
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="가운데 정렬"
            >
              &#9744;
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="오른쪽 정렬"
            >
              &#9782;
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />

        {/* 링크 */}
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={addLink}
          title="링크"
        >
          &#128279;
        </ToolbarButton>

        {/* 이미지 */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="이미지 업로드"
        >
          &#128247;
        </ToolbarButton>
        {!compact && (
          <ToolbarButton onClick={addImageByUrl} title="이미지 URL">
            &#127748;
          </ToolbarButton>
        )}

        {/* 테이블 (full 모드만) */}
        {!compact && (
          <>
            <ToolbarDivider />
            <ToolbarButton onClick={insertTable} title="표 삽입">
              &#9638;
            </ToolbarButton>
            {editor.isActive("table") && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="열 추가"
                >
                  +열
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="열 삭제"
                >
                  -열
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="행 추가"
                >
                  +행
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="행 삭제"
                >
                  -행
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="표 삭제"
                >
                  &#128465;
                </ToolbarButton>
              </>
            )}
          </>
        )}

        {/* 추가 기능 (full 모드만) */}
        {!compact && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="코드 블록"
            >
              &lt;/&gt;
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="인용구"
            >
              &#8220;
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="구분선"
            >
              &#8212;
            </ToolbarButton>
          </>
        )}

        {/* 색상 (full 모드만) */}
        {!compact && (
          <>
            <ToolbarDivider />
            <ColorPicker
              colors={PRESET_COLORS}
              onSelect={(color) => editor.chain().focus().setColor(color).run()}
              onReset={() => editor.chain().focus().unsetColor().run()}
              title="텍스트 색상"
            />
            <ToolbarButton
              active={editor.isActive("highlight")}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="형광펜"
            >
              &#9997;
            </ToolbarButton>
          </>
        )}
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} />
    </div>
  );
}

/* 툴바 버튼 컴포넌트 */
function ToolbarButton({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-sm rounded transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

/* 구분선 */
function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-300 mx-1" />;
}

/* 색상 선택기 */
function ColorPicker({
  colors,
  onSelect,
  onReset,
  title,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  onReset: () => void;
  title?: string;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="px-2 py-1 text-sm rounded text-gray-600 hover:bg-gray-200"
        title={title}
      >
        A<span className="text-[8px]">&#9660;</span>
      </button>
      <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden group-hover:grid grid-cols-4 gap-1 w-fit">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <button
          type="button"
          onClick={onReset}
          className="w-6 h-6 rounded border border-gray-200 text-[10px] text-gray-400 hover:bg-gray-100"
          title="색상 초기화"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
