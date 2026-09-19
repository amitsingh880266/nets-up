import type { DeliveryOutcome, OutType } from "@/types";

export const OUTCOME_LABELS: Record<DeliveryOutcome, string> = {
  played: "Played",
  middle: "Middle",
  edge: "Edge",
  miss: "Miss",
  wide: "Wide",
  out: "Out",
};

export const OUTCOME_SHORT: Record<DeliveryOutcome, string> = {
  played: "P",
  middle: "M",
  edge: "E",
  miss: "X",
  wide: "W",
  out: "O",
};

export const OUTCOME_FEEDBACK: Record<DeliveryOutcome, string> = {
  played: "PLAYED!",
  middle: "MIDDLED!",
  edge: "EDGE!",
  miss: "MISSED",
  wide: "WIDE!",
  out: "OUT!",
};

export const OUT_TYPE_LABELS: Record<OutType, string> = {
  bowled: "Bowled",
  caught: "Caught",
  lbw: "LBW",
  runout: "Run Out",
  other: "Other",
};
