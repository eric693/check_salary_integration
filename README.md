# 員工打卡薪資管理系統 - 設定與部署指南

## 系統功能特點

✓ LINE 登入認證
✓ GPS/IP 定位打卡（可擴展）
✓ 上下班時間記錄
✓ 雲端自動備份
✓ 即時出勤數據
✓ 自動計薪限購
✓ 自動計算工時薪資
✓ 加班費自動計算
✓ 請假扣薪處理
✓ 月薪資報表匯出
✓ 勞健保自動計算（可擴展）

## 一、LINE Developers 設定

### 1.1 創建 LINE Login Channel

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入您的 LINE 帳號
3. 創建新的 Provider 或選擇現有的
4. 點擊「Create a new channel」
5. 選擇「LINE Login」
6. 填寫以下資訊：
   - Channel name: 員工打卡薪資系統
   - Channel description: 公司內部員工打卡與薪資管理系統
   - App types: Web app
   - Email address: 您的電子郵件
   - Privacy policy URL: （選填）
   - Terms of use URL: （選填）

### 1.2 設定 Callback URL

1. 在 Channel 設定頁面，找到「LINE Login」標籤
2. 在「Callback URL」欄位中，輸入您的網站 URL
   - 例如：`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - 或您的自訂網域

### 1.3 取得 Channel ID 和 Channel Secret

1. 在 Channel Basic Settings 頁面
2. 複製「Channel ID」
3. 點擊「Channel Secret」右側的「Show」按鈕，複製密鑰

### 1.4 設定 Scopes

確保以下權限已啟用：
- profile
- openid
- email

## 二、Google Sheets 設定

### 2.1 創建新的試算表

1. 前往 [Google Sheets](https://sheets.google.com/)
2. 創建新的空白試算表
3. 命名為「員工打卡薪資系統」
4. 複製試算表 URL 中的 ID
   - URL 格式：`https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### 2.2 設定工作表結構

系統會自動創建以下工作表，但您也可以手動創建：

#### 工作表 1: 員工資料
| 欄位 | 說明 |
|------|------|
| A | 員工編號 |
| B | 姓名 |
| C | 部門 |
| D | 職位 |
| E | 月薪 |
| F | 建立時間 |

#### 工作表 2: 打卡記錄
| 欄位 | 說明 |
|------|------|
| A | 日期 |
| B | 員工編號 |
| C | 姓名 |
| D | 上班打卡 |
| E | 下班打卡 |
| F | 工時 |
| G | 狀態 |
| H | 操作人員 |

#### 工作表 3: 薪資計算
| 欄位 | 說明 |
|------|------|
| A | 年月 |
| B | 員工編號 |
| C | 姓名 |
| D | 部門 |
| E | 職位 |
| F | 基本月薪 |
| G | 應出勤天數 |
| H | 實際出勤天數 |
| I | 總工時 |
| J | 加班費 |
| K | 扣款 |
| L | 實發薪資 |

#### 工作表 4: 用戶權限
| 欄位 | 說明 |
|------|------|
| A | LINE ID |
| B | 姓名 |
| C | 頭像 |
| D | 電子郵件 |
| E | 角色 |
| F | 註冊時間 |

## 三、Google Apps Script 部署

### 3.1 開啟 Apps Script 編輯器

1. 在您的試算表中，點擊「擴充功能」→「Apps Script」
2. 刪除預設的程式碼

### 3.2 上傳程式碼

1. 複製 `Code.gs` 的內容
2. 貼上到 Apps Script 編輯器
3. 點擊「檔案」→「新增」→「HTML」
4. 命名為 `index`
5. 複製 `index.html` 的內容並貼上
6. 再新增一個 HTML 檔案，命名為 `app`
7. 複製 `app.js` 的內容並貼上（注意：需要改為 HTML 格式，用 <script> 標籤包裹）

### 3.3 設定配置參數

在 `Code.gs` 文件頂部，修改 CONFIG 物件：

```javascript
const CONFIG = {
  // LINE Login 設定
  LINE_CHANNEL_ID: '你的LINE_CHANNEL_ID',
  LINE_CHANNEL_SECRET: '你的LINE_CHANNEL_SECRET',
  LINE_REDIRECT_URI: '你的重定向URI',
  
  // Google試算表ID
  SPREADSHEET_ID: '你的試算表ID',
  
  // ... 其他設定保持不變
};
```

### 3.4 部署 Web App

1. 點擊「部署」→「新增部署作業」
2. 選擇類型：「網頁應用程式」
3. 設定：
   - 說明：版本 1
   - 執行身分：我
   - 具有存取權的使用者：任何人
4. 點擊「部署」
5. 複製「網頁應用程式 URL」

### 3.5 設定權限

首次部署時需要授權：
1. 點擊「授權存取權」
2. 選擇您的 Google 帳號
3. 點擊「進階」→「前往專案（不安全）」
4. 點擊「允許」

## 四、前端配置

### 4.1 修改 app.js 配置

在 `app.js` 文件頂部，修改 CONFIG 物件：

```javascript
const CONFIG = {
    LINE_CHANNEL_ID: '你的LINE_CHANNEL_ID',
    GAS_WEB_APP_URL: '你的Google_Apps_Script_Web_App_URL',
    REDIRECT_URI: '你的網站完整URL'
};
```

### 4.2 部署前端檔案

選項 A：使用 Google Apps Script (推薦)
- 已在步驟 3.2 完成，直接使用 Web App URL

選項 B：使用其他主機
1. 將 `index.html` 和 `app.js` 上傳到您的網站主機
2. 確保 REDIRECT_URI 設定正確
3. 更新 LINE Developers Console 中的 Callback URL

