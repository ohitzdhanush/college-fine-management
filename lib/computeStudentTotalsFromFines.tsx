type StudentTotals = {
  totalFinesCount: number;
  totalFineAmount: number;
};

/**
 * Calculate totals for a given student id from fines array.
 */
export function computeStudentTotalsFromFines(
  fines: any[],
  studentId: string
): StudentTotals {
  if (!Array.isArray(fines) || !studentId)
    return { totalFinesCount: 0, totalFineAmount: 0 };

  return fines.reduce<StudentTotals>(
    (acc, fine) => {
      const fineStudentId =
        typeof fine.student === "object" && fine.student !== null
          ? fine.student._id
          : fine.student;

      if (String(fineStudentId) !== String(studentId)) return acc;

      const amount =
        typeof fine.amount === "number"
          ? fine.amount
          : Number(fine.amount) || 0;

      acc.totalFinesCount += 1;
      acc.totalFineAmount += amount;
      return acc;
    },
    { totalFinesCount: 0, totalFineAmount: 0 }
  );
}
