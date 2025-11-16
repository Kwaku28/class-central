-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "name" TEXT,
ADD COLUMN     "surname" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "recipientType" TEXT DEFAULT 'individual';
