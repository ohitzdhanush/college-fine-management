export interface Fine {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  registrationNumber: string
  amount: number
  reason: string
  issuedBy: string
  issuedDate: string
  dueDate: string
  status: "pending" | "paid" | "overdue"
  paymentDate?: string
}

export interface Student {
  id: string
  name: string
  email: string
  registrationNumber: string
  department: string
  totalFines: number
  fineCount: number
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: string
  finesIssued: number
}

// Mock data
export const mockStudents: Student[] = [
  {
    id: "student-1",
    name: "Alice Johnson",
    email: "alice@college.edu",
    registrationNumber: "CS2024001",
    department: "Computer Science",
    totalFines: 500,
    fineCount: 2,
  },
  {
    id: "student-2",
    name: "Bob Smith",
    email: "bob@college.edu",
    registrationNumber: "CS2024002",
    department: "Computer Science",
    totalFines: 1000,
    fineCount: 3,
  },
  {
    id: "student-3",
    name: "Carol Davis",
    email: "carol@college.edu",
    registrationNumber: "ENG2024001",
    department: "Engineering",
    totalFines: 250,
    fineCount: 1,
  },
]

export const mockFaculty: Faculty[] = [
  {
    id: "faculty-1",
    name: "Dr. John Smith",
    email: "john@college.edu",
    department: "Computer Science",
    finesIssued: 15,
  },
  {
    id: "faculty-2",
    name: "Prof. Sarah Wilson",
    email: "sarah@college.edu",
    department: "Engineering",
    finesIssued: 8,
  },
]

export const mockFines: Fine[] = [
  {
    id: "fine-1",
    studentId: "student-1",
    studentName: "Alice Johnson",
    studentEmail: "alice@college.edu",
    registrationNumber: "CS2024001",
    amount: 300,
    reason: "Late submission of assignment",
    issuedBy: "Dr. John Smith",
    issuedDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "pending",
  },
  {
    id: "fine-2",
    studentId: "student-1",
    studentName: "Alice Johnson",
    studentEmail: "alice@college.edu",
    registrationNumber: "CS2024001",
    amount: 200,
    reason: "Absence from class",
    issuedBy: "Dr. John Smith",
    issuedDate: "2025-01-10",
    dueDate: "2025-02-10",
    status: "paid",
    paymentDate: "2025-01-20",
  },
  {
    id: "fine-3",
    studentId: "student-2",
    studentName: "Bob Smith",
    studentEmail: "bob@college.edu",
    registrationNumber: "CS2024002",
    amount: 500,
    reason: "Disciplinary action",
    issuedBy: "Prof. Sarah Wilson",
    issuedDate: "2025-01-05",
    dueDate: "2025-02-05",
    status: "overdue",
  },
  {
    id: "fine-4",
    studentId: "student-2",
    studentName: "Bob Smith",
    studentEmail: "bob@college.edu",
    registrationNumber: "CS2024002",
    amount: 250,
    reason: "Library fine",
    issuedBy: "Dr. John Smith",
    issuedDate: "2025-01-20",
    dueDate: "2025-02-20",
    status: "pending",
  },
  {
    id: "fine-5",
    studentId: "student-2",
    studentName: "Bob Smith",
    studentEmail: "bob@college.edu",
    registrationNumber: "CS2024002",
    amount: 250,
    reason: "Uniform violation",
    issuedBy: "Prof. Sarah Wilson",
    issuedDate: "2025-01-12",
    dueDate: "2025-02-12",
    status: "paid",
    paymentDate: "2025-01-25",
  },
  {
    id: "fine-6",
    studentId: "student-3",
    studentName: "Carol Davis",
    studentEmail: "carol@college.edu",
    registrationNumber: "ENG2024001",
    amount: 250,
    reason: "Lab equipment damage",
    issuedBy: "Prof. Sarah Wilson",
    issuedDate: "2025-01-18",
    dueDate: "2025-02-18",
    status: "pending",
  },
]
