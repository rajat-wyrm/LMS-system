const { prisma } = require('../config/db');

async function findOrCreateCategoryByName(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;
  const existing = await prisma.category.findUnique({ where: { name: trimmed } });
  if (existing) return existing;
  return prisma.category.create({ data: { name: trimmed } });
}

// Resolve a category from an id or a category name string.
// Returns { ok: true, categoryId, categoryName } or { ok: false, error }.
async function resolveCategoryId({ categoryId, category } = {}) {
  if (categoryId) {
    const found = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!found) {
      return { ok: false, error: 'Invalid category. The selected category no longer exists.' };
    }
    return { ok: true, categoryId: found.id, categoryName: found.name };
  }

  if (category && String(category).trim()) {
    const found = await findOrCreateCategoryByName(category);
    if (found) {
      return { ok: true, categoryId: found.id, categoryName: found.name };
    }
  }

  return { ok: false, error: 'Category is required' };
}

module.exports = { resolveCategoryId, findOrCreateCategoryByName };
