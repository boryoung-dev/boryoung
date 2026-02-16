'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface BookingDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  peopleCount: number;
  desiredDate: string | null;
  requests: string | null;
  status: string;
  adminMemo: string | null;
  tourProduct: {
    id: string;
    title: string;
    destination: string;
    thumbnail: string | null;
    price: number | null;
    duration: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage() {
  const { id: bookingId } = useParams() as { id: string };
  const { authHeaders } = useAdminAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminMemo, setAdminMemo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchBooking();
    }
  }, [bookingId, authHeaders]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, { headers: authHeaders as any });
      const data = await response.json();
      
      if (data.success) {
        setBooking(data.booking);
        setNewStatus(data.booking.status);
        setAdminMemo(data.booking.adminMemo || '');
      }
    } catch (error) {
      console.error('Booking fetch error:', error);
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!booking) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        } as any,
        body: JSON.stringify({
          status: newStatus,
          adminMemo,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('예약 정보가 업데이트되었습니다');
        fetchBooking();
      } else {
        alert(result.error || '업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('업데이트 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'text-yellow-600',
      CONFIRMED: 'text-blue-600',
      COMPLETED: 'text-green-600',
      CANCELLED: 'text-red-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };
  
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/bookings"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← 예약 목록
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                예약 상세
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 예약 정보 */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
              예약자 정보
            </h2>
            
            <div>
              <label className="text-sm text-gray-600">이름</label>
              <div className="mt-1 text-lg font-semibold">{booking.name}</div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">전화번호</label>
              <div className="mt-1 text-lg">
                <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
                  {booking.phone}
                </a>
              </div>
            </div>
            
            {booking.email && (
              <div>
                <label className="text-sm text-gray-600">이메일</label>
                <div className="mt-1 text-lg">
                  <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">
                    {booking.email}
                  </a>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-600">인원 수</label>
              <div className="mt-1 text-lg font-semibold">{booking.peopleCount}명</div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">희망 출발일</label>
              <div className="mt-1 text-lg">
                {booking.desiredDate
                  ? new Date(booking.desiredDate).toLocaleDateString()
                  : '미정'}
              </div>
            </div>
            
            {booking.requests && (
              <div>
                <label className="text-sm text-gray-600">요청사항</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {booking.requests}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="text-xs text-gray-500">
                신청일: {new Date(booking.createdAt).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                수정일: {new Date(booking.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* 상품 정보 + 상태 관리 */}
          <div className="space-y-6">
            {/* 상품 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">상품 정보</h2>
              
              {booking.tourProduct.thumbnail && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={booking.tourProduct.thumbnail}
                    alt={booking.tourProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">상품명</div>
                  <div className="font-semibold">{booking.tourProduct.title}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">목적지</div>
                  <div>{booking.tourProduct.destination}</div>
                </div>
                
                {booking.tourProduct.duration && (
                  <div>
                    <div className="text-sm text-gray-600">여행 기간</div>
                    <div>{booking.tourProduct.duration}</div>
                  </div>
                )}
                
                {booking.tourProduct.price && (
                  <div>
                    <div className="text-sm text-gray-600">가격</div>
                    <div className="text-lg font-bold text-blue-600">
                      {booking.tourProduct.price.toLocaleString()}원
                    </div>
                  </div>
                )}
                
                <Link
                  href={`/tours/${booking.tourProduct.id}`}
                  target="_blank"
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  상품 페이지 보기 →
                </Link>
              </div>
            </div>
            
            {/* 상태 관리 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">상태 관리</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    예약 상태
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">접수</option>
                    <option value="CONFIRMED">확정</option>
                    <option value="COMPLETED">완료</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    관리자 메모
                  </label>
                  <textarea
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="내부 메모 (고객에게 노출되지 않습니다)"
                  />
                </div>
                
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? '저장 중...' : '변경 사항 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
