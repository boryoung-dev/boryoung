"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** 모달 크기 옵션 */
type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  children: React.ReactNode;
  /** 푸터 영역 (취소/저장 버튼 등) */
  footer?: React.ReactNode;
}

/**
 * 공통 모달 컴포넌트
 * - 백드롭, 헤더, 바디, 푸터를 통일된 스타일로 제공
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* 모달 컨테이너 */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* 바디 */}
        <div className="p-6 space-y-4">{children}</div>
        {/* 푸터 */}
        {footer && (
          <div className="flex gap-3 p-6 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** 모달 취소 버튼 스타일 */
export function ModalCancelButton({
  onClick,
  children = "취소",
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
    >
      {children}
    </button>
  );
}

/** 모달 확인/저장 버튼 스타일 */
export function ModalConfirmButton({
  onClick,
  type = "button",
  disabled = false,
  children = "저장",
}: {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}
