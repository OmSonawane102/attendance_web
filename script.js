// Sample data stored in memory
let currentUser = null;
let teachers = [
    { id: 'T001', name: 'Prof. Smith', email: 'smith@example.com', password: 'password' }
];
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

    // Find teacher
    const teacher = teachers.find(t => t.id === id);
    
    if (teacher) {
        if (teacher.password === password) {
            currentUser = { type: 'teacher', data: teacher };
            showPage('teacherPage');
            loadTeacherDashboard();
        } else {
            showLoginError('Invalid password! Please try again.');
        }
    } else {
        showLoginError(`Teacher with ID "${id}" not found in the system. Please check your Teacher ID.`);
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('loginErrorMsg');
    errorEl.textContent = '⚠️ ' + message;
    errorEl.style.display = 'block';
}

function registerTeacher(event) {
    event.preventDefault();
    
    const id = document.getElementById('regTeacherId').value.trim();
    const name = document.getElementById('regTeacherName').value.trim();
    const email = document.getElementById('regTeacherEmail').value.trim();
    const password = document.getElementById('regTeacherPassword').value;
    const confirmPassword = document.getElementById('regTeacherConfirmPassword').value;

    // Clear previous messages
    document.getElementById('registerErrorMsg').style.display = 'none';
    document.getElementById('registerSuccessMsg').style.display = 'none';

    // Check if teacher ID already exists
    if (teachers.find(t => t.id === id)) {
        showErrorMessage('registerErrorMsg', 'Teacher ID already exists! Please choose a different ID.');
        return;
    }

    // Check if email already exists
    if (teachers.find(t => t.email === email)) {
        showErrorMessage('registerErrorMsg', 'Email already registered! Please use a different email.');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showErrorMessage('registerErrorMsg', 'Passwords do not match! Please try again.');
        return;
    }

    // Add new teacher
    teachers.push({ id, name, email, password });
    
    showSuccessMessage('registerSuccessMsg', 'Registration successful! Redirecting to login...');
    
    // Clear form
    document.getElementById('regTeacherId').value = '';
    document.getElementById('regTeacherName').value = '';
    document.getElementById('regTeacherEmail').value = '';
    document.getElementById('regTeacherPassword').value = '';
    document.getElementById('regTeacherConfirmPassword').value = '';
    
    setTimeout(() => {
        showPage('loginPage');
    }, 2000);
}

function logout() {
    currentUser = null;
    
    // Clear login form fields
    document.getElementById('studentId').value = '';
    document.getElementById('studentPassword').value = '';
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherPassword').value = '';
    
    // Hide any error messages
    document.getElementById('loginErrorMsg').style.display = 'none';
    
    showPage('loginPage');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function loadTeacherDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const teacher = currentUser.data;
    
    // Update teacher welcome message
    document.querySelector('#teacherPage h1').textContent = `👨‍🏫 Welcome, ${teacher.name}!`;
    
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
            <div class="attendance-controls">
                <button class="btn-secondary" onclick="editStudent('${student.id}')" style="width: auto; padding: 8px 20px;">Edit</button>
                <button class="btn-danger" onclick="deleteStudent('${student.id}')" style="width: auto; padding: 8px 20px;">Delete</button>
            </div>
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

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found!');
        return;
    }

    // Pre-fill the edit form with student data
    document.getElementById('editStudentId').value = student.id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentClass').value = student.class;
    document.getElementById('editStudentEmail').value = student.email;

    // Show edit page
    showPage('editStudentPage');
}

function updateStudent(event) {
    event.preventDefault();
    const id = document.getElementById('editStudentId').value;
    const name = document.getElementById('editStudentName').value;
    const studentClass = document.getElementById('editStudentClass').value;
    const email = document.getElementById('editStudentEmail').value;

    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex === -1) {
        showErrorMessage('editStudentErrorMsg', 'Student not found!');
        return;
    }

    // Update student data (keep attendance history)
    students[studentIndex].name = name;
    students[studentIndex].class = studentClass;
    students[studentIndex].email = email;

    showSuccessMessage('editStudentSuccessMsg', 'Student updated successfully!');
    
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

