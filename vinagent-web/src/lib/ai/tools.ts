import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import scheduleData from "../mock/schedule.json";
import coursesData from "../mock/courses.json";
import prerequisitesData from "../mock/prerequisites.json";
import studentData from "../mock/student.json";

// ── Tool Definitions for Gemini Function Calling ──

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_student_profile",
    description:
      "Lấy thông tin sinh viên: mã SV, ngành, năm, GPA, môn đã hoàn thành, preferences, bạn cùng nhóm. Gọi đầu tiên để hiểu context sinh viên.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "search_courses",
    description:
      "Tìm kiếm các môn học có sẵn trong HK 20252. Có thể lọc theo mã môn hoặc từ khóa tên môn.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Từ khóa tìm kiếm (mã môn hoặc tên môn, ví dụ: 'IT3010E' hoặc 'cấu trúc dữ liệu')",
        },
      },
    },
  },
  {
    name: "check_schedule",
    description:
      "Xem lịch các lớp học (class sections) cho một hoặc nhiều mã môn. Trả về thời gian, phòng, số chỗ đã đăng ký/sức chứa, mức rủi ro hết chỗ.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        course_codes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Danh sách mã môn cần kiểm tra, ví dụ: ['IT3010E', 'IT3020E']",
        },
      },
      required: ["course_codes"],
    },
  },
  {
    name: "check_prerequisites",
    description:
      "Kiểm tra điều kiện tiên quyết cho danh sách môn mục tiêu dựa trên hồ sơ sinh viên. Trả về môn nào thiếu tiên quyết.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        course_codes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Danh sách mã môn cần kiểm tra tiên quyết",
        },
      },
      required: ["course_codes"],
    },
  },
  {
    name: "generate_schedule",
    description:
      "Tự động tạo Plan A (tối ưu) và Plan B (dự phòng) từ danh sách môn mục tiêu, dựa trên schedule.json. Xét ràng buộc: không xung đột thời gian, ưu tiên chỗ ngồi còn nhiều, tuân thủ preferences sinh viên.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        target_courses: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Danh sách mã môn cần xếp lịch",
        },
        avoid_morning: {
          type: SchemaType.BOOLEAN,
          description: "Tránh lớp buổi sáng (trước 9h30)",
        },
        avoid_afternoon: {
          type: SchemaType.BOOLEAN,
          description: "Tránh lớp buổi chiều (sau 14h)",
        },
        prefer_group_friends: {
          type: SchemaType.BOOLEAN,
          description: "Ưu tiên lớp đông (khả năng cao cùng nhóm bạn)",
        },
      },
      required: ["target_courses"],
    },
  },
];

// ── Tool Implementations ──

type ScheduleEntry = (typeof scheduleData)[number];

