-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "building" VARCHAR(50) NOT NULL DEFAULT 'Emerald House',
ADD COLUMN     "grid_column" INTEGER,
ADD COLUMN     "grid_row" INTEGER;
