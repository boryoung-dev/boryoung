"use client";

import { Plus, Edit2, Trash2, Package, GripVertical } from "lucide-react";

// 카테고리별 색상 팔레트
const COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", icon: "text-blue-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700", icon: "text-purple-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-700", icon: "text-rose-500" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700", icon: "text-cyan-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700", icon: "text-orange-500" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700", icon: "text-indigo-500" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-700", icon: "text-teal-500" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-100 text-pink-700", icon: "text-pink-500" },
  { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-700", icon: "text-gray-500" },
];

interface CategoryTreeProps {
  categories: any[];
  onAdd: (parent?: any) => void;
  onEdit: (category: any) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoryTree({ categories, onAdd, onEdit, onDelete }: CategoryTreeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {categories.map((cat, index) => {
        const color = COLORS[index % COLORS.length];
        const productCount = cat._count?.products ?? 0;
        const hasChildren = cat.children && cat.children.length > 0;

        return (
          <div
            key={cat.id}
            className={`rounded-xl border-2 ${color.border} ${color.bg} overflow-hidden transition-shadow hover:shadow-md`}
          >
            {/* 카드 헤더 */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold ${color.text} truncate`}>
                      {cat.name}
                    </h3>
                    {!cat.isActive && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                  <button
                    onClick={() => onEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(cat.id, cat.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white/80 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 상품 수 */}
              <div className="flex items-center gap-3 mt-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${color.badge} text-xs font-semibold`}>
                  <Package className="w-3 h-3" />
                  {productCount}개 상품
                </div>
                {cat.description && (
                  <span className="text-xs text-gray-400 truncate">{cat.description}</span>
                )}
              </div>
            </div>

            {/* 하위 카테고리 */}
            {hasChildren && (
              <div className="px-5 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {cat.children.map((child: any) => (
                    <button
                      key={child.id}
                      onClick={() => onEdit(child)}
                      className="group inline-flex items-center gap-1 px-2.5 py-1 bg-white/70 hover:bg-white rounded-lg text-xs text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <span>{child.name}</span>
                      {child._count?.products > 0 && (
                        <span className="text-gray-400 group-hover:text-gray-500">
                          ({child._count.products})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 하위 추가 버튼 */}
            <div className="px-5 pb-4">
              <button
                onClick={() => onAdd(cat)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3 h-3" /> 하위 카테고리 추가
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
