import type { Settings } from "@/types";

export const mockSettings: Settings = {
  xp_per_coin: 10,
  level_thresholds: [0, 500, 2000, 5000, 10000],
  store_open_days: [1, 3, 5], // Mon, Wed, Fri
};
