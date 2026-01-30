-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "xp_points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "coin_reward" INTEGER NOT NULL DEFAULT 0,
    "progress_target" INTEGER NOT NULL,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "season" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestCompletion" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "badge_color" TEXT,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelMilestone" (
    "level" INTEGER NOT NULL,
    "xp_required" INTEGER NOT NULL,

    CONSTRAINT "LevelMilestone_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "related_id" TEXT,
    "related_type" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_trades" BOOLEAN NOT NULL DEFAULT true,
    "email_quests" BOOLEAN NOT NULL DEFAULT true,
    "email_messages" BOOLEAN NOT NULL DEFAULT true,
    "email_reviews" BOOLEAN NOT NULL DEFAULT true,
    "email_comments" BOOLEAN NOT NULL DEFAULT true,
    "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
    "in_app_trades" BOOLEAN NOT NULL DEFAULT true,
    "in_app_quests" BOOLEAN NOT NULL DEFAULT true,
    "in_app_messages" BOOLEAN NOT NULL DEFAULT true,
    "in_app_reviews" BOOLEAN NOT NULL DEFAULT true,
    "in_app_comments" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quest_category_idx" ON "Quest"("category");

-- CreateIndex
CREATE INDEX "Quest_type_idx" ON "Quest"("type");

-- CreateIndex
CREATE INDEX "Quest_is_active_idx" ON "Quest"("is_active");

-- CreateIndex
CREATE INDEX "QuestCompletion_user_id_idx" ON "QuestCompletion"("user_id");

-- CreateIndex
CREATE INDEX "QuestCompletion_quest_id_idx" ON "QuestCompletion"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuestCompletion_quest_id_user_id_key" ON "QuestCompletion"("quest_id", "user_id");

-- CreateIndex
CREATE INDEX "Achievement_user_id_idx" ON "Achievement"("user_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_is_read_idx" ON "Notification"("is_read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_user_id_key" ON "NotificationPreference"("user_id");

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
