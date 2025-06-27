//Database setup
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

//Load environment variables
dotenv.config();

const prisma = new PrismaClient();



export default prisma;