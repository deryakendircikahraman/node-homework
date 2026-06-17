-- DropForeignKey
ALTER TABLE "backlog" DROP CONSTRAINT IF EXISTS "backlog_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task_logs" DROP CONSTRAINT IF EXISTS "task_logs_task_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "backlog";

-- DropTable
DROP TABLE IF EXISTS "task_logs";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "roles";
