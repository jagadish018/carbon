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
  const { name, dateOfBirth, aadharNumber } = await c.req.json();
  try {
    // Check if Aadhar number already exists
    const existAadhar = await prisma.student.findUnique({
      where: { aadharNumber },
    });
    if (existAadhar) {
      return c.json({ message: "Aadhar number already exists" }, 400);
    }

    // Create student
    const student = await prisma.student.create({
      data:{
        name,
        dateOfBirth,
        aadharNumber
        
      },
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
app.post("/professors/:professorId/proctorships", async (c) => {
  const { professorId } = c.req.param();
  const { studentId } = await c.req.json();

  try {
    // Verify professor exists
    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
    });
    if (!professor) {
      return c.json({ error: "Professor not found" }, 404);
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    // Update student's proctorId
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { proctorId: professorId },
    });

    return c.json(
      { message: "Student assigned to proctor", student: updatedStudent },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});


//Returns the library membership details of the specified student.
app.get("/students/:studentId/library-membership", async (c) => {
  try {
    const { studentId } = c.req.param();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }
    const libraryMembership = await prisma.libraryMembership.findUnique({
      where: { studentId: studentId },
    });
    if (!libraryMembership) {
      return c.json({ error: "Student has no library membership" }, 404);
    }
    return c.json(libraryMembership, 200);

  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
  
});
    

//Creates a library membership for the specified student. Ensure no duplicate library memberships for a student.
app.post("/students/:studentId/library-membership", async (c) => {
  try {
    const { issueDate, expiryDate } = await c.req.json();
    const { studentId } = c.req.param();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }
    const libraryMembership = await prisma.libraryMembership.findUnique({
      where: { studentId: studentId },
    });
    if (libraryMembership) {
      return c.json({ error: "Student already has a library membership" }, 400);
    }
    const newLibraryMembership = await prisma.libraryMembership.create({
      data: {
        studentId:studentId,
        issueDate,
        expiryDate
      },
    })
    return c.json(newLibraryMembership, 201);
  }
  catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
    }
});

  
//Updates the library membership details of the specified student.
app.patch("/students/:studentId/library-membership", async (c) => {
  try {
    
    const { issueDate, expiryDate } = await c.req.json();
    const { studentId } = c.req.param();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }
    const libraryMembership = await prisma.libraryMembership.findUnique({
      where: { studentId: studentId },
    });
    if (!libraryMembership) {
      return c.json({ error: "Student does not have a library membership" }, 400);
    }
    const updatedLibraryMembership = await prisma.libraryMembership.update({
      where: { studentId: studentId },
      data: {
        issueDate,
        expiryDate
      },
    })
    return c.json(updatedLibraryMembership, 200);
  } catch (error)
  {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);

  }
});

//Deletes the library membership of the specified student.
app.delete("/students/:studentId/library-membership", async (c) => {
  try {
    const { studentId } = c.req.param();
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }
    const libraryMembership = await prisma.libraryMembership.findUnique({
      where: { studentId: studentId },
    });
    if (!libraryMembership) {
      return c.json({ error: "Student does not have a library membership" }, 400);
    }
    await prisma.libraryMembership.delete({
      where: { studentId: studentId },
    });
    return c.json({ message: "Library membership deleted successfully" }, 200);
    
  }
  catch (error)
  {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }

});

serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
