import { beforeEach, describe, expect, it } from "vitest";

import {
  getCurrentStudent,
  getStudentById,
  loginAccount,
  logoutAccount,
  registerAccount,
  verifyCurrentStudent,
} from "./auth";

describe("auth login/register flows", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("registers a valid student id and name", () => {
    const result = registerAccount("20210001", "Nguyễn Văn An");
    expect(result.ok).toBe(true);
  });

  it("rejects unknown student id at register", () => {
    const result = registerAccount("unknown-id", "Nguyễn Văn An");
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/Không tìm thấy người dùng/i);
  });

  it("rejects register when student name mismatches", () => {
    const result = registerAccount("20210001", "Sai Tên");
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/Họ tên không khớp/i);
  });

  it("logs in after successful register", () => {
    registerAccount("20210001", "Nguyễn Văn An");

    const result = loginAccount("20210001", "Nguyễn Văn An");
    expect(result.ok).toBe(true);

    const student = getCurrentStudent();
    expect(student?.id).toBe("20210001");
  });

  it("fails login with wrong student name", () => {
    registerAccount("20210001", "Nguyễn Văn An");

    const result = loginAccount("20210001", "wrong-name");
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/Họ tên không khớp/i);
  });

  it("verifies current logged-in student against source data", () => {
    registerAccount("20210001", "Nguyễn Văn An");
    loginAccount("20210001", "Nguyễn Văn An");

    const result = verifyCurrentStudent();
    expect(result.ok).toBe(true);
  });

  it("clears session on logout", () => {
    registerAccount("20210001", "Nguyễn Văn An");
    loginAccount("20210001", "Nguyễn Văn An");

    logoutAccount();
    expect(getCurrentStudent()).toBeNull();
  });

  it("can find student from mock source", () => {
    const student = getStudentById("20210001");
    expect(student).not.toBeNull();
    expect(student?.name).toBe("Nguyễn Văn An");
  });
});
