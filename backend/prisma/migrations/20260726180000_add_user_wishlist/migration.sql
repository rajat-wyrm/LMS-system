-- CreateTable
CREATE TABLE "_UserWishlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserWishlist_AB_unique" ON "_UserWishlist"("A", "B");

-- CreateIndex
CREATE INDEX "_UserWishlist_B_index" ON "_UserWishlist"("B");

-- AddForeignKey
ALTER TABLE "_UserWishlist" ADD CONSTRAINT "_UserWishlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserWishlist" ADD CONSTRAINT "_UserWishlist_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
