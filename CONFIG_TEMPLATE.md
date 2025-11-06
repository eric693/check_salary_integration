# 配置範本文件

## 請按照以下步驟填寫您的配置資訊

### 1. LINE Login 配置

```
LINE_CHANNEL_ID = ________________
LINE_CHANNEL_SECRET = ________________
LINE_REDIRECT_URI = ________________
```

**取得方式：**
1. 前往 https://developers.line.biz/console/
2. 選擇您的 Channel
3. 在 Basic settings 頁面找到 Channel ID
4. Channel secret 需要點擊 "Show" 按鈕

**REDIRECT_URI 範例：**
- 如果使用 Google Apps Script：`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
- 如果使用自訂網域：`https://yourdomain.com/attendance-system`

---

### 2. Google Sheets 配置

```
SPREADSHEET_ID = ________________
```

**取得方式：**
從試算表 URL 中複製 ID
```
https://docs.google.com/spreadsheets/d/[這裡就是ID]/edit
```

---

### 3. Google Apps Script Web App URL

```
GAS_WEB_APP_URL = ________________
```

**取得方式：**
1. 在 Apps Script 編輯器中點擊「部署」→「管理部署作業」
2. 複製「網頁應用程式」URL

---

### 4. 工時與薪資設定

```
每日標準工時 = ________ 小時 (建議: 8)
每月標準工作天數 = ________ 天 (建議: 22)
平日加班費倍率 = ________ (建議: 1.34)
假日加班費倍率 = ________ (建議: 1.67)
```

---

## 配置步驟

### Step 1: 填寫 Code.gs 中的 CONFIG

開啟 `Code.gs`，找到以下區塊並填寫：

```javascript
const CONFIG = {
  // LINE Login 設定
  LINE_CHANNEL_ID: '填寫您的LINE_CHANNEL_ID',
  LINE_CHANNEL_SECRET: '填寫您的LINE_CHANNEL_SECRET',
  LINE_REDIRECT_URI: '填寫您的REDIRECT_URI',
  
  // Google試算表ID
  SPREADSHEET_ID: '填寫您的SPREADSHEET_ID',
  
  // 工作表名稱（建議不要修改）
  SHEETS: {
    EMPLOYEES: '員工資料',
    ATTENDANCE: '打卡記錄',
    SALARY: '薪資計算',
    USERS: '用戶權限'
  },
  
  // 工時設定
  WORK_HOURS: {
    STANDARD_DAILY: 8,      // 標準每日工時
    STANDARD_MONTHLY: 22,   // 標準每月工作天數
    OVERTIME_RATE: 1.34     // 加班費倍率（平日）
  }
};
```

### Step 2: 填寫 app.js 中的 CONFIG

開啟 `app.js`，找到以下區塊並填寫：

```javascript
const CONFIG = {
    // 請替換為您的LINE Login Channel ID
    LINE_CHANNEL_ID: '填寫您的LINE_CHANNEL_ID',
    // 請替換為您部署的Google Apps Script Web App URL
    GAS_WEB_APP_URL: '填寫您的GAS_WEB_APP_URL',
    // LINE Login重定向URI（必須在LINE Developers Console中設定）
    REDIRECT_URI: window.location.origin + window.location.pathname
};
```

---

## 配置檢查清單

完成以下檢查項目：

### LINE Developers Console
- [ ] 已創建 LINE Login Channel
- [ ] 已複製 Channel ID
- [ ] 已複製 Channel Secret
- [ ] 已在 Callback URL 中添加 REDIRECT_URI
- [ ] 已啟用 profile, openid, email 權限

### Google Sheets
- [ ] 已創建試算表
- [ ] 已複製試算表 ID
- [ ] 試算表權限設定為「知道連結的所有人都可以編輯」或給予 Apps Script 權限

### Google Apps Script
- [ ] 已上傳 Code.gs 程式碼
- [ ] 已填寫 CONFIG 配置
- [ ] 已上傳 index.html
- [ ] 已創建並嵌入 app.js（在 HTML 中）
- [ ] 已執行 initializeSheets 函數
- [ ] 已部署為 Web App
- [ ] 已授權必要權限
- [ ] 已複製 Web App URL

### 前端配置
- [ ] 已在 app.js 中填寫所有 CONFIG 參數
- [ ] REDIRECT_URI 與 LINE Console 中的 Callback URL 一致
- [ ] GAS_WEB_APP_URL 填寫正確

