import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword) => {
  const saltRounds = 10; // You can increase for stronger hashing
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
