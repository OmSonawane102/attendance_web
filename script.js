// Sample data stored in memory
let currentUser = null;
let students = [
    { id: 'S001', name: 'John Doe', class: '10-A', email: 'john@example.com', attendance: [] },
    { id: 'S002', name: 'Jane Smith', class: '10-A', email: 'jane@example.com', attendance: [] },
    { id: 'S003', name: 'Bob Johnson', class: '10-B', email: 'bob@example.com', attendance: [] }
];

// Generate some sample attendance data
function initializeSampleData() {
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        students.forEach(student => {
            student.attendance.push({
                date: date.toISOString().split('T')[0],
                status: Math.random() > 0.2 ? 'present' : 'absent'
            });
        });
    }
}
initializeSampleData();

function switchLoginTab(type) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('studentLoginForm').style.display = type === 'student' ? 'block' : 'none';
    document.getElementById('teacherLoginForm').style.display = type === 'teacher' ? 'block' : 'none';
    
    // Hide error message when switching tabs
    document.getElementById('loginErrorMsg').style.display = 'none';
}

function studentLogin() {
    const id = document.getElementById('studentId').value.trim();
    const password = document.getElementById('studentPassword').value;

    // Clear previous error
    document.getElementById('loginErrorMsg').style.display = 'none';

    // Validate input
    if (!id || !password) {
        showLoginError('Please enter both Student ID and Password');
        return;
    }

    // Check password
    if (password !== 'password') {
        showLoginError('Invalid password! Please try again.');
        return;
    }

    // Check if student exists
    const student = students.find(s => s.id === id);
    if (student) {
        currentUser = { type: 'student', data: student };
        showPage('studentPage');
        loadStudentDashboard();
    } else {
        showLoginError(`Student with ID "${id}" not found in the system. Please check your Student ID.`);
    }
}

function teacherLogin() {
    const id = document.getElementById('teacherId').value.trim();
    const password = document.getElementById('teacherPassword').value;

    // Clear previous error
    document.getElementById('loginErrorMsg').style.display = 'none';

    // Validate input
    if (!id || !password) {
        showLoginError('Please enter both Teacher ID and Password');
        return;
    }

    // Check credentials
    if (id === 'T001' && password === 'password') {
        currentUser = { type: 'teacher', data: { id: 'T001', name: 'Prof. Smith' } };
        showPage('teacherPage');
        loadTeacherDashboard();
    } else if (id !== 'T001') {
        showLoginError(`Teacher with ID "${id}" not found in the system. Please check your Teacher ID.`);
    } else {
        showLoginError('Invalid password! Please try again.');
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('loginErrorMsg');
    errorEl.textContent = '⚠️ ' + message;
    errorEl.style.display = 'block';
}

function logout() {
    currentUser = null;
    showPage('loginPage');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function loadTeacherDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    // Load attendance marking section
    const attendanceList = document.getElementById('studentListAttendance');
    attendanceList.innerHTML = students.map(student => {
        const todayAttendance = student.attendance.find(a => a.date === today);
        const status = todayAttendance ? todayAttendance.status : null;
        
        return `
            <div class="student-card">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p>ID: ${student.id} | Class: ${student.class}</p>
                    <p style="color: ${status === 'present' ? '#27ae60' : status === 'absent' ? '#e74c3c' : '#666'}">
                        ${status ? (status === 'present' ? '✓ Present Today' : '✗ Absent Today') : 'Not marked'}
                    </p>
                </div>
                <div class="attendance-controls">
                    <button class="btn-success" onclick="markAttendance('${student.id}', 'present')">Present</button>
                    <button class="btn-warning" onclick="markAttendance('${student.id}', 'absent')">Absent</button>
                </div>
            </div>
        `;
    }).join('');

    // Load manage students section
    const manageList = document.getElementById('studentListManage');
    manageList.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-info">
                <h3>${student.name}</h3>
                <p>ID: ${student.id} | Class: ${student.class} | Email: ${student.email}</p>
            </div>
            <button class="btn-danger" onclick="deleteStudent('${student.id}')" style="width: auto; padding: 8px 20px;">Delete</button>
        </div>
    `).join('');
}

function markAttendance(studentId, status) {
    const student = students.find(s => s.id === studentId);
    const today = new Date().toISOString().split('T')[0];
    
    const existingIndex = student.attendance.findIndex(a => a.date === today);
    if (existingIndex >= 0) {
        student.attendance[existingIndex].status = status;
    } else {
        student.attendance.push({ date: today, status: status });
    }

    showSuccessMessage('teacherSuccessMsg', `Attendance marked as ${status} for ${student.name}`);
    loadTeacherDashboard();
}

function addStudent(event) {
    event.preventDefault();
    const id = document.getElementById('newStudentId').value;
    const name = document.getElementById('newStudentName').value;
    const studentClass = document.getElementById('newStudentClass').value;
    const email = document.getElementById('newStudentEmail').value;

    if (students.find(s => s.id === id)) {
        showErrorMessage('addStudentErrorMsg', 'Student ID already exists!');
        return;
    }

    students.push({ id, name, class: studentClass, email, attendance: [] });
    showSuccessMessage('addStudentSuccessMsg', 'Student added successfully!');
    
    setTimeout(() => {
        showPage('teacherPage');
        loadTeacherDashboard();
    }, 1500);
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== studentId);
        showSuccessMessage('teacherSuccessMsg', 'Student deleted successfully!');
        loadTeacherDashboard();
    }
}

function loadStudentDashboard() {
    const student = currentUser.data;
    
    document.getElementById('studentInfo').innerHTML = `
        <h2>Welcome, ${student.name}!</h2>
        <p style="color: #666; margin-bottom: 30px;">ID: ${student.id} | Class: ${student.class}</p>
    `;

    const totalClasses = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const absentCount = totalClasses - presentCount;
    const attendancePercent = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('attendancePercent').textContent = attendancePercent + '%';

    // Create chart
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (window.attendanceChartInstance) {
        window.attendanceChartInstance.destroy();
    }

    window.attendanceChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [presentCount, absentCount],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} days (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Load attendance history table
    const historyTable = document.getElementById('attendanceHistory');
    historyTable.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${student.attendance.slice(-10).reverse().map(a => {
                const date = new Date(a.date);
                return `
                    <tr>
                        <td>${date.toLocaleDateString()}</td>
                        <td>${date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td class="status-${a.status}">${a.status.toUpperCase()}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
}

function showSuccessMessage(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

function showErrorMessage(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}