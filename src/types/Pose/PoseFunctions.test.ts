import { expect, test } from "vitest";
import * as _ from "./PoseFunctions";
import { PoseStream, PoseStreamModule } from "./PoseTypes";

test("getChromaticOffset should return the correct chromatic value if it exists", () => {
  const chromaticOffset = _.getVector_N({ chromatic: 5 });
  expect(chromaticOffset).toEqual(5);
});

test("getChromaticOffset should return 0 if the chromatic value does not exist", () => {
  expect(_.getVector_N(undefined)).toEqual(0);
  expect(_.getVector_N({})).toEqual(0);
  expect(_.getVector_N({ chordal: 1 })).toEqual(0);
});

test("getChordalOffset should return the correct chordal value if it exists", () => {
  const chordalOffset = _.getVector_t({ chordal: 5 });
  expect(chordalOffset).toEqual(5);
});

test("getChordalOffset should return 0 if the chordal value does not exist", () => {
  expect(_.getVector_t(undefined)).toEqual(0);
  expect(_.getVector_t({})).toEqual(0);
  expect(_.getVector_t({ chromatic: 1 })).toEqual(0);
});

test("getPoseOffsetById should return the correct value if it exists", () => {
  const offset = _.getVectorOffsetById({ mock_track: 5 }, "mock_track");
  expect(offset).toEqual(5);
});

test("getPoseOffsetById should return 0 if the value does not exist", () => {
  expect(_.getVectorOffsetById(undefined, "mock_track")).toEqual(0);
  expect(_.getVectorOffsetById({}, "mock_track")).toEqual(0);
  expect(_.getVectorOffsetById({ chromatic: 1 }, "mock_track")).toEqual(0);
});

test("getPoseOffsetsById should return the correct values if they exist", () => {
  const offsets = _.getVectorOffsetsById(
    { mock_track: 3, chromatic: 1, chordal: 2 },
    ["chromatic", "chordal", "mock_track"]
  );
  expect(offsets).toEqual([1, 2, 3]);
});

test("getPoseOffsetsById should return 0 where the values do not exist", () => {
  const offsets = _.getVectorOffsetsById({ a: 1 }, ["a", "b"]);
  expect(offsets).toEqual([1, 0]);
});

test("getPoseVectorAtIndex should treat blocks with no duration as infinite", () => {
  const stream1: PoseStream = [{ vector: { a: 1 } }];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 1 });

  const stream2: PoseStream = [{ stream: [{ vector: { a: 1 } }] }];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({ a: 1 });
});

test("getPoseVectorAtIndex should bound blocks by the outermost duration", () => {
  const stream1: PoseStream = [{ vector: { a: 1 }, duration: 1 }];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({});
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({});

  const stream2: PoseStream = [
    { stream: [{ vector: { a: 1 }, duration: 2 }], duration: 1 },
  ];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({});
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({});
});

test("getPoseVectorAtIndex should not bound blocks without outermost durations", () => {
  const stream1: PoseStream = [{ stream: [{ vector: { a: 1 }, duration: 1 }] }];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 1 });

  const stream2: PoseStream = [
    { stream: [{ stream: [{ vector: { a: 1 }, duration: 1 }], duration: 1 }] },
  ];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({ a: 1 });
});

test("getPoseVectorAtIndex should work with simple duration patterns", () => {
  const stream1: PoseStream = [
    {
      stream: [
        { vector: { a: 1 }, duration: 1 },
        { vector: { a: 2 }, duration: 3 },
      ],
      duration: 6,
    },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 3)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 4)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 5)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 6)).toEqual({});
  expect(_.getPoseVectorAtIndex(stream1, 7)).toEqual({});
  expect(_.getPoseVectorAtIndex(stream1, 8)).toEqual({});
});

test("getPoseVectorAtIndex should respect the outermost duration of the stream", () => {
  const stream: PoseStream = [
    { stream: [{ stream: [{ vector: { a: 1 } }], duration: 5 }], duration: 1 },
  ];
  expect(_.getPoseVectorAtIndex(stream, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream, 1)).toEqual({});

  const substream = (stream[0] as PoseStreamModule).stream;
  expect(_.getPoseVectorAtIndex(substream, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(substream, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(substream, 2)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(substream, 3)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(substream, 4)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(substream, 5)).toEqual({});
});

test("getPoseVectorAtIndex should fill the remaining space with infector vectors", () => {
  const stream1: PoseStream = [
    { vector: { a: 1 } },
    { vector: { a: 2 }, duration: 1 },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 1 });

  const stream2: PoseStream = [
    { vector: { a: 1 }, duration: 1 },
    { vector: { a: 2 } },
  ];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({ a: 2 });
});

test("getPoseVectorAtIndex should ignore repeats with infinite durations", () => {
  const stream1: PoseStream = [
    { vector: { a: 1 }, repeat: 1 },
    { vector: { a: 2 } },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 1 });

  const stream2: PoseStream = [
    { vector: { a: 1 }, repeat: 2 },
    { vector: { a: 2 } },
  ];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({ a: 1 });
});

test("getPoseVectorAtIndex should correctly multiply durations by repeat count", () => {
  const stream1: PoseStream = [
    { vector: { a: 1 }, duration: 2, repeat: 1 },
    { vector: { a: 2 } },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 3)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 4)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 5)).toEqual({ a: 2 });

  const stream2: PoseStream = [
    { vector: { a: 1 }, duration: 1, repeat: 2 },
    { vector: { a: 2 } },
  ];
  expect(_.getPoseVectorAtIndex(stream2, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream2, 2)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 3)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 4)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 5)).toEqual({ a: 2 });
});

test("getPoseVectorAtIndex should repeat until the outermost stream duration is reached", () => {
  const stream1: PoseStream = [
    {
      stream: [
        { vector: { a: 1 }, duration: 1 },
        { vector: { a: 2 }, duration: 1 },
      ],
      duration: 5,
      repeat: 3,
    },
    { vector: { a: 3 }, duration: 3 },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 3)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 4)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 5)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 6)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 7)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 8)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 9)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 10)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 11)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 12)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 13)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 14)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 15)).toEqual({ a: 3 });
  expect(_.getPoseVectorAtIndex(stream1, 16)).toEqual({ a: 3 });
  expect(_.getPoseVectorAtIndex(stream1, 17)).toEqual({ a: 3 });
  expect(_.getPoseVectorAtIndex(stream1, 18)).toEqual({});
});

test("getPoseVectorAtIndex should loop modules beyond their repeats without a duration", () => {
  const stream1: PoseStream = [
    {
      stream: [
        { vector: { a: 1 }, duration: 2 },
        { vector: { a: 2 }, duration: 1 },
      ],
      repeat: 3,
    },
    { vector: { a: 3 }, duration: 3 },
  ];
  expect(_.getPoseVectorAtIndex(stream1, 0)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 1)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 2)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 3)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 4)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 5)).toEqual({ a: 2 });
  expect(_.getPoseVectorAtIndex(stream1, 6)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 7)).toEqual({ a: 1 });
  expect(_.getPoseVectorAtIndex(stream1, 8)).toEqual({ a: 2 });
});
