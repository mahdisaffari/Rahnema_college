import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(), // ذخیره توی حافظه، نه دیسک
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر ۵ مگابایت
});