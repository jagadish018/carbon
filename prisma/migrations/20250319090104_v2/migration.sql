-- DropForeignKey
ALTER TABLE "LibraryMembership" DROP CONSTRAINT "LibraryMembership_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_proctorId_fkey";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryMembership" ADD CONSTRAINT "LibraryMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
