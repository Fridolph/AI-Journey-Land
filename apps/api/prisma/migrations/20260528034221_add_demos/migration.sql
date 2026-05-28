-- CreateTable
CREATE TABLE "demos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learning_goal" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "route_path" TEXT NOT NULL,
    "api_namespace" TEXT NOT NULL,
    "display_mode" TEXT NOT NULL,
    "owner_package" TEXT NOT NULL,
    "supports_streaming" BOOLEAN NOT NULL DEFAULT false,
    "role_presets" JSONB,
    "report_type_presets" JSONB,
    "input_fields" JSONB,
    "source_url" TEXT,
    "source_files" JSONB,
    "known_limits" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demos_pkey" PRIMARY KEY ("id")
);
