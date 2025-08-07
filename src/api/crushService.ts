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

const API_BASE_URL = "http://localhost:8080/api";

const CRUSH_API = API_BASE_URL + "/crushes";
export const crushService = {
  saveCrushes: (crushes) => axios.post(`${CRUSH_API}`, crushes),
  getCrushes: () => axios.get(`${CRUSH_API}`),
  getMatches: () => axios.get(`${CRUSH_API}/matches`),
  deleteCrush: (phoneNumber) => axios.delete(`${CRUSH_API}/${phoneNumber}`),
  clearCrushes: () => axios.delete(`${CRUSH_API}`)
};

const AUTHAPI = API_BASE_URL + "/auth";

export const AuthService = {
  requestOtp: (ownerPhone) => axios.post(`${AUTHAPI}/requestOtp`, ownerPhone),
  verify: ( otpCode, otpSessionId, ownerName) => axios.post(`${AUTHAPI}/verifyOtp`, {otpCode, otpSessionId, ownerName }),
}
