const { prisma } = require('../config/db');

exports.getCategories = async (req, res, next) => { try {
  const data = await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { courses: true } } } });
  res.status(200).json({ success: true, data });
} catch (error) { next(error); } };
exports.createCategory = async (req, res, next) => { try {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ success: false, error: 'Category name is required.' });
  const data = await prisma.category.create({ data: { name, description: req.body.description || null } });
  res.status(201).json({ success: true, data });
} catch (error) { if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'A category with this name already exists.' }); next(error); } };
exports.updateCategory = async (req, res, next) => { try {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ success: false, error: 'Category name is required.' });
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Category not found.' });
  const data = await prisma.$transaction(async (tx) => { const updated = await tx.category.update({ where: { id: req.params.id }, data: { name, description: req.body.description ?? existing.description } }); await tx.course.updateMany({ where: { categoryId: updated.id }, data: { category: updated.name } }); return updated; });
  res.status(200).json({ success: true, data });
} catch (error) { next(error); } };
exports.deleteCategory = async (req, res, next) => { try {
  const category = await prisma.category.findUnique({ where: { id: req.params.id }, include: { _count: { select: { courses: true } } } });
  if (!category) return res.status(404).json({ success: false, error: 'Category not found.' });
  if (category._count.courses) return res.status(409).json({ success: false, error: 'A category in use by courses cannot be deleted.' });
  await prisma.category.delete({ where: { id: category.id } }); res.status(204).send();
} catch (error) { next(error); } };
