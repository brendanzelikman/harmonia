import { TRACK_WIDTH, HEADER_HEIGHT } from "utils/constants";

export const TimelineTopLeftCorner = (
  <div
    className="sticky size-full inset-0 -mb-20 z-[90] bg-gradient-to-r from-gray-800 to-gray-900"
    style={{ width: TRACK_WIDTH, height: HEADER_HEIGHT }}
  />
);
