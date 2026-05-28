'use strict';

const allowedWeathers = ['晴れ', '曇り', '雨', '雪', 'その他'];

function validateDiary(formData) {
  const errors = [];

  if (!formData.diaryDate) {
    errors.push('日付を入力してください。');
  }

  if (!formData.weather) {
    errors.push('天気を選択してください。');
  } else if (!allowedWeathers.includes(formData.weather)) {
    errors.push('天気の値が不正です。');
  }

  if (!formData.body || formData.body.trim() === '') {
    errors.push('本文を入力してください。');
  } else if (formData.body.length > 1000) {
    errors.push('本文は1000文字以内で入力してください。');
  }

  return errors;
}

module.exports = {
  validateDiary
};