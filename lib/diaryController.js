'use strict';
const validator = require('./diaryValidator');
const util = require('./util');
const prisma = require('./prisma');


async function getDiaryFromRequest(req, res) {
  const id = util.getIdFromQuery(req);

  if (id === null) {
    util.handleNotFound(req, res);
    return null;
  }

  const diary = await prisma.diary.findUnique({
    where: {
      id
    }
  });

  if (!diary) {
    util.handleNotFound(req, res);
    return null;
  }

  return diary;
}

async function index(req, res) {
  if (req.method !== 'GET') {
    util.handleNotFound(req, res);
    return;
  }

  const diaries = await prisma.diary.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  util.render(res, 'diaries/index', {
    title: '日記一覧 - デジタル日記帳',
    heading: '日記一覧',
    diaries
  });
}

function newDiary(req, res) {
  if (req.method !== 'GET') {
    util.handleNotFound(req, res);
    return;
  }

  util.render(res, 'diaries/new', {
    title: '日記作成 - デジタル日記帳',
    heading: '日記作成',
    errors: [],
    formData: {
      diaryDate: '',
      weather: '',
      body: ''
    }
  });
}

async function create(req, res) {
  if (req.method !== 'POST') {
    util.handleNotFound(req, res);
    return;
  }

  const formData = await util.parseBody(req);
  const errors = validator.validateDiary(formData);

  if (errors.length > 0) {
    util.render(res, 'diaries/new', {
      errors,
      formData
    });
    return;
  }

  await prisma.diary.create({
    data: {
      diaryDate: new Date(formData.diaryDate),
      weather: formData.weather,
      body: formData.body
    }
  });

  util.redirect(res, '/diaries');
}

async function show(req, res) {
  if (req.method !== 'GET') {
    util.handleNotFound(req, res);
    return;
  }

  const diary = await getDiaryFromRequest(req, res);

  if (!diary) {
    return;
  }

  util.render(res, 'diaries/show', {
    title: '日記詳細 - デジタル日記帳',
    heading: '日記詳細',
    diary
  });
}

async function edit(req, res) {
  if (req.method !== 'GET') {
    util.handleNotFound(req, res);
    return;
  }

  const diary = await getDiaryFromRequest(req, res);

  if (!diary) {
    return;
  }

  util.render(res, 'diaries/edit', {
    title: '日記編集 - デジタル日記帳',
    heading: '日記編集',
    errors: [],
    diary,
    formData: {
      diaryDate: diary.diaryDate.toISOString().slice(0, 10),
      weather: diary.weather,
      body: diary.body
    }
  });
}

async function update(req, res) {
  if (req.method !== 'POST') {
    util.handleNotFound(req, res);
    return;
  }

  const diary = await getDiaryFromRequest(req, res);

  if (!diary) {
    return;
  }

  const formData = await util.parseBody(req);
  const errors = validator.validateDiary(formData);

  if (errors.length > 0) {
    util.render(res, 'diaries/edit', {
      errors,
      diary,
      formData
    });
    return;
  }

  await prisma.diary.update({
    where: {
      id: diary.id
    },
    data: {
      diaryDate: new Date(formData.diaryDate),
      weather: formData.weather,
      body: formData.body
    }
  });

  util.redirect(res, `/diaries/show?id=${diary.id}`);
}

async function deleteDiary(req, res) {
  if (req.method !== 'POST') {
    util.handleNotFound(req, res);
    return;
  }

  const diary = await getDiaryFromRequest(req, res);

  if (!diary) {
    return;
  }

  await prisma.diary.delete({
    where: {
      id: diary.id
    }
  });

  util.redirect(res, '/diaries');
}

module.exports = {
  index,
  new: newDiary,
  create,
  show,
  edit,
  update,
  delete: deleteDiary
};