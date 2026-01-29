const mongoose = require('mongoose');
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

// Define Department Schema (inline)
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

// Add new department
async function addDepartment() {
  try {
    // Check if department already exists
    const existing = await Department.findOne({ name: 'Quick Commerce' });
    
    if (existing) {
      console.log('ℹ️  Department "Quick Commerce" already exists!');
      console.log('Department ID:', existing._id);
      process.exit(0);
    }

    // Create new department
    const department = await Department.create({
      name: 'Quick Commerce',
      description: 'Quick Commerce Department for rapid delivery operations'
    });

    console.log('✅ Department created successfully!');
    console.log('Department Name:', department.name);
    console.log('Department ID:', department._id);
    console.log('\n📝 Next steps:');
    console.log('1. Login as admin');
    console.log('2. Go to Admin Panel → Users');
    console.log('3. Create users for this department');
    console.log('4. Go to Admin Panel → Approval Flow');
    console.log('5. Configure levels and assign handlers');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding department:', error.message);
    process.exit(1);
  }
}

// Run the function
addDepartment();