export function executeToolCall(
  name: string,
  args: Record<string, unknown>
): unknown {
  switch (name) {
    case "get_student_profile":
      return getStudentProfile();
    case "search_courses":
      return searchCourses(args.query as string | undefined);
    case "check_schedule":
      return checkSchedule(args.course_codes as string[]);
    case "check_prerequisites":
      return checkPrerequisites(args.course_codes as string[]);
    case "generate_schedule":
      return generateSchedule(
        args.target_courses as string[],
        args.avoid_morning as boolean | undefined,
        args.avoid_afternoon as boolean | undefined,
        args.prefer_group_friends as boolean | undefined
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function getStudentProfile() {
  return {
    ...studentData,
    _citation: {
      type: "sis",
      title: "Hồ sơ sinh viên — VinUni SIS",
      detail: `${studentData.name} (${studentData.id}), ${studentData.major} năm ${studentData.year}, GPA ${studentData.gpa}. Đã hoàn thành: ${studentData.completedCourses.join(", ")}.`,
    },
  };
}

function searchCourses(query?: string) {
  let results = coursesData;
  if (query) {
    const q = query.toLowerCase();
    results = coursesData.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.nameVi.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q)
    );
  }
  return {
    courses: results,
    total: results.length,
    semester: "20252",
    _citation: {
      type: "sis",
      title: "Danh mục môn học HK 20252 — VinUni SIS",
      detail: `Tìm thấy ${results.length} môn học${query ? ` cho "${query}"` : ""}. Nguồn: SIS VinUniversity.`,
    },
  };
}

function checkSchedule(courseCodes: string[]) {
  const sections = scheduleData.filter((s) =>
    courseCodes.includes(s.courseCode)
  );
  const summary = sections.map((s) => ({
    classId: s.classId,
    courseCode: s.courseCode,
    name: s.courseNameVi,
    day: s.day,
    time: `${s.startHour}:00–${s.endHour > Math.floor(s.endHour) ? Math.floor(s.endHour) + ":30" : s.endHour + ":00"}`,
    room: s.room,
    seats: `${s.enrolled}/${s.capacity}`,
    seatRisk: s.seatRisk,
    session: s.session,
  }));

  const highRisk = sections.filter((s) => s.seatRisk === "high");

  return {
    sections: summary,
    total: summary.length,
    highRiskCount: highRisk.length,
    timestamp: new Date().toLocaleString("vi-VN"),
    _citation: {
      type: "sis",
      title: "Dữ liệu SIS HK 20252 — lịch và chỗ ngồi",
      detail: `${summary.length} lớp cho ${courseCodes.join(", ")}. ${highRisk.length > 0 ? `⚠ ${highRisk.length} lớp gần đầy.` : "Tất cả còn chỗ."} Cập nhật: ${new Date().toLocaleString("vi-VN")}.`,
    },
  };
}

function checkPrerequisites(courseCodes: string[]) {
  const prereqs = prerequisitesData as Record<
    string,
    { required: string[]; recommended: string[]; note: string }
  >;
  const completed = studentData.completedCourses;
  const results = courseCodes.map((code) => {
    const req = prereqs[code];
    if (!req) return { course: code, ok: true, missing: [], recommended: [], note: "Không có dữ liệu tiên quyết" };
    const missing = req.required.filter((r) => !completed.includes(r));
    const recMissing = req.recommended.filter((r) => !completed.includes(r));
    return {
      course: code,
      ok: missing.length === 0,
      missing,
      recommendedMissing: recMissing,
      note: req.note,
    };
  });

  const allOk = results.every((r) => r.ok);
  const failedCourses = results.filter((r) => !r.ok);

  return {
    allOk,
    results,
    studentCompleted: completed,
    _citation: {
      type: "prerequisite",
      title: "Kiểm tra điều kiện tiên quyết — VinUni SIS",
      detail: allOk
        ? `Sinh viên đã hoàn thành: ${completed.join(", ")}. Tất cả điều kiện tiên quyết cho ${courseCodes.join(", ")} đều đáp ứng.`
        : `Thiếu tiên quyết: ${failedCourses.map((f) => `${f.course} (cần: ${f.missing.join(", ")})`).join("; ")}.`,
    },
  };
}

function hasTimeConflict(a: ScheduleEntry, b: ScheduleEntry): boolean {
  if (a.day !== b.day) return false;
  return a.startHour < b.endHour && b.startHour < a.endHour;
}

function generateSchedule(
  targetCourses: string[],
  avoidMorning = false,
  avoidAfternoon = false,
  preferGroupFriends = false
) {
  const sectionsByCourse: Record<string, ScheduleEntry[]> = {};
  for (const code of targetCourses) {
    let sections = scheduleData.filter((s) => s.courseCode === code);
    if (avoidMorning) sections = sections.filter((s) => s.startHour >= 9.5);
    if (avoidAfternoon) sections = sections.filter((s) => s.startHour < 14);
    sectionsByCourse[code] = sections;
  }

  function scorePlan(plan: ScheduleEntry[]): number {
    let score = 100;
    for (const s of plan) {
      const ratio = s.enrolled / s.capacity;
      if (ratio > 0.95) score -= 20;
      else if (ratio > 0.85) score -= 10;
      else if (ratio > 0.7) score -= 5;
      if (preferGroupFriends && s.enrolled > 80) score += 5;
    }
    return score;
  }

  function buildPlan(preferLowRisk: boolean): ScheduleEntry[] | null {
    const plan: ScheduleEntry[] = [];
    const courseOrder = [...targetCourses];

    for (const code of courseOrder) {
      let candidates = sectionsByCourse[code] || [];
      if (candidates.length === 0) continue;

      if (preferLowRisk) {
        candidates = [...candidates].sort(
          (a, b) => a.enrolled / a.capacity - b.enrolled / b.capacity
        );
      } else {
        candidates = [...candidates].sort(
          (a, b) => b.enrolled / b.capacity - a.enrolled / a.capacity
        );
      }

      let placed = false;
      for (const candidate of candidates) {
        const conflict = plan.some((p) => hasTimeConflict(p, candidate));
        if (!conflict) {
          plan.push(candidate);
          placed = true;
          break;
        }
      }
      if (!placed && candidates.length > 0) {
        for (const candidate of candidates) {
          const conflict = plan.some((p) => hasTimeConflict(p, candidate));
          if (!conflict) {
            plan.push(candidate);
            placed = true;
            break;
          }
        }
      }
    }
    return plan.length === targetCourses.length ? plan : null;
  }

  const planA = buildPlan(true);
  const planB = buildPlan(false);

  const formatPlan = (plan: ScheduleEntry[] | null) =>
    plan?.map((s) => ({
      code: s.courseCode,
      name: s.courseNameVi,
      day: s.day,
      startHour: s.startHour,
      endHour: s.endHour,
      room: s.room,
      seats: `${s.enrolled}/${s.capacity}`,
      seatRisk: s.seatRisk,
      classId: s.classId,
    })) ?? null;

  return {
    planA: formatPlan(planA),
    planB: formatPlan(planB),
    planAScore: planA ? scorePlan(planA) : 0,
    planBScore: planB ? scorePlan(planB) : 0,
    targetCourses,
    constraints: { avoidMorning, avoidAfternoon, preferGroupFriends },
    _citation: {
      type: "sis",
      title: "Thuật toán xếp lịch — VinAgent Scheduler",
      detail: `Đã tạo ${planA ? "Plan A" : ""}${planA && planB ? " + " : ""}${planB ? "Plan B" : ""} cho ${targetCourses.join(", ")}. Dữ liệu: TKB20252-FULL, ${scheduleData.length} lớp.`,
    },
  };
}
