const prisma = require('../config/db');

class User {
  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  static async findAll() {
    return prisma.user.findMany({ orderBy: { id: 'asc' } });
  }

  static async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create({ name, email, phone, city, country, age, password }) {
    return prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        phone: phone || '',
        city: city || '',
        country: country || '',
        age: age ?? null,
        passwordHash: password || ''
      }
    });
  }

  static async update(id, values) {
    const allowedFields = ['name', 'email', 'phone', 'city', 'country', 'age'];
    const data = Object.fromEntries(
      Object.entries(values).filter(([key]) => allowedFields.includes(key))
    );
    if (data.email) data.email = data.email.trim().toLowerCase();
    if (values.password !== undefined) {
      data.passwordHash = values.password;
    }

    try {
      return await prisma.user.update({ where: { id }, data });
    } catch (error) {
      if (error.code === 'P2025') return null;
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') return null;
      throw error;
    }
  }
}

module.exports = User;
