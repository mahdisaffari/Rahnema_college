import { isEmail, isNonEmptyString, isPassword, isValidUrl } from "../../utils/validators";

export const validateProfileUpdate = ({ firstname, lastname, bio, avatar, email, password }: {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  password?: string;
}): string | null => {
  if (firstname && (!isNonEmptyString(firstname) || firstname.length > 50))
    return "نام باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)";
  if (lastname && (!isNonEmptyString(lastname) || lastname.length > 50))
    return "نام خانوادگی باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)";
  if (bio && (!isNonEmptyString(bio) || bio.length > 500))
    return "بیوگرافی باید رشته غیرخالی باشد (حداکثر 500 کاراکتر)";
  if (email && (!isNonEmptyString(email) || !isEmail(email)))
    return "ایمیل معتبر نیست";
  if (password && (!isNonEmptyString(password) || !isPassword(password)))
    return "پسورد ضعیف است";
  /**
   * if (avatar && !avatar.includes("your-minio-domain.com")) 
   * return "آواتار باید از MinIO باشد";
   */
  if (avatar && (!isNonEmptyString(avatar) || !isValidUrl(avatar)))
    return "آواتار باید یک URL معتبر باشد";
  return null;
};

