import axiosClient from "./axiosClient";

export const crushService = {
  saveCrushes: (crushes: any[]) => {
    return axiosClient.post("/save-crushes", { crushes });
  },

  getMatches: () => {
    return axiosClient.get("/matches");
  }
};
