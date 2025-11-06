// ===== 配置設定 =====
const CONFIG = {
    // LINE Login Channel ID
    LINE_CHANNEL_ID: '2008438482',
    // Google Apps Script Web App URL（後端 API）
    GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwgKmu3FpmY2tb4FsCgdi6ms6dgbcna8W0J2NKdqBDRk-o2SLme7sMUhC2mZlYkP8bx/exec',
    // LINE Login 重定向 URI（GitHub Pages URL）
    REDIRECT_URI: 'https://eric693.github.io/check_salary_integration/'
};

// ===== 全域變數 =====
let currentUser = null;
let employees = [];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面初始化開始');
    
    // 檢查是否有LINE登入回傳的code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
        console.log('檢測到 LINE 回調參數');
        handleLineCallback(code, state);
    } else {
        checkLoginStatus();
    }
    
    // 更新時間
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 設定預設月份
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const salaryMonthEl = document.getElementById('salaryMonth');
    const reportMonthEl = document.getElementById('reportMonth');
    if (salaryMonthEl) salaryMonthEl.value = currentMonth;
    if (reportMonthEl) reportMonthEl.value = currentMonth;
    
    // 設定預設日期範圍（本月）
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDateEl = document.getElementById('attendanceStartDate');
    const endDateEl = document.getElementById('attendanceEndDate');
    if (startDateEl) startDateEl.value = firstDay.toISOString().slice(0, 10);
    if (endDateEl) endDateEl.value = lastDay.toISOString().slice(0, 10);
});

// ===== LINE 登入功能 =====
function lineLogin() {
    console.log('開始 LINE 登入流程');
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);
    
    // 保存state用於驗證
    sessionStorage.setItem('line_login_state', state);
    sessionStorage.setItem('line_login_nonce', nonce);
    
    // 使用 URLSearchParams 構建參數
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': CONFIG.LINE_CHANNEL_ID,
        'redirect_uri': CONFIG.REDIRECT_URI,
        'state': state,
        'scope': 'profile openid',
        'nonce': nonce
    });
    
    const lineAuthUrl = 'https://access.line.me/oauth2/v2.1/authorize?' + params.toString();
    console.log('LINE Login URL:', lineAuthUrl);
    
    // 重定向到LINE登入頁面
    window.location.href = lineAuthUrl;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function handleLineCallback(code, state) {
    showLoginLoading(true);
    console.log('處理 LINE 回調, code:', code, 'state:', state);
    
    // 驗證state
    const savedState = sessionStorage.getItem('line_login_state');
    console.log('保存的 state:', savedState);
    
    if (state !== savedState) {
        console.error('State 驗證失敗');
        showLoginMessage('登入驗證失敗，請重試', 'error');
        showLoginLoading(false);
        return;
    }
    
    try {
        // 呼叫後端驗證LINE登入
        const response = await callGasFunction('verifyLineLogin', { code: code });
        console.log('LINE 驗證響應:', response);
        
        if (response.success) {
            // 登入成功，保存用戶資訊
            currentUser = response.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // 清理URL參數
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // 清理session storage
            sessionStorage.removeItem('line_login_state');
            sessionStorage.removeItem('line_login_nonce');
            
            // 顯示主系統
            showMainSystem();
        } else {
            console.error('LINE 登入失敗:', response.message);
            showLoginMessage(response.message || '登入失敗，請重試', 'error');
            showLoginLoading(false);
        }
    } catch (error) {
        console.error('LINE登入錯誤:', error);
        showLoginMessage('登入過程發生錯誤：' + error.message, 'error');
        showLoginLoading(false);
    }
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainSystem();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const mainSystem = document.getElementById('mainSystem');
    if (loginPage) loginPage.style.display = 'flex';
    if (mainSystem) mainSystem.style.display = 'none';
}

