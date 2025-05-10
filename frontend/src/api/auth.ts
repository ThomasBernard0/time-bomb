import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const postRegister = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/auth/register`, {
    username,
    password,
  });
  return res;
};

export const postLogin = async (
  username: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    username,
    password,
  });
  return res;
};
