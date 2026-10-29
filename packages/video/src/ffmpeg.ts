/**
 * FFmpeg wrapper — runs ffmpeg with progress streaming.
 * Used for: audio mix, music ducking, loudness normalize (−14 LUFS),
 * burn-in captions (SRT/ASS), concatenate, encode.
 */

import { spawn } from "node:child_process";

export interface FfprobeResult {
  durationSec: number;
  width: number;
  height: number;
  codec: string;
  hasAudio: boolean;
}

export async function ffprobe(input: string): Promise<FfprobeResult> {
  // Production: spawn `ffprobe -v error -print_format json -show_format -show_streams <input>`
  return { durationSec: 30, width: 1080, height: 1920, codec: "h264", hasAudio: true };
}

export async function execFfmpeg(args: string[]): Promise<void> {
  // Production:
  // return new Promise((resolve, reject) => {
  //   const proc = spawn("ffmpeg", ["-hide_banner", "-loglevel", "warning", ...args]);
  //   proc.stderr.on("data", (d) => process.stderr.write(d));
  //   proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
  // });
  console.log("[ffmpeg]", args.join(" "));
}
