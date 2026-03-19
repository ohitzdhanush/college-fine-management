/**
 * Get top students by number of fines (tiebreak: total amount).
 * @param {Array} fines - array of fine objects (each may have .student and .amount)
 * @param {number} [limit=3] - how many top students to return
 * @returns {Array<{studentName:string,totalFinesCount:number,totalFineAmount:number}>}
 */
export const getTopStudentsFromFines = (fines: any[], limit = 3) => {
  const map = new Map(); // studentId -> { studentName, totalFinesCount, totalFineAmount }

  for (const fine of fines || []) {
    const student = fine.student;
    if (!student || !student._id) continue; // skip null or missing student refs

    const id = String(student._id);
    const name = student.name ?? "Unknown";
    const amount =
      typeof fine.amount === "number" ? fine.amount : Number(fine.amount) || 0;

    if (!map.has(id)) {
      map.set(id, {
        studentName: name,
        totalFinesCount: 0,
        totalFineAmount: 0,
      });
    }

    const entry = map.get(id);
    entry.totalFinesCount += 1;
    entry.totalFineAmount += amount;
  }

  const arr = Array.from(map.values());

  // sort by count desc, then by amount desc
  arr.sort((a, b) => {
    if (b.totalFinesCount !== a.totalFinesCount) {
      return b.totalFinesCount - a.totalFinesCount;
    }
    return b.totalFineAmount - a.totalFineAmount;
  });

  return arr.slice(0, limit);
};
