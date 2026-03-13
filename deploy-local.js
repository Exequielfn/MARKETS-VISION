#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

console.log('🚀 Starting local deployment...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  '.env'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    if (file === '.env') {
      console.log('   Create .env file with your Supabase credentials');
      console.log('   See .env.example for reference');
    }
  }
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
try {
  const envContent = readFileSync('.env', 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

  console.log(`${hasSupabaseUrl ? '✅' : '❌'} VITE_SUPABASE_URL`);
  console.log(`${hasSupabaseKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY`);
} catch (error) {
  console.log('❌ Could not read .env file');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Type check
console.log('\n🔍 Running type check...');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✅ Type check passed');
} catch (error) {
  console.error('❌ Type check failed');
  console.log('Please fix TypeScript errors before deploying');
  process.exit(1);
}

// Build the application
console.log('\n🏗️  Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Start preview server
console.log('\n🌐 Starting preview server...');
try {
  console.log('Preview server will start on http://localhost:4173');
  console.log('Press Ctrl+C to stop the server\n');
  execSync('npm run preview', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start preview server');
  process.exit(1);
}