## 五、初始化系統

### 5.1 執行初始化函數

1. 在 Apps Script 編輯器中
2. 選擇函數：`initializeSheets`
3. 點擊「執行」
4. 確認所有工作表都已創建

### 5.2 添加測試用戶

1. 使用 LINE 登入系統
2. 首次登入會自動在「用戶權限」工作表中創建記錄
3. 如需設定為管理員，手動編輯「角色」欄位為「管理員」

### 5.3 新增測試員工

1. 登入系統
2. 在「員工資料管理」區塊
3. 填寫員工資訊並點擊「新增員工」

## 六、測試功能

### 6.1 測試打卡功能

1. 輸入員工編號和姓名
2. 點擊「上班打卡」
3. 檢查「打卡記錄」工作表是否有新增記錄
4. 點擊「下班打卡」
5. 確認工時有正確計算

### 6.2 測試薪資計算

1. 確保有一個月份的打卡記錄
2. 在「薪資計算」標籤
3. 選擇員工和月份
4. 點擊「計算薪資」
5. 檢查計算結果是否正確

### 6.3 測試報表功能

1. 在「月報表」標籤
2. 選擇月份
3. 點擊「生成報表」
4. 確認報表數據正確
5. 測試「匯出Excel」功能

## 七、常見問題排除

### 7.1 LINE 登入失敗

- 檢查 Channel ID 和 Secret 是否正確
- 確認 Callback URL 設定正確
- 檢查 Scopes 權限是否啟用

### 7.2 打卡無反應

- 檢查 GAS_WEB_APP_URL 是否正確
- 確認 Apps Script 已正確部署
- 檢查瀏覽器控制台是否有錯誤訊息

### 7.3 無法存取試算表

- 確認試算表 ID 正確
- 檢查 Apps Script 執行權限
- 確認試算表共用設定

### 7.4 計算結果不正確

- 檢查打卡記錄是否完整
- 確認工時設定 (CONFIG.WORK_HOURS) 是否正確
- 驗證薪資計算公式

## 八、進階設定

### 8.1 自訂工時參數

在 `Code.gs` 的 CONFIG.WORK_HOURS 中調整：

```javascript
WORK_HOURS: {
    STANDARD_DAILY: 8,      // 每日標準工時
    STANDARD_MONTHLY: 22,   // 每月標準工作天數
    OVERTIME_RATE: 1.34     // 加班費倍率
}
```

### 8.2 添加 GPS 定位功能

在 HTML 中添加：

```javascript
// 取得地理位置
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // 發送到後端驗證
    });
}
```

### 8.3 設定 IP 位置限制

在 `Code.gs` 中添加：

```javascript
function checkLocation(lat, lng) {
    // 檢查座標是否在允許範圍內
    const allowedLat = 25.0330;
    const allowedLng = 121.5654;
    const maxDistance = 100; // 公尺
    
    // 計算距離並驗證
}
```

### 8.4 添加請假管理

創建新的工作表「請假記錄」並實作相關功能

### 8.5 整合勞健保計算

在薪資計算中加入勞健保扣除額計算

## 九、安全性建議

### 9.1 保護敏感資訊

- 不要將 Channel Secret 和其他密鑰公開
- 使用環境變數或 PropertiesService 儲存敏感資訊
- 定期更換密鑰

### 9.2 資料備份

- 定期匯出試算表備份
- 使用 Google Drive 的版本歷程記錄
- 考慮使用第三方備份服務

### 9.3 存取控制

- 設定試算表的共用權限
- 實作用戶角色權限管理
- 記錄所有重要操作

### 9.4 資料加密

- 考慮對敏感欄位進行加密
- 使用 HTTPS 連線
- 實作資料傳輸加密

## 十、維護與更新

### 10.1 定期檢查

- 每月檢查系統運作狀況
- 驗證薪資計算準確性
- 檢查試算表容量

### 10.2 更新系統

1. 備份現有資料
2. 更新 Apps Script 程式碼
3. 測試新功能
4. 部署新版本

### 10.3 效能優化

- 定期清理舊資料
- 優化查詢效率
- 使用快取機制

## 十一、技術支援

### 11.1 參考資源

- [LINE Login 文件](https://developers.line.biz/en/docs/line-login/)
- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)

### 11.2 社群支援

- LINE Developers Community
- Google Apps Script Community
- Stack Overflow

## 十二、授權與版權

本系統為內部使用專案，請確保：
- 遵守 LINE Platform Terms of Use
- 遵守 Google Workspace Terms of Service
- 保護員工隱私資訊
- 符合當地勞動法規

## 系統架構圖

```
用戶 (LINE登入)
    ↓
前端 (HTML + JavaScript)
    ↓
Google Apps Script (後端API)
    ↓
Google Sheets (資料庫)
```

## 資料流程

```
1. LINE OAuth 認證
2. 取得用戶資訊
3. 打卡操作
4. 資料寫入試算表
5. 薪資計算
6. 報表生成
7. 資料匯出
```

---

## 快速開始檢查清單

- [ ] 創建 LINE Login Channel
- [ ] 取得 Channel ID 和 Secret
- [ ] 創建 Google Sheets
- [ ] 複製試算表 ID
- [ ] 上傳 Apps Script 程式碼
- [ ] 設定 CONFIG 參數
- [ ] 部署 Web App
- [ ] 授權 Apps Script 權限
- [ ] 設定前端配置
- [ ] 執行初始化函數
- [ ] 測試 LINE 登入
- [ ] 測試打卡功能
- [ ] 測試薪資計算
- [ ] 完成部署

---

如有任何問題，請參考常見問題排除章節或聯繫技術支援。