const randomDigits = (length) => {
  let value = "";
  while (value.length < length) {
    value += Math.floor(Math.random() * 10).toString();
  }
  return value;
};

const generateStudentId = () => {
  const year = new Date().getFullYear();
  return `STU${year}${randomDigits(4)}`;
};

const generateTemporaryPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let index = 0; index < 10; index += 1) {
    const position = Math.floor(Math.random() * chars.length);
    password += chars[position];
  }
  return password;
};

module.exports = {
  generateStudentId,
  generateTemporaryPassword,
};
