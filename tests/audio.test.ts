import { expect, it } from "vitest";
import { encodeWave } from "../src/utils/audio";

it("encodes mono PCM audio with correct sizes and clamps samples instead of overflowing", () => {
  const data = new DataView(encodeWave(new Float32Array([-2, 0, 2]), 16000));
  expect(data.byteLength).toBe(50);
  expect(data.getUint32(24, true)).toBe(16000);
  expect(data.getUint16(22, true)).toBe(1);
  expect(data.getUint32(40, true)).toBe(6);
  expect(data.getInt16(44, true)).toBe(-32768);
  expect(data.getInt16(46, true)).toBe(0);
  expect(data.getInt16(48, true)).toBe(32767);
});
