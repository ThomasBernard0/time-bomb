import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const postRegister = async (
  email: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/auth/register`, {
    email,
    password,
  });
  return res;
};

export const postLogin = async (
  email: string,
  password: string
): Promise<any> => {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res;
};
