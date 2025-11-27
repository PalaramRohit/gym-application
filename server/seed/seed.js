require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const WorkoutPlan = require('../models/WorkoutPlan');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Trainer.deleteMany({});
    await Plan.deleteMany({});
    await Subscription.deleteMany({});
    await WorkoutPlan.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Creating users...');
    const saltRounds = 10;

    // Create admin
    const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.test',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1234567890',
    });

    // Create trainers
    const trainers = [];
    const trainerPasswords = ['Trainer@123', 'Trainer@123', 'Trainer@123'];
    const trainerData = [
      { name: 'Sarah Johnson', email: 'trainer1@demo.test', specialty: 'Yoga', experienceYears: 5 },
      { name: 'Mike Chen', email: 'trainer2@demo.test', specialty: 'Strength Training', experienceYears: 8 },
      { name: 'Emma Davis', email: 'trainer3@demo.test', specialty: 'Cardio', experienceYears: 3 },
    ];

    for (let i = 0; i < trainerData.length; i++) {
      const passwordHash = await bcrypt.hash(trainerPasswords[i], saltRounds);
      const trainerUser = await User.create({
        name: trainerData[i].name,
        email: trainerData[i].email,
        passwordHash,
        role: 'trainer',
        phone: `+123456789${i + 1}`,
      });

      const trainer = await Trainer.create({
        userId: trainerUser._id,
        bio: `Experienced ${trainerData[i].specialty} trainer with ${trainerData[i].experienceYears} years of expertise.`,
        specialty: trainerData[i].specialty,
        experienceYears: trainerData[i].experienceYears,
      });

      trainers.push({ user: trainerUser, profile: trainer });
    }

    // Create members
    const members = [];
    const memberPasswords = Array(10).fill('Member@123');
    const memberNames = [
      'John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Miller',
      'Diana Garcia', 'Frank Martinez', 'Grace Lee', 'Henry Taylor', 'Ivy Anderson',
    ];

    for (let i = 0; i < memberNames.length; i++) {
      const passwordHash = await bcrypt.hash(memberPasswords[i], saltRounds);
      const dob = new Date(1990 + (i % 20), i % 12, (i % 28) + 1);
      const member = await User.create({
        name: memberNames[i],
        email: `member${i + 1}@demo.test`,
        passwordHash,
        role: 'member',
        phone: `+198765432${i}`,
        dob,
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          phone: `+198765432${i + 10}`,
          relationship: 'Spouse',
        },
      });
      members.push(member);
    }

    console.log('Creating plans...');
    const plans = await Plan.insertMany([
      {
        name: 'Basic Plan',
        durationInDays: 30,
        price: 49.99,
        perks: ['Access to gym', 'Locker room', 'Free consultation'],
        maxSessionsPerWeek: 3,
      },
      {
        name: 'Standard Plan',
        durationInDays: 90,
        price: 129.99,
        perks: ['Access to gym', 'Locker room', 'Free consultation', 'Group classes', 'Nutrition guide'],
        maxSessionsPerWeek: 5,
      },
      {
        name: 'Premium Plan',
        durationInDays: 365,
        price: 399.99,
        perks: [
          'Access to gym',
          'Locker room',
          'Free consultation',
          'Group classes',
          'Nutrition guide',
          'Personal trainer sessions',
          'Spa access',
        ],
        maxSessionsPerWeek: null, // Unlimited
      },
    ]);

    console.log('Creating subscriptions...');
    const subscriptions = [];
    for (let i = 0; i < members.length; i++) {
      const plan = plans[i % plans.length];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 5)); // Stagger start dates
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);

      const status = i < 7 ? 'active' : i < 9 ? 'expired' : 'cancelled';

      const subscription = await Subscription.create({
        memberId: members[i]._id,
        planId: plan._id,
        startDate,
        endDate,
        status,
        paymentRef: `PAY-${Date.now()}-${i}`,
      });
      subscriptions.push(subscription);
    }

    console.log('Creating workout plans...');
    const workoutPlans = [];
    for (let i = 0; i < 5; i++) {
      const sessions = [
        { dayOfWeek: 'Monday', exercise: 'Chest Press', reps: '10', sets: '3', notes: 'Focus on form' },
        { dayOfWeek: 'Wednesday', exercise: 'Squats', reps: '12', sets: '4', notes: 'Full depth' },
        { dayOfWeek: 'Friday', exercise: 'Deadlifts', reps: '8', sets: '3', notes: 'Progressive overload' },
      ];

      const workoutPlan = await WorkoutPlan.create({
        trainerId: trainers[i % trainers.length].user._id,
        memberId: members[i]._id,
        title: `Workout Plan for ${members[i].name}`,
        sessions,
      });
      workoutPlans.push(workoutPlan);
    }

    console.log('Creating attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    for (let day = 0; day < 30; day++) {
      const checkinDate = new Date(today);
      checkinDate.setDate(checkinDate.getDate() - day);

      // Create 2-5 check-ins per day
      const checkinsPerDay = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < checkinsPerDay && j < members.length; j++) {
        const memberIndex = (day * checkinsPerDay + j) % members.length;
        const member = members[memberIndex];
        const trainer = trainers[Math.floor(Math.random() * trainers.length)];

        const checkinTime = new Date(checkinDate);
        checkinTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

        const methods = ['web', 'manual', 'photo'];
        const method = methods[Math.floor(Math.random() * methods.length)];

        const attendance = await Attendance.create({
          memberId: member._id,
          trainerId: trainer.user._id,
          checkinAt: checkinTime,
          method,
          photoUrl: method === 'photo' ? `https://via.placeholder.com/300?text=Check-in+${day}-${j}` : '',
        });
        attendanceRecords.push(attendance);
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@demo.test / Admin@123');
    console.log('Trainer 1: trainer1@demo.test / Trainer@123');
    console.log('Trainer 2: trainer2@demo.test / Trainer@123');
    console.log('Trainer 3: trainer3@demo.test / Trainer@123');
    console.log('Member 1: member1@demo.test / Member@123');
    console.log('Member 2: member2@demo.test / Member@123');
    console.log('... (member3-10@demo.test / Member@123)');
    console.log('\nSummary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Trainers: ${await Trainer.countDocuments()}`);
    console.log(`- Plans: ${await Plan.countDocuments()}`);
    console.log(`- Subscriptions: ${await Subscription.countDocuments()}`);
    console.log(`- Workout Plans: ${await WorkoutPlan.countDocuments()}`);
    console.log(`- Attendance Records: ${await Attendance.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