### 測試
- [ ] 可以訪問系統首頁
- [ ] 可以點擊 LINE 登入按鈕
- [ ] LINE 登入成功後可以看到主系統
- [ ] 可以新增員工
- [ ] 可以進行打卡
- [ ] 可以計算薪資
- [ ] 可以查看報表

---

## 常見配置錯誤

### 錯誤 1: LINE 登入失敗
**症狀：**點擊 LINE 登入後出現錯誤

**檢查：**
- Channel ID 是否正確
- Callback URL 是否與 REDIRECT_URI 一致
- Channel 是否已發布（Published）

### 錯誤 2: 無法連接到後端
**症狀：**打卡或新增員工時沒有反應

**檢查：**
- GAS_WEB_APP_URL 是否正確
- Apps Script 是否已部署
- 部署設定中「具有存取權的使用者」是否設為「任何人」

### 錯誤 3: 找不到試算表
**症狀：**後端操作失敗，顯示無法訪問試算表

**檢查：**
- SPREADSHEET_ID 是否正確
- 試算表是否存在
- Apps Script 是否有權限訪問試算表

### 錯誤 4: 初始化失敗
**症狀：**執行 initializeSheets 時出錯

**檢查：**
- 是否已授權 Apps Script
- 試算表權限是否正確
- CONFIG.SHEETS 中的工作表名稱是否有衝突

---

## 進階配置選項

### 1. 自訂工作表名稱

如果您想使用不同的工作表名稱，請修改：

```javascript
SHEETS: {
    EMPLOYEES: '您的員工資料表名稱',
    ATTENDANCE: '您的打卡記錄表名稱',
    SALARY: '您的薪資計算表名稱',
    USERS: '您的用戶權限表名稱'
}
```

### 2. 調整工時計算參數

根據貴公司的政策調整：

```javascript
WORK_HOURS: {
    STANDARD_DAILY: 8,      // 每日標準工時
    STANDARD_MONTHLY: 22,   // 每月工作天數
    OVERTIME_RATE: 1.34,    // 平日加班費倍率
    WEEKEND_RATE: 1.67,     // 假日加班費倍率（需自行實作）
    HOLIDAY_RATE: 2.67      // 國定假日加班費倍率（需自行實作）
}
```

### 3. 添加時區設定

如果您在不同時區，可以在 Code.gs 中調整：

```javascript
// 在 clockIn 和 clockOut 函數中
const timezone = 'Asia/Taipei'; // 改為您的時區
Utilities.formatDate(now, timezone, 'yyyy-MM-dd');
```

### 4. 自訂用戶角色

在「用戶權限」工作表中可以設定以下角色：

- **管理員**：完整權限
- **主管**：可查看所有員工資料和報表
- **員工**：只能查看自己的資料
- **財務**：可查看薪資計算和報表
- **人資**：可管理員工資料

（需要在 Code.gs 中實作對應的權限檢查邏輯）

---

## 安全性設定建議

### 1. 保護敏感資訊

不要將 Channel Secret 直接寫在程式碼中，使用 PropertiesService：

```javascript
// 在 Apps Script 中設定
function setSecrets() {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('LINE_CHANNEL_SECRET', '您的Secret');
}

// 在程式中使用
const secret = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_SECRET');
```

### 2. 限制存取

在 doPost 函數中添加 IP 白名單或 Token 驗證：

```javascript
function doPost(e) {
    // 驗證請求來源
    const token = e.parameter.token;
    if (token !== 'YOUR_SECRET_TOKEN') {
        return ContentService.createTextOutput('Unauthorized');
    }
    // ... 其餘程式碼
}
```

### 3. 資料加密

對敏感欄位進行加密儲存（需自行實作）

---

## 部署前最終檢查

### 配置文件檢查
- [ ] Code.gs 中的所有 CONFIG 都已填寫
- [ ] app.js 中的所有 CONFIG 都已填寫
- [ ] 所有 ID 和 URL 都無拼寫錯誤

### LINE Console 檢查
- [ ] Callback URL 已添加
- [ ] Channel 狀態為 Published
- [ ] 權限 Scopes 已啟用

### Google Cloud 檢查
- [ ] Apps Script 已部署
- [ ] 權限已授權
- [ ] 試算表已創建並初始化

### 功能測試
- [ ] LINE 登入測試通過
- [ ] 打卡功能測試通過
- [ ] 新增員工測試通過
- [ ] 薪資計算測試通過
- [ ] 報表功能測試通過

---

**部署完成後，請妥善保管此配置文件，並將敏感資訊（如 Channel Secret）儲存在安全的地方。**

**建議定期更換密鑰以確保系統安全。**