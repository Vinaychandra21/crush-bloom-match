import { verify } from "crypto";
import axiosClient from "./axiosClient";
import axios from "axios";


const API_BASE_URL = "http://localhost:8080/api";

const CRUSH_API = API_BASE_URL + "/crushes";
export const crushService = {
  saveCrushes: (payload) => axiosClient.post(`${CRUSH_API}/submitCrushes`,payload, {
    withCredentials: true, // ✅ Add this
  }),
  getCrushes: () => axiosClient.get(`${CRUSH_API}`),
  getMatches: () => axiosClient.get(`${CRUSH_API}/matches`),
  deleteCrush: (phoneNumber) => axiosClient.delete(`${CRUSH_API}/${phoneNumber}`),
  clearCrushes: () => axiosClient.delete(`${CRUSH_API}`)
};

const AUTHAPI = API_BASE_URL + "/auth";

export const AuthService = {
  requestOtp: (ownerPhone) => axiosClient.post(`${AUTHAPI}/requestOtp`, ownerPhone),
  verify: ( otpCode, otpSessionId, ownerName) => axiosClient.post(`${AUTHAPI}/verifyOtp`, {otpCode, otpSessionId, ownerName }),
}
