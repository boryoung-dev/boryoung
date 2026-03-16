"use client";

import { useState, useRef, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ImportResult {
  title: string;
  success: boolean;
  error?: string;
  slug?: string;
}

interface ParseError {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  summary: { total: number; success: number; failed: number };
  results?: ImportResult[];
  parseErrors?: ParseError[];
  error?: string;
}

type UploadStatus = "idle" | "uploading" | "parsing" | "saving" | "done" | "error";

export default function ProductImportPage() {
  const { authHeaders } = useAdminAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다");
      return;
    }
    setFile(f);
    setResponse(null);
    setStatus("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("parsing");

      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: authHeaders as Record<string, string>,
        body: formData,
      });

      setStatus("saving");

      const data: ImportResponse = await res.json();
      setResponse(data);
      setStatus(data.success ? "done" : "error");
    } catch {
      setResponse({ success: false, message: "업로드 중 오류가 발생했습니다", summary: { total: 0, success: 0, failed: 0 } });
      setStatus("error");
    }
  };

  const statusConfig: Record<UploadStatus, { text: string; color: string }> = {
    idle: { text: "", color: "" },
    uploading: { text: "파일 업로드 중...", color: "text-blue-600" },
    parsing: { text: "엑셀 파싱 중...", color: "text-blue-600" },
    saving: { text: "DB 저장 중...", color: "text-blue-600" },
    done: { text: "완료!", color: "text-green-600" },
    error: { text: "오류 발생", color: "text-red-600" },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-[color:var(--fg)]">상품 엑셀 일괄 등록</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">
          상품등록 템플릿 엑셀 파일을 업로드하여 상품을 일괄 등록합니다.
        </p>
      </div>

      {/* 업로드 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
            : file
              ? "border-green-400 bg-green-50"
              : "border-[color:var(--border)] hover:border-[color:var(--brand)] hover:bg-[color:var(--surface)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet className="w-12 h-12 text-green-500" />
            <div>
              <p className="text-sm font-medium text-[color:var(--fg)]">{file.name}</p>
              <p className="text-xs text-[color:var(--muted)] mt-1">
                {(file.size / 1024).toFixed(1)} KB — 다른 파일을 선택하려면 클릭하세요
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-[color:var(--muted)]" />
            <div>
              <p className="text-sm font-medium text-[color:var(--fg)]">
                엑셀 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="text-xs text-[color:var(--muted)] mt-1">.xlsx, .xls 파일 지원</p>
            </div>
          </div>
        )}
      </div>

      {/* 업로드 버튼 + 상태 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={!file || (status !== "idle" && status !== "done" && status !== "error")}
          className="px-6 py-2.5 bg-[color:var(--brand)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
        >
          {status === "uploading" || status === "parsing" || status === "saving" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          일괄 등록 시작
        </button>

        {status !== "idle" && (
          <span className={`text-sm font-medium ${statusConfig[status].color}`}>
            {statusConfig[status].text}
          </span>
        )}
      </div>

      {/* 결과 요약 */}
      {response && (
        <div className="space-y-4">
          {/* 요약 카드 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[color:var(--fg)]">{response.summary.total}</p>
              <p className="text-xs text-[color:var(--muted)] mt-1">전체</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{response.summary.success}</p>
              <p className="text-xs text-green-600 mt-1">성공</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${
              response.summary.failed > 0
                ? "bg-red-50 border border-red-200"
                : "bg-[color:var(--bg)] border border-[color:var(--border)]"
            }`}>
              <p className={`text-2xl font-bold ${response.summary.failed > 0 ? "text-red-600" : "text-[color:var(--muted)]"}`}>
                {response.summary.failed}
              </p>
              <p className={`text-xs mt-1 ${response.summary.failed > 0 ? "text-red-600" : "text-[color:var(--muted)]"}`}>
                실패
              </p>
            </div>
          </div>

          {/* 상품별 결과 */}
          {response.results && response.results.length > 0 && (
            <div className="bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[color:var(--border)]">
                <h3 className="text-sm font-semibold text-[color:var(--fg)]">상품별 처리 결과</h3>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {response.results.map((r, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center gap-3">
                    {r.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[color:var(--fg)] truncate">{r.title}</p>
                      {r.success && r.slug && (
                        <p className="text-xs text-[color:var(--muted)]">slug: {r.slug}</p>
                      )}
                      {r.error && (
                        <p className="text-xs text-red-500">{r.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 파싱 에러 */}
          {response.parseErrors && response.parseErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-amber-700">파싱 경고</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="px-4 py-2 text-left text-amber-700">시트</th>
                      <th className="px-4 py-2 text-left text-amber-700">행</th>
                      <th className="px-4 py-2 text-left text-amber-700">컬럼</th>
                      <th className="px-4 py-2 text-left text-amber-700">메시지</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {response.parseErrors.map((err, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-amber-800">{err.sheet}</td>
                        <td className="px-4 py-2 text-amber-800">{err.row}</td>
                        <td className="px-4 py-2 text-amber-800">{err.column}</td>
                        <td className="px-4 py-2 text-amber-800">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API 에러 */}
          {response.error && !response.results && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">오류</p>
                <p className="text-sm text-red-600 mt-1">{response.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 안내 */}
      <div className="bg-[color:var(--surface)] rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[color:var(--fg)]">사용 안내</h3>
        <ul className="text-xs text-[color:var(--muted)] space-y-1 list-disc pl-4">
          <li>상품등록 템플릿 엑셀 파일을 사용해주세요.</li>
          <li>예시 데이터(회색 행)를 삭제한 후 실제 데이터를 입력합니다.</li>
          <li>모든 시트에서 상품명이 동일해야 데이터가 올바르게 매칭됩니다.</li>
          <li>이미지는 파일명만 등록되며, 실제 이미지 업로드는 상품 편집 페이지에서 해주세요.</li>
          <li>드롭다운의 괄호 안 값이 DB에 저장됩니다. (예: &quot;베트남(vietnam)&quot; → vietnam)</li>
        </ul>
      </div>
    </div>
  );
}
