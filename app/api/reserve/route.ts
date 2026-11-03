import { NextResponse } from 'next/server';
import { courses } from '@/data/courses';
import fs from 'fs';
import path from 'path';

// .env 또는 서버 환경변수에서 SHEET_URL 가져오기
function getSheetUrl(): string {
  if (process.env.SHEET_URL) {
    return process.env.SHEET_URL.trim();
  }
  // 서버 재시작 전에도 .env 파일에서 즉시 읽어올 수 있도록 지원
  try {
    const rootEnv = path.join(process.cwd(), '.env');
    if (fs.existsSync(rootEnv)) {
      const content = fs.readFileSync(rootEnv, 'utf-8');
      const match = content.match(/SHEET_URL=(.+)/);
      if (match) return match[1].trim();
    }
    const publicEnv = path.join(process.cwd(), 'public', '.env');
    if (fs.existsSync(publicEnv)) {
      const content = fs.readFileSync(publicEnv, 'utf-8');
      const match = content.match(/SHEET_URL=(.+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {
    console.error('Error reading .env file:', e);
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, course: courseName, name, phone, people } = body;

    // 1. 필수값 유효성 검사
    if (!courseName || !name || !phone || !people) {
      return NextResponse.json(
        { error: '필수 입력 항목(강좌, 이름, 연락처, 인원)이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 2. 서버 강좌 데이터에서 해당 강좌 조회
    const targetCourse = courses.find((c) => c.name === courseName);
    if (!targetCourse) {
      return NextResponse.json(
        { error: '해당 강좌를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 결제 금액(total) 계산: 화면 전송값이 아닌 서버 강좌 수강료 × 인원으로 계산
    const numPeople = Number(people) || 1;
    const total = targetCourse.price * numPeople;

    // 4. .env에서 SHEET_URL 가져오기
    let sheetUrl = getSheetUrl();
    if (!sheetUrl) {
      return NextResponse.json(
        { error: '.env에 SHEET_URL이 설정되어 있지 않습니다.' },
        { status: 500 }
      );
    }

    // 혹시라도 중복 주소(https://script.google.com/macros/s/https://...)로 복사된 경우 앞부분 정리
    if (sheetUrl.includes('https://script.googleusercontent.com')) {
      const idx = sheetUrl.indexOf('https://script.googleusercontent.com');
      sheetUrl = sheetUrl.slice(idx);
    }

    // 5. 구글 시트로 보낼 JSON 데이터 구성
    const payload = {
      date: date || targetCourse.date,
      course: targetCourse.name,
      name: String(name).trim(),
      phone: String(phone).trim(),
      people: numPeople,
      total: total,
    };

    // 6. 서버 측에서 구글 시트로 직접 전송 (브라우저에 SHEET_URL이 노출되지 않음)
    const sheetResponse = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    let sheetResult;
    try {
      sheetResult = await sheetResponse.json();
    } catch {
      sheetResult = { result: 'ok' };
    }

    return NextResponse.json({
      result: 'ok',
      message: '예약이 성공적으로 접수되었습니다.',
      data: payload,
      sheetResult,
    });
  } catch (error: any) {
    console.error('API /api/reserve Error:', error);
    return NextResponse.json(
      { error: '예약 처리 중 서버 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
