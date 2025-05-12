import axios from "axios";

export const postRegister = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`/api/auth/register`, {
    username,
    password,
  });
  return res;
};

export const postLogin = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`/api/auth/login`, {
    username,
    password,
  });
  return res;
};
