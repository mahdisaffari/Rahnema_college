import { isNonEmptyString, isEmail, isPassword } from '../../utils/validators';

export const validateProfileUpdate = ({ firstname, lastname, bio, avatar, email, password }: {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: Express.Multer.File; // تغییر به فایل
  email?: string;
  password?: string;
}): string | null => {
  if (firstname && (!isNonEmptyString(firstname) || firstname.length > 50))
    return 'نام باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)';
  if (lastname && (!isNonEmptyString(lastname) || lastname.length > 50))
    return 'نام خانوادگی باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)';
  if (bio && (!isNonEmptyString(bio) || bio.length > 500))
    return 'بیوگرافی باید رشته غیرخالی باشد (حداکثر 500 کاراکتر)';
  if (email && (!isNonEmptyString(email) || !isEmail(email)))
    return 'ایمیل معتبر نیست';
  if (password && (!isNonEmptyString(password) || !isPassword(password)))
    return 'پسورد ضعیف است';
  if (avatar && !avatar.mimetype.startsWith('image/'))
    return 'فقط فایل‌های تصویری مجاز هستند';
  if (avatar && avatar.size > 5 * 1024 * 1024)
    return 'سایز فایل باید کمتر از ۵ مگابایت باشد';
  return null;
};