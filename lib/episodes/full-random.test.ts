import { test, expect } from "bun:test";

import {
  getAllShows,
  getEpisodes,
  getEpisodeIndex,
  pickRandomShowEpisode,
} from "./index";

/** Deterministic rng: returns the given values in order, then cycles. */
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

test("picks the show then episode addressed by the rng sequence", () => {
  const index = { a: ["s1e1", "s1e2"], b: ["s2e1"] };
  // show: floor(0.6 * 2) = 1 → "b"; episode: floor(0 * 1) = 0 → "s2e1"
  expect(pickRandomShowEpisode(index, seq([0.6, 0]))).toEqual({
    show: "b",
    episode: "s2e1",
  });
});

test("the picked episode belongs to the picked show", () => {
  const index = { a: ["s1e1", "s1e2"], b: ["s2e1"] };
  // show: floor(0 * 2) = 0 → "a"; episode: floor(0.9 * 2) = 1 → "s1e2"
  expect(pickRandomShowEpisode(index, seq([0, 0.9]))).toEqual({
    show: "a",
    episode: "s1e2",
  });
});

test("returns null for an empty index", () => {
  expect(pickRandomShowEpisode({}, seq([0]))).toBeNull();
});

test("getEpisodeIndex maps every show slug to its episode slugs", () => {
  const index = getEpisodeIndex();
  const shows = getAllShows();
  expect(Object.keys(index).sort()).toEqual(shows.map((s) => s.slug).sort());
  for (const show of shows) {
    expect(index[show.slug].length).toBe(getEpisodes(show.slug).length);
  }
});

test("getEpisodeIndex values are well-formed episode slugs", () => {
  const all = Object.values(getEpisodeIndex()).flat();
  expect(all.length).toBeGreaterThan(0);
  expect(all.every((slug) => /^s\d+e\d+$/.test(slug))).toBe(true);
});
