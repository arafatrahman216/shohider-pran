import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scoreMatch,
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
} from "./matching";

// scoreMatch is the one piece of pure logic behind the only code path
// allowed to write verificationStatus (Track A/B, Section 2) — worth
// pinning down with real tests rather than only exercising it through the
// full registration API.

const record = {
  id: "rec-1",
  name: "Md. Karim Mia",
  district: "Habiganj",
  fatherName: "Abdul Rahman",
  spouseName: null,
  nid: "1234567890",
};

test("exact NID match scores 1 regardless of other fields", () => {
  const score = scoreMatch(
    {
      fullName: "Someone Completely Different",
      district: "Dhaka",
      fatherOrSpouseName: null,
      nidOrBirthReg: "1234567890",
    },
    record
  );
  assert.equal(score, 1);
});

test("NID match is whitespace/case insensitive", () => {
  const score = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: null,
      nidOrBirthReg: "  1234567890  ",
    },
    record
  );
  assert.equal(score, 1);
});

test("exact name + district + guardian match scores above the high-confidence threshold", () => {
  const score = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: "Abdul Rahman",
      nidOrBirthReg: null,
    },
    record
  );
  assert.ok(score > HIGH_CONFIDENCE_THRESHOLD, `expected > ${HIGH_CONFIDENCE_THRESHOLD}, got ${score}`);
});

test("close-but-not-exact name with matching district lands in the medium-confidence band", () => {
  const score = scoreMatch(
    {
      fullName: "Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: null,
      nidOrBirthReg: null,
    },
    record
  );
  assert.ok(
    score >= MEDIUM_CONFIDENCE_THRESHOLD && score < HIGH_CONFIDENCE_THRESHOLD,
    `expected a medium-confidence score, got ${score}`
  );
});

test("unrelated name and district scores below the medium-confidence threshold", () => {
  const score = scoreMatch(
    {
      fullName: "Totally Unrelated Person",
      district: "Rangpur",
      fatherOrSpouseName: null,
      nidOrBirthReg: null,
    },
    record
  );
  assert.ok(score < MEDIUM_CONFIDENCE_THRESHOLD, `expected < ${MEDIUM_CONFIDENCE_THRESHOLD}, got ${score}`);
});

test("guardian name falls back to spouseName when fatherName is absent", () => {
  const spouseRecord = { ...record, fatherName: null, spouseName: "Rahima Begum" };
  const withCorrectSpouse = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: "Rahima Begum",
      nidOrBirthReg: null,
    },
    spouseRecord
  );
  const withWrongSpouse = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: "Someone Else Entirely",
      nidOrBirthReg: null,
    },
    spouseRecord
  );
  assert.ok(
    withCorrectSpouse > withWrongSpouse,
    "correct spouse name should score higher than a wrong one"
  );
});

test("district mismatch lowers the score relative to a district match", () => {
  const matchingDistrict = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Habiganj",
      fatherOrSpouseName: null,
      nidOrBirthReg: null,
    },
    record
  );
  const wrongDistrict = scoreMatch(
    {
      fullName: "Md. Karim Mia",
      district: "Dhaka",
      fatherOrSpouseName: null,
      nidOrBirthReg: null,
    },
    record
  );
  assert.ok(matchingDistrict > wrongDistrict);
});
