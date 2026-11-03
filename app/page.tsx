'use client';

import { useState } from 'react';
import { courses } from '@/data/courses';

interface Course {
  id: number;
  name: string;
  price: number;
  seat: number;
  booked: number;
  date: string;
  tags: string[];
}

export default function Home() {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 모달 폼 입력 상태
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    people: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 예약 가능한 강좌만 보기 필터링 (남은 좌석 > 0)
  const filteredCourses = onlyAvailable
    ? courses.filter((course) => course.seat - course.booked > 0)
    : courses;

  // 모달 열기 핸들러
  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: '',
      phone: '',
      people: 1,
    });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    if (isSubmitting) return;
    setSelectedCourse(null);
  };

  // [신청] 버튼 클릭 시 서버 API(/api/reserve)로 예약 데이터 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || isSubmitting) return;

    if (!formData.name.trim()) {
      alert('이름을 입력해 주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('연락처를 입력해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedCourse.date,
          course: selectedCourse.name,
          name: formData.name,
          phone: formData.phone,
          people: formData.people,
        }),
      });

      const result = await response.json();

      if (response.ok && result.result === 'ok') {
        alert(`${selectedCourse.name} 강좌 예약 신청이 완료되었습니다!`);
        handleCloseModal();
      } else {
        alert(`예약 실패: ${result.error || '잠시 후 다시 시도해 주세요.'}`);
      }
    } catch (error: any) {
      alert(`요청 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0d1b2a] text-white p-6 md:p-12 relative">
      <div className="w-full max-w-6xl flex flex-col items-center gap-10 animate-fade-in-up mt-10">
        {/* 상단 소개 영역 */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            스킬투머니
          </h1>
          <p className="text-lg text-gray-300 font-light break-keep">
            배운 기술이 돈이 되는 원데이 클래스
          </p>
        </div>

        {/* 필터 영역: 예약 가능한 강좌만 보기 */}
        <div className="w-full flex justify-end items-center">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-gray-200 bg-[#1a2b40] hover:bg-[#203650] px-4 py-2.5 rounded-xl border border-[#2a3f5a] shadow-md transition-all">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-yellow-400 bg-[#0f1d2d] border-[#2a3f5a] accent-yellow-400 cursor-pointer"
            />
            <span>예약 가능한 강좌만 보기</span>
          </label>
        </div>

        {/* 강좌 목록 카드 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredCourses.map((course) => {
            const remaining = course.seat - course.booked;
            const isClosed = remaining === 0;
            const isImminent = remaining >= 1 && remaining <= 2;

            return (
              <div
                key={course.id}
                className="bg-[#1a2b40] rounded-2xl p-6 shadow-xl border border-[#2a3f5a] flex flex-col justify-between items-center text-center hover:border-yellow-400/70 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-6 w-full flex flex-col items-center">
                  {/* 개강 일자 */}
                  <span className="text-xs text-gray-400 font-medium mb-2">
                    {course.date}
                  </span>

                  {/* 강좌 이름 */}
                  <h2 className="text-xl font-semibold mb-2">{course.name}</h2>

                  {/* 강좌 이름 아래: 작은 배지 목록 */}
                  <div className="flex flex-wrap justify-center gap-1.5 mb-3 min-h-[26px]">
                    {course.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-[#0f1d2d] text-cyan-300 border border-cyan-800/60 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 가격 */}
                  <p className="text-2xl text-yellow-400 font-bold mb-4">
                    {typeof course.price === 'number' ? course.price.toLocaleString() : course.price}원
                  </p>

                  {/* 좌석 현황: 남은 좌석 ○석 / 정원 ○명 */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-xs">
                    <span className={isClosed ? "text-gray-400 font-medium" : isImminent ? "text-red-500 font-bold" : "text-emerald-400 font-semibold"}>
                      남은 좌석 {remaining}석
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-300">
                      정원 {course.seat}명
                    </span>
                  </div>

                  {/* 상태 표시 (마감 / 마감 임박) */}
                  <div className="h-7 mt-2 flex items-center justify-center">
                    {isClosed && (
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                        마감
                      </span>
                    )}
                    {isImminent && (
                      <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                        마감 임박
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={isClosed}
                  onClick={() => !isClosed && handleOpenModal(course)}
                  className={`w-full py-3.5 text-base font-bold rounded-xl transition-all shadow-md ${isClosed
                      ? 'bg-gray-700/60 text-gray-400 cursor-not-allowed border border-gray-600/50'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0d1b2a] hover:from-yellow-400 hover:to-yellow-300 active:scale-95 cursor-pointer'
                    }`}
                >
                  {isClosed ? '예약 마감' : '예약하기'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 예약 신청 모달 창 */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="bg-[#16273b] border border-[#2a3f5a] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 상단 */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#2a3f5a]">
              <h3 className="text-xl font-bold text-white">예약 신청</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl leading-none p-1 transition-colors cursor-pointer"
                aria-label="닫기"
              >
                &times;
              </button>
            </div>

            {/* 모달 입력 양식 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 강좌 이름 (자동 채움) */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  강좌 이름
                </label>
                <input
                  type="text"
                  value={selectedCourse.name}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-yellow-400 text-sm focus:outline-none cursor-not-allowed font-semibold"
                />
              </div>

              {/* 일정 (자동 채움) */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  일정
                </label>
                <input
                  type="text"
                  value={selectedCourse.date}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-gray-300 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  이름 <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  연락처 <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* 인원 (숫자) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    인원 <span className="text-yellow-400">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    (남은 좌석: {selectedCourse.seat - selectedCourse.booked}석)
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedCourse.seat - selectedCourse.booked}
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: Number(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1d2d] border border-[#2a3f5a] text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* 결제 금액 안내 */}
              <div className="pt-2 pb-1 flex justify-between items-center text-sm border-t border-[#2a3f5a]/60">
                <span className="text-gray-400">결제 예정 금액</span>
                <span className="text-lg font-bold text-yellow-400">
                  {(selectedCourse.price * (formData.people || 1)).toLocaleString()}원
                </span>
              </div>

              {/* 하단 버튼: [닫기] [신청] */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-[#243750] hover:bg-[#2e4564] text-gray-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0d1b2a] text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '신청 중...' : '신청'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
