"use client";

import { ChevronRight, Plus, Edit2, Trash2, FolderOpen, Folder } from "lucide-react";
import { useState } from "react";

interface CategoryTreeProps {
  categories: any[];
  onAdd: (parent?: any) => void;
  onEdit: (category: any) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoryTree({ categories, onAdd, onEdit, onDelete }: CategoryTreeProps) {
  return (
    <div className="divide-y">
      {categories.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          depth={0}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CategoryNode({
  category,
  depth,
  onAdd,
  onEdit,
  onDelete,
}: {
  category: any;
  depth: number;
  onAdd: (parent?: any) => void;
  onEdit: (category: any) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
        style={{ paddingLeft: `${24 + depth * 24}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <span className="w-5" />
          )}

          {hasChildren && expanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-gray-400" />
          )}

          <span className="text-sm font-medium text-gray-900">{category.name}</span>
          <span className="text-xs text-gray-400">({category.slug})</span>

          {category._count?.products > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {category._count.products}개 상품
            </span>
          )}

          {!category.isActive && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              비활성
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {depth < 2 && (
            <button
              onClick={() => onAdd(category)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="하위 카테고리 추가"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category.id, category.name)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {category.children.map((child: any) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
