-- DropForeignKey
ALTER TABLE "LibraryMembership" DROP CONSTRAINT "LibraryMembership_studentId_fkey";

-- AddForeignKey
ALTER TABLE "LibraryMembership" ADD CONSTRAINT "LibraryMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
