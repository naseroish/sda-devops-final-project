import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Wallet from './models/wallet.model';
import Expense from './models/expense.model';
import Budget from './models/budget.model';
import Goal from './models/goal.model';

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error('DATABASE_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Wallet.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    console.log('Cleared existing data');

    // Create a default user ID (simulated)
    const userId = new mongoose.Types.ObjectId();
    const ownerId = userId;

    // Create a Wallet
    const wallet = await Wallet.create({
      name: 'Personal Wallet',
      ownerId: ownerId,
      currency: 'USD',
      members: [{ userId: userId, role: 'owner' }],
    });
    console.log('Created Wallet:', wallet.name);

    // Create Expenses
    const categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];
    const expenses = [];
    for (let i = 0; i < 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.floor(Math.random() * 100) + 10;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

      expenses.push({
        name: `${category} Expense ${i + 1}`,
        amount,
        category,
        date,
        currency: 'USD',
        walletId: wallet._id,
        userId: userId,
      });
    }
    await Expense.insertMany(expenses);
    console.log(`Created ${expenses.length} Expenses`);

    // Create Budgets
    const budgets = [
      {
        name: 'Monthly Food',
        category: 'Food',
        limit: 500,
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        walletId: wallet._id,
        userId: userId,
      },
      {
        name: 'Monthly Transport',
        category: 'Transport',
        limit: 200,
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        walletId: wallet._id,
        userId: userId,
      },
    ];
    await Budget.insertMany(budgets);
    console.log(`Created ${budgets.length} Budgets`);

    // Create Goals
    const goals = [
      {
        name: 'New Laptop',
        targetAmount: 2000,
        currentAmount: 500,
        walletId: wallet._id,
        userId: userId,
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1),
        description: 'Saving for a MacBook Pro',
      },
      {
        name: 'Vacation',
        targetAmount: 3000,
        currentAmount: 1200,
        walletId: wallet._id,
        userId: userId,
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 12, 1),
        description: 'Summer trip to Japan',
      },
    ];
    await Goal.insertMany(goals);
    console.log(`Created ${goals.length} Goals`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
