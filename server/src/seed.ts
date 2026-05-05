import mongoose from 'mongoose';

import dotenv from 'dotenv';

import bcrypt from 'bcryptjs';

import User from './models/User.model';

import Category from './models/Category.model';

import Product from './models/Product.model';

import Settings from './models/Settings.model';

import { CATALOG_CATEGORY_DEFINITIONS } from './constants/catalogCategories';



dotenv.config();



const seedDB = async () => {

  try {

    const mongoUri =

      process.env.MONGO_URI ||

      process.env.MONGODB_URI ||

      'mongodb://127.0.0.1:27017/roviks';

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    

    // Clear existing data

    await User.deleteMany({});

    await Category.deleteMany({});

    await Product.deleteMany({});

    await Settings.deleteMany({});



    // Insert admin user

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({

      email: 'admin@roviks.com',

      password: hashedPassword,

      fullName: 'Admin',

      phone: '9999999999',

      whatsappNumber: '919999999999',

      city: 'Indore',

      role: 'admin',

      isApproved: true

    });



    // Insert the canonical catalog categories

    await Category.create(

      CATALOG_CATEGORY_DEFINITIONS.map((definition) => ({

        name: definition.name,

        slug: definition.slug,

        kind: definition.kind,

        sortOrder: definition.sortOrder,

      }))

    );



    // Insert settings record

    await Settings.create({

      key: 'whatsappNumber',

      value: '919999999999'

    });



    console.log("Seeding complete");

    await mongoose.disconnect();

  } catch (error) {

    console.error("Seeding error:", error);

    process.exit(1);

  }

};



seedDB();

