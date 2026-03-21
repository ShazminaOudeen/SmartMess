const createUser = async (data) => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        
        if (res.ok) {
            console.log(`✅ Created ${data.role} account:\n   Email: ${data.email}\n   Password: ${data.password}\n`);
        } else if (json.message && json.message.includes('already exists')) {
            console.log(`⚠️ ${data.role} account (${data.email}) already exists. You can use it to login with your previously set password.\n`);
        } else {
            console.error(`❌ Failed to create ${data.role}:`, json.message, '\n');
        }
    } catch (e) {
        console.error(`❌ Network error for ${data.role}:`, e.message, 'Make sure the Node backend is running on port 5000.\n');
    }
}

async function seed() {
    console.log('--- 🌱 SmartMess User Seeder ---\n');

    await createUser({
        name: 'System Admin',
        email: 'admin@smartmess.com',
        password: 'password123',
        role: 'admin',
        phone: '+94 77 000 0001'
    });

    await createUser({
        name: 'SLIIT Main Canteen',
        email: 'canteen@smartmess.com',
        password: 'password123',
        role: 'canteen',
        phone: '+94 77 000 0002',
        canteenName: 'Main Canteen',
        location: 'Ground Floor Block A',
        licenseNumber: 'LIC-1001'
    });

    await createUser({
        name: 'Student Demo',
        email: 'student@smartmess.com',
        password: 'password123',
        role: 'student',
        phone: '+94 77 000 0003',
        university: 'SLIIT',
        studentId: 'IT00000001'
    });
}

seed();
