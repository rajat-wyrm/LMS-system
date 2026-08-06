-- Add description column if it does not yet exist (added by 20260726201500_add_categories)
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Backfill categories from existing course category strings (case-insensitive)
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
SELECT DISTINCT ON (lower(btrim("category")))
       md5(lower(btrim("category"))) || 'cat',
       btrim("category"),
       NOW(),
       NOW()
FROM "Course"
WHERE btrim("category") <> ''
ON CONFLICT ("name") DO NOTHING;

-- Add categoryId column if it does not yet exist (nullable so it can be backfilled)
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Link each course to its category by name (case-insensitive)
UPDATE "Course" c
SET "categoryId" = cat."id"
FROM "Category" cat
WHERE lower(btrim(c."category")) = lower(cat."name");

-- Ensure every course has a category (fallback for empty/blank values)
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
SELECT md5('other') || 'cat', 'Other', NOW(), NOW()
WHERE EXISTS (SELECT 1 FROM "Course" WHERE "categoryId" IS NULL)
ON CONFLICT ("name") DO NOTHING;

UPDATE "Course"
SET "categoryId" = md5('other') || 'cat'
WHERE "categoryId" IS NULL;

-- Make categoryId required
ALTER TABLE "Course" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop the duplicated string-based category column
ALTER TABLE "Course" DROP COLUMN IF EXISTS "category";

-- Re-point the FK to RESTRICT (single source of truth is categoryId)
ALTER TABLE "Course" DROP CONSTRAINT IF EXISTS "Course_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
