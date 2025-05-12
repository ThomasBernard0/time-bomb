import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const postRegister = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/api/auth/register`, {
    username,
    password,
  });
  return res;
};

export const postLogin = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, {
    username,
    password,
  });
  return res;
};