function showMainSystem() {
    const loginPage = document.getElementById('loginPage');
    const mainSystem = document.getElementById('mainSystem');
    if (loginPage) loginPage.style.display = 'none';
    if (mainSystem) mainSystem.style.display = 'block';
    
    // 更新用戶資訊顯示
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = currentUser.name;
    if (userRoleEl) userRoleEl.textContent = currentUser.role || '員工';
    if (userAvatarEl) userAvatarEl.src = currentUser.picture || 'https://via.placeholder.com/50';
    
    // 載入初始數據
    loadEmployees();
    loadDepartments();
}

function showLoginLoading(show) {
    const loadingEl = document.getElementById('loginLoading');
    if (loadingEl) loadingEl.style.display = show ? 'block' : 'none';
}

function showLoginMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function logout() {
    if (confirm('確定要登出嗎？')) {
        currentUser = null;
        localStorage.removeItem('user');
        showLoginPage();
    }
}

// ===== Google Apps Script 通訊 =====
async function callGasFunction(functionName, params = {}) {
    try {
        console.log('呼叫 GAS 函數:', functionName, params);
        
        const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                function: functionName,
                params: params,
                user: currentUser
            }),
            mode: 'cors' // 允許跨域
        });
        
        if (!response.ok) {
            throw new Error('網路請求失敗: ' + response.status);
        }
        
        const data = await response.json();
        console.log('GAS 響應:', data);
        return data;
    } catch (error) {
        console.error('呼叫GAS函數錯誤:', error);
        throw error;
    }
}

// ===== 日期時間更新 =====
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const dateTimeString = now.toLocaleString('zh-TW', options);
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

