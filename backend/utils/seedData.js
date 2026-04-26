const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Budget = require('../models/Budget');

const seedDatabase = async () => {
  try {
    const clubCount = await Club.countDocuments();
    if (clubCount > 0) {
      console.log('Database already seeded with clubs.');
      return;
    }

    console.log('Seeding dummy data...');

    // 1. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@college.edu',
      password: hashedAdminPassword,
      role: 'admin'
    });

    // 2. Create Club Heads
    const hashedUserPassword = await bcrypt.hash('password123', salt);
    const clubHeads = [];
    for (let i = 1; i <= 6; i++) {
      const head = await User.create({
        name: `Club Head ${i}`,
        email: `head${i}@college.edu`,
        password: hashedUserPassword,
        role: 'club_head'
      });
      clubHeads.push(head);
    }

    // 3. Create Students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@college.edu`,
        password: hashedUserPassword,
        role: 'student',
        prn: `PRN202400${i}`,
        department: 'Computer Science',
        year: 3
      });
      students.push(student);
    }

    // 4. Create Clubs
    const clubData = [
      {
        clubName: 'Google Developer Student Club',
        description: 'Learn, connect, and grow with fellow developers. We host tech talks, workshops, and hackathons.',
        logoUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=200&auto=format&fit=crop',
      },
      {
        clubName: 'Cultural & Arts Society',
        description: 'Embrace the vibrant culture through dance, music, and art exhibitions.',
        logoUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=200&auto=format&fit=crop',
      },
      {
        clubName: 'Robotics & AI Lab',
        description: 'Building the future of automation, drones, and artificial intelligence.',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=200&auto=format&fit=crop',
      },
      {
        clubName: 'Eco Warriors',
        description: 'Dedicated to sustainability, campus cleanups, and environmental awareness.',
        logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=200&auto=format&fit=crop',
      },
      {
        clubName: 'Sports Syndicate',
        description: 'Organizing inter-college tournaments and promoting physical fitness.',
        logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=200&auto=format&fit=crop',
      },
      {
        clubName: 'Finance & Investment Club',
        description: 'Learn stock trading, personal finance, and participate in mock trading competitions.',
        logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=200&auto=format&fit=crop',
      }
    ];

    const clubs = [];
    for (let i = 0; i < clubData.length; i++) {
      const club = await Club.create({
        ...clubData[i],
        clubHeadId: clubHeads[i]._id
      });
      clubs.push(club);

      // Create a budget for each club
      await Budget.create({
        clubId: club._id,
        amount: 50000,
        expenses: []
      });
    }

    // 5. Create Events
    const eventImages = [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop', // Tech
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', // Dance/Culture
      'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=800&auto=format&fit=crop', // Robotics
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop', // Eco
      'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop', // Sports
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop'  // Finance
    ];

    const eventNames = [
      'Annual Hackathon 2024',
      'Spring Cultural Fest',
      'RoboWars Championship',
      'Campus Cleanup Drive',
      'Inter-College Football Tournament',
      'Mock Stock Trading Competition'
    ];

    for (let i = 0; i < clubs.length; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i + 5)); // Random future date

      await Event.create({
        title: eventNames[i],
        description: `Join us for the most awaited event of the year hosted by ${clubs[i].clubName}. It will be an exciting day full of learning and fun!`,
        date: futureDate,
        clubId: clubs[i]._id,
        imageUrl: eventImages[i] // Not strictly required by schema but good if frontend uses it later
      });
    }

    console.log('Dummy data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedDatabase;
