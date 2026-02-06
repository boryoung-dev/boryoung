"use client";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  requests: string;
}

interface BookingContactFormProps {
  contactInfo: ContactInfo;
  onChange: (info: ContactInfo) => void;
}

export function BookingContactForm({
  contactInfo,
  onChange,
}: BookingContactFormProps) {
  const update = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contactInfo, [field]: value });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        예약자 정보
      </label>
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="이름 *"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="연락처 * (010-1234-5678)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="이메일 (선택)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <textarea
            value={contactInfo.requests}
            onChange={(e) => update("requests", e.target.value)}
            placeholder="요청사항 (선택)"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}
