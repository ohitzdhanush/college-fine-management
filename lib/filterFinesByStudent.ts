// utils/filterFinesByStudent.ts
export function filterFinesByStudent(fines: any[], studentId: string) {
  if (!Array.isArray(fines) || !studentId) return [];

  return fines.filter((fine) => {
    // handle cases where fine.student might be populated or just an ID
    if (typeof fine.student === "string") {
      return fine.student === studentId;
    } else if (fine.student && typeof fine.student === "object") {
      return fine.student._id === studentId;
    }
    return false;
  });
}
