import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany({});
  await prisma.fee.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.studentParent.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.document.deleteMany({});

  const password = await hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      name: "Dr. Sarah Johnson",
      email: "admin@school.edu",
      password,
      role: "admin",
      department: "Administration",
      phone: "+1-555-0100",
    },
  });

  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: "john.doe@school.edu" },
      update: {},
      create: {
        name: "John Doe",
        email: "john.doe@school.edu",
        password,
        role: "teacher",
        department: "Mathematics",
        canUploadDocs: true,
        phone: "+1-555-0101",
      },
    }),
    prisma.user.upsert({
      where: { email: "jane.smith@school.edu" },
      update: {},
      create: {
        name: "Jane Smith",
        email: "jane.smith@school.edu",
        password,
        role: "teacher",
        department: "Science",
        phone: "+1-555-0102",
      },
    }),
    prisma.user.upsert({
      where: { email: "mike.wilson@school.edu" },
      update: {},
      create: {
        name: "Mike Wilson",
        email: "mike.wilson@school.edu",
        password,
        role: "teacher",
        department: "English",
        phone: "+1-555-0103",
      },
    }),
  ]);

  const parentUser = await prisma.user.upsert({
    where: { email: "bob.parent@school.edu" },
    update: {},
    create: {
      name: "Bob Parent",
      email: "bob.parent@school.edu",
      password,
      role: "parent",
      department: "Primary 5",
    },
  });

  const alice = await prisma.student.create({
    data: { name: "Alice Johnson", email: "alice.johnson@school.edu", department: "Primary 5A" },
  });
  const tom = await prisma.student.create({
    data: { name: "Tom Johnson", email: "tom.johnson@school.edu", department: "Primary 3B" },
  });
  const emma = await prisma.student.create({
    data: { name: "Emma Johnson", email: "emma.johnson@school.edu", department: "Primary 1A" },
  });

  await prisma.studentParent.createMany({
    data: [
      { parentId: parentUser.id, studentId: alice.id, relation: "parent" },
      { parentId: parentUser.id, studentId: tom.id, relation: "parent" },
      { parentId: parentUser.id, studentId: emma.id, relation: "parent" },
    ],
  });

  const aliceTuition = await prisma.fee.create({
    data: { studentId: alice.id, term: "Term 1 2026", description: "Tuition", amount: 500.00 },
  });
  await prisma.fee.createMany({
    data: [
      { studentId: alice.id, term: "Term 1 2026", description: "Activity Fee", amount: 50.00 },
      { studentId: alice.id, term: "Term 1 2026", description: "Books & Materials", amount: 75.00 },
    ],
  });

  await prisma.fee.createMany({
    data: [
      { studentId: tom.id, term: "Term 1 2026", description: "Tuition", amount: 500.00 },
      { studentId: tom.id, term: "Term 1 2026", description: "Activity Fee", amount: 50.00 },
      { studentId: tom.id, term: "Term 1 2026", description: "Transport", amount: 100.00 },
    ],
  });

  await prisma.fee.createMany({
    data: [
      { studentId: emma.id, term: "Term 1 2026", description: "Tuition", amount: 500.00 },
      { studentId: emma.id, term: "Term 1 2026", description: "Activity Fee", amount: 50.00 },
    ],
  });

  await prisma.payment.create({
    data: {
      feeId: aliceTuition.id,
      studentId: alice.id,
      amount: 300.00,
      method: "bank_transfer",
      reference: "BTX-2026-001",
      date: new Date("2026-01-15"),
    },
  });

  await prisma.payment.create({
    data: {
      feeId: aliceTuition.id,
      studentId: alice.id,
      amount: 200.00,
      method: "mobile_money",
      reference: "MM-2026-042",
      date: new Date("2026-02-10"),
    },
  });

  await prisma.result.createMany({
    data: [
      { studentId: alice.id, term: "Term 1 2026", subject: "Mathematics", score: 85, grade: "A", remarks: "Excellent work" },
      { studentId: alice.id, term: "Term 1 2026", subject: "English", score: 78, grade: "B", remarks: "Good progress" },
      { studentId: alice.id, term: "Term 1 2026", subject: "Science", score: 92, grade: "A", remarks: "Outstanding" },
      { studentId: alice.id, term: "Term 1 2026", subject: "Social Studies", score: 88, grade: "A", remarks: "Very good" },
    ],
  });

  await prisma.result.createMany({
    data: [
      { studentId: tom.id, term: "Term 1 2026", subject: "Mathematics", score: 72, grade: "B", remarks: "Satisfactory" },
      { studentId: tom.id, term: "Term 1 2026", subject: "English", score: 80, grade: "A", remarks: "Good effort" },
      { studentId: tom.id, term: "Term 1 2026", subject: "Science", score: 65, grade: "C", remarks: "Needs improvement" },
      { studentId: tom.id, term: "Term 1 2026", subject: "Social Studies", score: 70, grade: "B", remarks: "Fair" },
    ],
  });

  await prisma.result.createMany({
    data: [
      { studentId: emma.id, term: "Term 1 2026", subject: "Literacy", score: 90, grade: "A", remarks: "Excellent" },
      { studentId: emma.id, term: "Term 1 2026", subject: "Numeracy", score: 82, grade: "A", remarks: "Very good" },
      { studentId: emma.id, term: "Term 1 2026", subject: "Science", score: 88, grade: "A", remarks: "Great" },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to the New School Year!",
        content: "We are excited to welcome all students, teachers, and parents to the 2026-2027 school year. Please check your schedules and classroom assignments on the portal.",
        authorId: admin.id,
        targetRoles: "all",
      },
      {
        title: "Staff Meeting - Friday",
        content: "There will be a mandatory staff meeting this Friday at 3:00 PM in the auditorium. Please make arrangements to attend.",
        authorId: admin.id,
        targetRoles: "teacher,admin",
      },
      {
        title: "Parent-Teacher Conference Dates",
        content: "Parent-teacher conferences will be held on October 15th and 16th. Sign-up sheets will be available next week.",
        authorId: admin.id,
        targetRoles: "all",
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        title: "First Day of School",
        description: "School opens for the 2026-2027 academic year",
        date: new Date("2026-09-01"),
        type: "academic",
        targetRoles: "all",
      },
      {
        title: "Staff Development Day",
        description: "Professional development workshop for all staff",
        date: new Date("2026-09-15"),
        type: "staff",
        targetRoles: "teacher,admin",
      },
      {
        title: "Science Fair",
        description: "Annual school science fair - all grades participate",
        date: new Date("2026-11-20"),
        type: "academic",
        targetRoles: "all",
      },
      {
        title: "Winter Break",
        description: "School closed for winter break",
        date: new Date("2026-12-20"),
        endDate: new Date("2027-01-03"),
        type: "holiday",
        targetRoles: "all",
      },
    ],
  });

  await prisma.schedule.createMany({
    data: [
      { dayOfWeek: 1, period: 1, subject: "Algebra II", teacherId: teachers[0].id, room: "201", class: "Grade 10A" },
      { dayOfWeek: 1, period: 2, subject: "Algebra II", teacherId: teachers[0].id, room: "201", class: "Grade 10B" },
      { dayOfWeek: 1, period: 3, subject: "Physics", teacherId: teachers[1].id, room: "301", class: "Grade 10A" },
      { dayOfWeek: 1, period: 4, subject: "English Literature", teacherId: teachers[2].id, room: "101", class: "Grade 10A" },
      { dayOfWeek: 2, period: 1, subject: "Physics", teacherId: teachers[1].id, room: "301", class: "Grade 10B" },
      { dayOfWeek: 2, period: 2, subject: "English Literature", teacherId: teachers[2].id, room: "101", class: "Grade 10B" },
      { dayOfWeek: 2, period: 3, subject: "Algebra II", teacherId: teachers[0].id, room: "201", class: "Grade 10A" },
      { dayOfWeek: 2, period: 4, subject: "Chemistry", teacherId: teachers[1].id, room: "302", class: "Grade 10A" },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
