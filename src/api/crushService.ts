import { verify } from "crypto";
import axiosClient from "./axiosClient";

// export const crushService = {
//   saveCrushes: (crushes: any[]) => {
//     return axiosClient.post("/save-crushes", { crushes });
//   },

//   getMatches: () => {
//     return axiosClient.get("/matches");
//   }
// };


import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const crushService = {
  saveCrushes: (crushes) => axios.post(`${API_URL}/crushes`, crushes),
  getCrushes: () => axios.get(`${API_URL}/crushes`),
  getMatches: () => axios.get(`${API_URL}/crushes/matches`),
  deleteCrush: (phoneNumber) => axios.delete(`${API_URL}/crushes/${phoneNumber}`),
  clearCrushes: () => axios.delete(`${API_URL}/crushes`)
};

export const AuthService = {
  requestOtp: (ownerPhone) => axios.post(`${API_URL}/auth/requestOtp`, ownerPhone),
  verify: ( ownerPhone, otpCode) => axios.post(`${API_URL}/auth/verifyOtp`, {ownerPhone, otpCode }),
}