// PDF Download Functions
async function downloadStudentReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const student = currentUser.data;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('Attendance Report', 105, 20, { align: 'center' });
    
    // Add student info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Student Name: ${student.name}`, 20, 40);
    doc.text(`Student ID: ${student.id}`, 20, 50);
    doc.text(`Class: ${student.class}`, 20, 60);
    doc.text(`Email: ${student.email}`, 20, 70);
    
    // Calculate statistics
    const totalClasses = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const absentCount = totalClasses - presentCount;
    const attendancePercent = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
    
    // Add statistics
    doc.text(`Total Classes: ${totalClasses}`, 20, 85);
    doc.text(`Present: ${presentCount}`, 20, 95);
    doc.text(`Absent: ${absentCount}`, 20, 105);
    doc.text(`Attendance Rate: ${attendancePercent}%`, 20, 115);
    
    // Add attendance history table
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Attendance History', 20, 135);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPos = 145;
    const headers = ['Date', 'Day', 'Status'];
    
    // Table headers
    doc.setFont(undefined, 'bold');
    doc.text(headers[0], 20, yPos);
    doc.text(headers[1], 70, yPos);
    doc.text(headers[2], 120, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Table rows
    doc.setFont(undefined, 'normal');
    yPos += 10;
    
    const recentAttendance = student.attendance.slice(-15).reverse();
    recentAttendance.forEach((record, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        const date = new Date(record.date);
        doc.text(date.toLocaleDateString(), 20, yPos);
        doc.text(date.toLocaleDateString('en-US', { weekday: 'long' }), 70, yPos);
        
        if (record.status === 'present') {
            doc.setTextColor(39, 174, 96);
        } else {
            doc.setTextColor(231, 76, 60);
        }
        doc.text(record.status.toUpperCase(), 120, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 8;
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`Attendance_Report_${student.id}_${student.name.replace(/\s+/g, '_')}.pdf`);
}

async function downloadTeacherReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const teacher = currentUser.data;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('Class Attendance Report', 105, 20, { align: 'center' });
    
    // Add teacher info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Teacher: ${teacher.name}`, 20, 40);
    doc.text(`Teacher ID: ${teacher.id}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    
    // Add student attendance summary
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Student Attendance Summary', 20, 80);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPos = 90;
    const headers = ['Student ID', 'Name', 'Class', 'Total', 'Present', 'Absent', 'Rate'];
    
    // Table headers
    doc.setFont(undefined, 'bold');
    doc.text(headers[0], 20, yPos);
    doc.text(headers[1], 50, yPos);
    doc.text(headers[2], 90, yPos);
    doc.text(headers[3], 115, yPos);
    doc.text(headers[4], 135, yPos);
    doc.text(headers[5], 155, yPos);
    doc.text(headers[6], 175, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Table rows
    doc.setFont(undefined, 'normal');
    yPos += 10;
    
    students.forEach((student, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        const totalClasses = student.attendance.length;
        const presentCount = student.attendance.filter(a => a.status === 'present').length;
        const absentCount = totalClasses - presentCount;
        const attendancePercent = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
        
        doc.text(student.id, 20, yPos);
        doc.text(student.name.substring(0, 15), 50, yPos);
        doc.text(student.class, 90, yPos);
        doc.text(totalClasses.toString(), 115, yPos);
        doc.text(presentCount.toString(), 135, yPos);
        doc.text(absentCount.toString(), 155, yPos);
        doc.text(attendancePercent + '%', 175, yPos);
        
        yPos += 8;
    });
    
    // Add overall statistics
    yPos += 10;
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Overall Statistics', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Students: ${students.length}`, 20, yPos);
    
    const overallAverage = students.reduce((sum, student) => {
        const total = student.attendance.length;
        const present = student.attendance.filter(a => a.status === 'present').length;
        return sum + (total > 0 ? (present / total) * 100 : 0);
    }, 0) / students.length;
    
    doc.text(`Class Average Attendance: ${overallAverage.toFixed(1)}%`, 20, yPos + 10);
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`Class_Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
