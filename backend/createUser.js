const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define User Schema (inline)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'director', 'user'], default: 'user' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  level: { type: Number },
  designation: { type: String },
  departmentAssignments: [{
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Function to create user
async function createUser() {
  try {
    // Get user details from command line arguments or use defaults
    const args = process.argv.slice(2);
    
    let name, email, password, role;
    
    if (args.length === 0) {
      // Default: Create admin user
      name = 'Admin';
      email = 'admin@ecsosoulhome.com';
      password = 'admin@123';
      role = 'admin';
    } else if (args.length === 4) {
      // Custom user
      [name, email, password, role] = args;
    } else {
      console.log('\n❌ Invalid arguments!');
      console.log('\n📖 Usage:');
      console.log('  node createUser.js                                    (Creates default admin)');
      console.log('  node createUser.js "Name" "email@example.com" "password" "role"');
      console.log('\n📝 Examples:');
      console.log('  node createUser.js                                    (Admin)');
      console.log('  node createUser.js "John Doe" "john@example.com" "pass123" "user"');
      console.log('  node createUser.js "Jane Smith" "jane@example.com" "pass123" "director"');
      console.log('\n🎭 Roles: admin, director, user');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`\nℹ️  User with email "${email}" already exists!`);
      console.log('User Details:');
      console.log(`  Name: ${existingUser.name}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Role: ${existingUser.role}`);
      console.log(`  Status: ${existingUser.isActive ? 'Active' : 'Inactive'}`);
      process.exit(0);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true
    });

    console.log('\n✅ User created successfully!');
    console.log('\n👤 User Details:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password: ${password} (Save this!)`);
    console.log(`  User ID: ${user._id}`);
    
    console.log('\n📝 Next Steps:');
    if (role === 'user') {
      console.log('  1. Login as admin');
      console.log('  2. Go to Admin Panel → Users');
      console.log('  3. Edit this user to assign department and level');
    } else if (role === 'director') {
      console.log('  1. Login as admin');
      console.log('  2. Go to Admin Panel → Users');
      console.log('  3. Edit this user to assign department access');
    } else {
      console.log('  ✓ Admin user is ready to use!');
      console.log('  Login at: http://localhost:3000/login');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    process.exit(1);
  }
}

// Run the function
createUser();
