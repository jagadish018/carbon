import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./prisma";

const app = new Hono();
const prisma = new PrismaClient();

//get student details
app.get("/students", async (c) => {
  try {
    const students = await prisma.student.findMany();
    return c.json({ message: students }, 200);
  } catch (error) {
    return c.json({ message: "Bad request" }, 400);
  }
});

//get student details 
app.get("/students/enriched", async (c) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        proctor: true,
      },
    });
    return c.json({ message: students }, 200);
  } catch (error) {
    return c.json({ message: "Bad request" }, 400);
  }
});

app.get("/professors", async (c) => {
  try {
    const professors = await prisma.professor.findMany();
    return c.json({ message: professors }, 200);
  } catch (error) {
    return c.json({ message: "Bad request" }, 400);
  }
});

app.post("/students", async (c) => {
  try {
    const { name, dateOfBirth, aadharNumber, proctorId } = await c.req.json();

    // Check if Aadhar number already exists
    const existAadhar = await prisma.student.findUnique({
      where: { aadharNumber },
    });
    if (existAadhar) {
      return c.json({ message: "Aadhar number already exists" }, 400);
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth,
        aadharNumber,
        proctorId, 
      }
    });

    return c.json({ student }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error", error: error },500);
  }
});


app.post("/professors", async (c) => {
  try {
    const { name, seniority, aadharNumber } = await c.req.json();
    const existAadhar = await prisma.professor.findUnique({
      where: { aadharNumber },
    });
    if (existAadhar) {
      return c.json({ message: "Aadhar number already exists" }, 400);
    }
    const professor = await prisma.professor.create({
      data: {
        name,
        seniority,
        aadharNumber,
      },
      include: {
        student: true,
      },
    });
    return c.json(professor);
  } catch (error) {
    return c.json({ message: error }, 500);
  }
});

app.get("/professors/:professorId/proctorships", async (c) => {
  try {
    const { professorId } = c.req.param();

    const students = await prisma.student.findMany({
      where: { proctorId: professorId },
      include: {
        proctor: true,
      },
    });

    return c.json(students);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch proctorships" }, 500);
  }
});

//update details of students
app.patch("/students/:studentId",async (c) => {
  try {
    const { studentId } = c.req.param();
    const { name, dateOfBirth, aadharNumber, proctorId } = await c.req.json();
    const existStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!existStudent) {
      return c.json({ message: "Student does not exist" }, 400);
    }
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        name,
        dateOfBirth,
        aadharNumber,
        proctorId,
      },
    });
    return c.json({data: student}, 201);

  } catch (e) {
    return c.json({ message: "INTERNAL SERVER ERROR" }, 500);
 }
});

//update professor by id
app.patch("/professors/:professorId", async (c) => {
  try {
    const { professorId } = c.req.param();
    const { name, seniority, aadharNumber } = await c.req.json();
    const existProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
    });
    if (!existProfessor) {
      return c.json({ message: "Professor does not exist" }, 400);
    }
    const professor = await prisma.professor.update({
      where: { id: professorId },
      data: {
        name,
        seniority,
        aadharNumber,
      },
    })
    return c.json({data: professor}, 201);
  } catch (e) {
    return c.json({ message: "INTERNAL SERVER ERROR" }, 500);
  }
});

//delete student by id
app.delete("/students/:studentId", async (c) => {
  try {
    const { studentId } = c.req.param();
    const existStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!existStudent) {
      return c.json({ message: "Student does not exist" }, 400);
    }
    await prisma.student.delete({
      where: { id: studentId },
    });
    return c.json({ message: "Student deleted successfully" }, 200);
  } catch (e) {
    return c.json({ message: "INTERNAL SERVER ERROR" }, 500);
  }
});

//delete professor by id
app.delete("/professors/:professorId", async (c) => {
  try {
    const { professorId } = c.req.param();
    const existProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
    });
    if (!existProfessor) {
      return c.json({ message: "Professor does not exist" }, 400);
    }
    await prisma.professor.delete({
      where: { id: professorId },
    });
    return c.json({ message: "Professor deleted successfully" }, 200);
  } catch (e) {
    return c.json({ message: "INTERNAL SERVER ERROR" }, 500);
  }
});

//Assigns a student under the protorship of the professor referenced by professorId.
app.post("professors/:professorId/proctorships", async (c) => {
  try {
    const { professorId } = c.req.param();
    const { studentId } = c.req.body;
    

  
  

serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