// ===== 打卡功能 =====
async function clockIn() {
    const employeeId = document.getElementById('employeeId').value.trim();
    const employeeName = document.getElementById('employeeName').value.trim();
    
    if (!employeeId || !employeeName) {
        showMessage('clockMessage', '請填寫員工編號和姓名', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('clockIn', {
            employeeId: employeeId,
            employeeName: employeeName
        });
        
        if (response.success) {
            showMessage('clockMessage', response.message, 'success');
            updateClockStatus(response.data);
        } else {
            showMessage('clockMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('clockMessage', '打卡失敗，請檢查網路連線', 'error');
    }
}

async function clockOut() {
    const employeeId = document.getElementById('employeeId').value.trim();
    const employeeName = document.getElementById('employeeName').value.trim();
    
    if (!employeeId || !employeeName) {
        showMessage('clockMessage', '請填寫員工編號和姓名', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('clockOut', {
            employeeId: employeeId,
            employeeName: employeeName
        });
        
        if (response.success) {
            showMessage('clockMessage', response.message, 'success');
            updateClockStatus(response.data);
        } else {
            showMessage('clockMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('clockMessage', '打卡失敗，請檢查網路連線', 'error');
    }
}

function updateClockStatus(data) {
    if (data) {
        const statusEl = document.getElementById('clockStatus');
        if (statusEl) statusEl.style.display = 'block';
        
        const timeEl = document.getElementById('lastClockTime');
        const typeEl = document.getElementById('lastClockType');
        const hoursEl = document.getElementById('todayHours');
        
        if (timeEl) timeEl.textContent = data.time || '-';
        if (typeEl) typeEl.textContent = data.type || '-';
        if (hoursEl) hoursEl.textContent = data.hours || '0';
    }
}

// ===== 員工管理功能 =====
async function addEmployee() {
    const employeeId = document.getElementById('newEmployeeId').value.trim();
    const name = document.getElementById('newEmployeeName').value.trim();
    const salary = document.getElementById('newEmployeeSalary').value.trim();
    const department = document.getElementById('newEmployeeDepartment').value.trim();
    const position = document.getElementById('newEmployeePosition').value.trim();
    
    if (!employeeId || !name || !salary || !department || !position) {
        showMessage('employeeMessage', '請填寫所有欄位', 'error');
        return;
    }
    
    if (isNaN(salary) || Number(salary) <= 0) {
        showMessage('employeeMessage', '請輸入有效的薪資金額', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('addEmployee', {
            employeeId: employeeId,
            name: name,
            salary: Number(salary),
            department: department,
            position: position
        });
        
        if (response.success) {
            showMessage('employeeMessage', '員工新增成功', 'success');
            // 清空表單
            document.getElementById('newEmployeeId').value = '';
            document.getElementById('newEmployeeName').value = '';
            document.getElementById('newEmployeeSalary').value = '';
            document.getElementById('newEmployeeDepartment').value = '';
            document.getElementById('newEmployeePosition').value = '';
            // 重新載入員工列表
            loadEmployees();
        } else {
            showMessage('employeeMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('employeeMessage', '新增失敗，請檢查網路連線', 'error');
    }
}

async function loadEmployees() {
    try {
        const response = await callGasFunction('getEmployees');
        
        if (response.success) {
            employees = response.data;
            displayEmployees(employees);
            updateEmployeeSelects(employees);
        } else {
            const tbody = document.getElementById('employeeTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f56565;">載入失敗</td></tr>';
            }
        }
    } catch (error) {
        console.error('載入員工失敗:', error);
        const tbody = document.getElementById('employeeTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f56565;">載入失敗</td></tr>';
        }
    }
}

function displayEmployees(employeeList) {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;
    
    if (!employeeList || employeeList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">目前沒有員工資料</td></tr>';
        return;
    }
    
    tbody.innerHTML = employeeList.map(emp => `
        <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${Number(emp.salary).toLocaleString()}</td>
            <td>
                <button class="action-btn edit" onclick="editEmployee('${emp.employeeId}')">編輯</button>
                <button class="action-btn delete" onclick="deleteEmployee('${emp.employeeId}')">刪除</button>
            </td>
        </tr>
    `).join('');
}

function updateEmployeeSelects(employeeList) {
    const selects = [
        document.getElementById('salaryEmployeeId'),
        document.getElementById('attendanceEmployeeId')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const firstOption = select.options[0].outerHTML;
        
        select.innerHTML = firstOption + employeeList.map(emp => 
            `<option value="${emp.employeeId}">${emp.employeeId} - ${emp.name}</option>`
        ).join('');
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

async function deleteEmployee(employeeId) {
    if (!confirm('確定要刪除此員工嗎？此操作無法復原。')) {
        return;
    }
    
    try {
        const response = await callGasFunction('deleteEmployee', { employeeId: employeeId });
        
        if (response.success) {
            showMessage('employeeMessage', '員工刪除成功', 'success');
            loadEmployees();
        } else {
            showMessage('employeeMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('employeeMessage', '刪除失敗，請檢查網路連線', 'error');
    }
}

function editEmployee(employeeId) {
    alert('編輯功能：請在新增員工區修改資料後重新新增，或在試算表中直接編輯');
}

// ===== 薪資計算功能 =====
async function calculateSalary() {
    const employeeId = document.getElementById('salaryEmployeeId').value;
    const month = document.getElementById('salaryMonth').value;
    
    if (!employeeId) {
        showMessage('salaryMessage', '請選擇員工', 'error');
        return;
    }
    
    if (!month) {
        showMessage('salaryMessage', '請選擇月份', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('calculateMonthlySalary', {
            employeeId: employeeId,
            month: month
        });
        
        if (response.success) {
            displaySalaryResult(response.data);
            showMessage('salaryMessage', '薪資計算完成', 'success');
        } else {
            showMessage('salaryMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('salaryMessage', '計算失敗，請檢查網路連線', 'error');
    }
}

function displaySalaryResult(data) {
    const resultEl = document.getElementById('salaryResult');
    if (resultEl) resultEl.style.display = 'block';
    
    const fields = {
        'resultName': data.name,
        'resultMonth': data.month,
        'resultBaseSalary': Number(data.baseSalary).toLocaleString(),
        'resultRequiredDays': data.requiredDays,
        'resultActualDays': data.actualDays,
        'resultTotalHours': data.totalHours.toFixed(1),
        'resultOvertimePay': Number(data.overtimePay).toLocaleString(),
        'resultDeduction': Number(data.deduction).toLocaleString(),
        'resultNetSalary': Number(data.netSalary).toLocaleString()
    };
    
    Object.keys(fields).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = fields[id];
    });
}

// ===== 出勤記錄查詢 =====
async function queryAttendance() {
    const employeeId = document.getElementById('attendanceEmployeeId').value;
    const startDate = document.getElementById('attendanceStartDate').value;
    const endDate = document.getElementById('attendanceEndDate').value;
    
    if (!startDate || !endDate) {
        showMessage('attendanceMessage', '請選擇日期範圍', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('getAttendanceRecords', {
            employeeId: employeeId,
            startDate: startDate,
            endDate: endDate
        });
        
        if (response.success) {
            displayAttendanceRecords(response.data);
            showMessage('attendanceMessage', `查詢到 ${response.data.length} 筆記錄`, 'info');
        } else {
            showMessage('attendanceMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('attendanceMessage', '查詢失敗，請檢查網路連線', 'error');
    }
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    if (!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">查無資料</td></tr>';
        return;
    }
    
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.date}</td>
            <td>${record.employeeId}</td>
            <td>${record.name}</td>
            <td>${record.clockIn || '-'}</td>
            <td>${record.clockOut || '-'}</td>
            <td>${record.hours ? record.hours.toFixed(1) : '-'}</td>
            <td>${record.status}</td>
        </tr>
    `).join('');
}

// ===== 月報表功能 =====
async function generateReport() {
    const month = document.getElementById('reportMonth').value;
    const department = document.getElementById('reportDepartment').value;
    
    if (!month) {
        showMessage('reportMessage', '請選擇月份', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('generateMonthlyReport', {
            month: month,
            department: department
        });
        
        if (response.success) {
            displayReport(response.data);
            showMessage('reportMessage', '報表生成成功', 'success');
        } else {
            showMessage('reportMessage', response.message, 'error');
        }
    } catch (error) {
        showMessage('reportMessage', '生成報表失敗，請檢查網路連線', 'error');
    }
}

function displayReport(reportData) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    
    if (!reportData || reportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #999;">查無資料</td></tr>';
        return;
    }
    
    tbody.innerHTML = reportData.map(row => `
        <tr>
            <td>${row.employeeId}</td>
            <td>${row.name}</td>
            <td>${row.department}</td>
            <td>${row.position}</td>
            <td>${row.actualDays}</td>
            <td>${row.totalHours.toFixed(1)}</td>
            <td>${Number(row.baseSalary).toLocaleString()}</td>
            <td>${Number(row.overtimePay).toLocaleString()}</td>
            <td>${Number(row.netSalary).toLocaleString()}</td>
        </tr>
    `).join('');
}

async function exportReport() {
    const month = document.getElementById('reportMonth').value;
    
    if (!month) {
        showMessage('reportMessage', '請先生成報表', 'error');
        return;
    }
    
    try {
        const response = await callGasFunction('exportReport', { month: month });
        
        if (response.success && response.url) {
            window.open(response.url, '_blank');
            showMessage('reportMessage', '報表已匯出，請查看新分頁', 'success');
        } else {
            showMessage('reportMessage', response.message || '匯出失敗', 'error');
        }
    } catch (error) {
        showMessage('reportMessage', '匯出失敗，請檢查網路連線', 'error');
    }
}

// ===== 載入部門列表 =====
async function loadDepartments() {
    try {
        const response = await callGasFunction('getDepartments');
        
        if (response.success) {
            const select = document.getElementById('reportDepartment');
            if (!select) return;
            
            const firstOption = select.options[0].outerHTML;
            select.innerHTML = firstOption + response.data.map(dept => 
                `<option value="${dept}">${dept}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('載入部門失敗:', error);
    }
}

// ===== 標籤切換 =====
function switchTab(tabName) {
    // 移除所有active class
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 添加active class到選中的標籤
    event.target.classList.add('active');
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) tabContent.classList.add('active');
}

// ===== 通用訊息顯示 =====
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}