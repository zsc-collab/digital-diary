'use strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';
const AUTH = process.env.BASIC_AUTH || 'GM:1111';

const authHeader = `Basic ${Buffer.from(AUTH).toString('base64')}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`NG: ${message}`);
  }

  console.log(`OK: ${message}`);
}

async function request(path, options = {}) {
  const headers = {
    Authorization: authHeader,
    ...(options.headers || {})
  };

  return await fetch(`${BASE_URL}${path}`, {
    redirect: options.redirect || 'follow',
    ...options,
    headers
  });
}

async function postForm(path, data) {
  return await request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data).toString()
  });
}

async function getText(path, options = {}) {
  const res = await request(path, options);
  const text = await res.text();

  return {
    res,
    text
  };
}

function extractDiaryIds(html) {
  const ids = [];
  const regexp = /\/diaries\/show\?id=(\d+)/g;

  let match;
  while ((match = regexp.exec(html)) !== null) {
    ids.push(Number(match[1]));
  }

  return [...new Set(ids)];
}

async function findDiaryIdByBodyMarker(marker) {
  const { res, text } = await getText('/diaries');

  assert(res.status === 200, '一覧画面を取得できる');

  const ids = extractDiaryIds(text);

  for (const id of ids) {
    const detail = await getText(`/diaries/show?id=${id}`);

    if (detail.res.status === 200 && detail.text.includes(marker)) {
      return id;
    }
  }

  return null;
}

async function main() {
  console.log('=== デジタル日記帳 簡易検証開始 ===');

  const list = await getText('/diaries');
  assert(list.res.status === 200, 'GET /diaries が成功する');

  const createByGet = await getText('/diaries/create', {
    redirect: 'manual'
  });
  assert(createByGet.res.status === 404, 'GET /diaries/create は拒否される');

  const updateByGet = await getText('/diaries/update?id=1', {
    redirect: 'manual'
  });
  assert(updateByGet.res.status === 404, 'GET /diaries/update は拒否される');

  const deleteByGet = await getText('/diaries/delete?id=1', {
    redirect: 'manual'
  });
  assert(deleteByGet.res.status === 404, 'GET /diaries/delete は拒否される');

  const invalidWeather = await postForm('/diaries/create', {
    diaryDate: '2026-05-28',
    weather: '宇宙嵐',
    body: '不正な天気テスト'
  });

  const invalidWeatherText = await invalidWeather.text();
  assert(invalidWeather.status === 200, '不正な天気のPOSTに対して画面が返る');
  assert(
    invalidWeatherText.includes('天気の値が不正です。'),
    '不正な天気がサーバー側で拒否される'
  );

  const marker = `SECURITY_TEST_${Date.now()}`;
  const xssBody = `${marker} <script>alert("xss")</script>`;

  const create = await postForm('/diaries/create', {
    diaryDate: '2026-05-28',
    weather: '晴れ',
    body: xssBody
  });

  assert(create.status === 200, '正常な日記作成後に一覧画面へ到達する');

  const createdId = await findDiaryIdByBodyMarker(marker);
  assert(createdId !== null, '作成した日記を一覧・詳細から確認できる');

  const detail = await getText(`/diaries/show?id=${createdId}`);
  assert(detail.res.status === 200, '作成した日記の詳細を表示できる');

  assert(
    !detail.text.includes('<script>alert("xss")</script>'),
    '本文中のscriptタグが生HTMLとして出力されていない'
  );

  assert(
    detail.text.includes('&lt;script&gt;') || detail.text.includes('&lt;script'),
    '本文中のscriptタグがエスケープされている'
  );

  const invalidId = await getText('/diaries/show?id=abc');
  assert(invalidId.res.status === 404, '不正なID文字列は404になる');

  const missingId = await getText('/diaries/show?id=999999999');
  assert(missingId.res.status === 404, '存在しないIDは404になる');

  const updatedMarker = `${marker}_UPDATED`;

  const update = await postForm(`/diaries/update?id=${createdId}`, {
    diaryDate: '2026-05-29',
    weather: '曇り',
    body: updatedMarker
  });

  assert(update.status === 200, '日記更新後に詳細画面へ到達する');

  const updatedDetail = await getText(`/diaries/show?id=${createdId}`);
  assert(
    updatedDetail.text.includes(updatedMarker),
    '更新した本文が詳細画面に反映される'
  );

  const deleteResult = await postForm(`/diaries/delete?id=${createdId}`, {});
  assert(deleteResult.status === 200, '日記削除後に一覧画面へ到達する');

  const deletedDetail = await getText(`/diaries/show?id=${createdId}`);
  assert(deletedDetail.res.status === 404, '削除した日記は詳細表示できない');

  console.log('=== すべての簡易検証が完了しました ===');
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});