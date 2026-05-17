// Debug Sidebar Console Script
// ใช้ใน browser console เพื่อตรวจสอบปัญหา sidebar

console.log('=== Sidebar Debug Console Script ===');

// 1. ตรวจสอบ Session Storage
function checkSessionStorage() {
    console.log('--- Session Storage Check ---');
    
    const userSession = sessionStorage.getItem('userSession');
    const sidebarMenu = sessionStorage.getItem('sidebarMenu');
    const selectedPermission = sessionStorage.getItem('selectedPermission');
    const authToken = sessionStorage.getItem('authToken');
    
    console.log('userSession:', userSession ? JSON.parse(userSession) : 'null');
    console.log('sidebarMenu:', sidebarMenu ? JSON.parse(sidebarMenu) : 'null');
    console.log('selectedPermission:', selectedPermission ? JSON.parse(selectedPermission) : 'null');
    console.log('authToken:', authToken);
    
    if (userSession) {
        console.log('✅ Session found');
    } else {
        console.log('❌ No session found');
    }
}

// 2. ตรวจสอบ Layout
function checkLayout() {
    console.log('--- Layout Check ---');
    
    const layoutType = document.documentElement.getAttribute('data-layout');
    const layoutMode = document.documentElement.getAttribute('data-bs-theme');
    const sidebarColor = document.documentElement.getAttribute('data-sidebar');
    const sidebarSize = document.documentElement.getAttribute('data-sidebar-size');
    
    console.log('layoutType:', layoutType);
    console.log('layoutMode:', layoutMode);
    console.log('sidebarColor:', sidebarColor);
    console.log('sidebarSize:', sidebarSize);
    
    if (layoutType === 'vertical') {
        console.log('✅ Vertical layout detected');
    } else {
        console.log('⚠️ Layout type:', layoutType);
    }
}

// 3. ตรวจสอบ Sidebar Element
function checkSidebarElement() {
    console.log('--- Sidebar Element Check ---');
    
    const sidebarElement = document.querySelector('app-sidebar');
    const sidebarMenu = document.querySelector('.app-menu');
    const navbarNav = document.getElementById('navbar-nav');
    
    console.log('sidebarElement:', sidebarElement ? 'Found' : 'Not found');
    console.log('sidebarMenu:', sidebarMenu ? 'Found' : 'Not found');
    console.log('navbarNav:', navbarNav ? 'Found' : 'Not found');
    
    if (sidebarElement) {
        console.log('✅ Sidebar element found');
        console.log('Sidebar classes:', sidebarElement.className);
        
        // ตรวจสอบ menuItems property
        if (sidebarElement.menuItems) {
            console.log('menuItems length:', sidebarElement.menuItems.length);
            console.log('menuItems:', sidebarElement.menuItems);
        } else {
            console.log('❌ menuItems property not found');
        }
    } else {
        console.log('❌ Sidebar element not found');
    }
}

// 4. ตรวจสอบ Menu Items
function checkMenuItems() {
    console.log('--- Menu Items Check ---');
    
    const sidebarElement = document.querySelector('app-sidebar');
    
    if (sidebarElement && sidebarElement.menuItems) {
        const menuItems = sidebarElement.menuItems;
        console.log('Menu items length:', menuItems.length);
        console.log('Menu items:', menuItems);
        
        if (menuItems.length > 0) {
            console.log('✅ Menu items found');
            
            // ตรวจสอบ menu items รายละเอียด
            menuItems.forEach((item, index) => {
                console.log(`Menu ${index + 1}:`, {
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    link: item.link,
                    isTitle: item.isTitle,
                    subItems: item.subItems ? item.subItems.length : 0
                });
            });
        } else {
            console.log('⚠️ Menu items array is empty');
        }
    } else {
        console.log('❌ No menu items found');
    }
}

// 5. ตรวจสอบ Session Service
function checkSessionService() {
    console.log('--- Session Service Check ---');
    
    // ตรวจสอบว่ามี Angular service หรือไม่
    const angularElement = document.querySelector('[ng-version]');
    if (angularElement) {
        console.log('✅ Angular detected');
        console.log('Angular version:', angularElement.getAttribute('ng-version'));
    } else {
        console.log('❌ Angular not detected');
    }
}

// 6. ตรวจสอบ URL และ Route
function checkURLAndRoute() {
    console.log('--- URL and Route Check ---');
    
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search:', window.location.search);
    
    // ตรวจสอบ router outlet
    const routerOutlet = document.querySelector('router-outlet');
    console.log('Router outlet:', routerOutlet ? 'Found' : 'Not found');
}

// 7. ตรวจสอบ CSS และ Styles
function checkCSSAndStyles() {
    console.log('--- CSS and Styles Check ---');
    
    const body = document.body;
    const html = document.documentElement;
    
    console.log('Body classes:', body.className);
    console.log('HTML classes:', html.className);
    
    // ตรวจสอบ CSS variables
    const computedStyle = getComputedStyle(html);
    console.log('CSS variables:', {
        '--bs-body-bg': computedStyle.getPropertyValue('--bs-body-bg'),
        '--bs-body-color': computedStyle.getPropertyValue('--bs-body-color')
    });
}

// 8. ตรวจสอบ Console Logs
function checkConsoleLogs() {
    console.log('--- Console Logs Check ---');
    
    // ตรวจสอบ console logs ที่เกี่ยวข้องกับ sidebar
    console.log('Look for these logs in console:');
    console.log('- "Loading menu from session:"');
    console.log('- "No valid menu in session, using default MENU"');
    console.log('- "Sidebar ngOnInit - Current menuItems:"');
    console.log('- "Session expired, clearing session and redirecting to login"');
}

// 9. ตรวจสอบทั้งหมด
function checkAll() {
    console.log('=== COMPLETE SIDEBAR DEBUG ===');
    checkSessionStorage();
    checkLayout();
    checkSidebarElement();
    checkMenuItems();
    checkSessionService();
    checkURLAndRoute();
    checkCSSAndStyles();
    checkConsoleLogs();
    console.log('=== END DEBUG ===');
}

// 10. ฟังก์ชันทดสอบ
function testSidebarFunctions() {
    console.log('--- Testing Sidebar Functions ---');
    
    const sidebarElement = document.querySelector('app-sidebar');
    
    if (sidebarElement) {
        // ทดสอบ debug functions
        if (typeof sidebarElement.debugSession === 'function') {
            console.log('✅ debugSession function available');
            sidebarElement.debugSession();
        } else {
            console.log('❌ debugSession function not available');
        }
        
        if (typeof sidebarElement.checkSidebarState === 'function') {
            console.log('✅ checkSidebarState function available');
            sidebarElement.checkSidebarState();
        } else {
            console.log('❌ checkSidebarState function not available');
        }
        
        if (typeof sidebarElement.checkSessionStorage === 'function') {
            console.log('✅ checkSessionStorage function available');
            sidebarElement.checkSessionStorage();
        } else {
            console.log('❌ checkSessionStorage function not available');
        }
    } else {
        console.log('❌ Sidebar element not found for testing');
    }
}

// 11. ฟังก์ชันแก้ไขปัญหา
function fixSidebarIssues() {
    console.log('--- Attempting to Fix Sidebar Issues ---');
    
    // 1. ล้าง session และ reload
    console.log('1. Clearing session storage...');
    sessionStorage.clear();
    
    // 2. Reload page
    console.log('2. Reloading page...');
    window.location.reload();
}

// 12. ฟังก์ชันสร้าง test menu
function createTestMenu() {
    console.log('--- Creating Test Menu ---');
    
    const sidebarElement = document.querySelector('app-sidebar');
    
    if (sidebarElement && typeof sidebarElement.createTestMenuData === 'function') {
        console.log('Creating test menu data...');
        sidebarElement.createTestMenuData();
        console.log('✅ Test menu created');
    } else {
        console.log('❌ Cannot create test menu - function not available');
    }
}

// 13. ฟังก์ชันใช้ default menu
function useDefaultMenu() {
    console.log('--- Using Default Menu ---');
    
    const sidebarElement = document.querySelector('app-sidebar');
    
    if (sidebarElement && typeof sidebarElement.useDefaultMenu === 'function') {
        console.log('Using default menu...');
        sidebarElement.useDefaultMenu();
        console.log('✅ Default menu applied');
    } else {
        console.log('❌ Cannot use default menu - function not available');
    }
}

// แสดงฟังก์ชันที่ใช้ได้
console.log('Available functions:');
console.log('- checkSessionStorage()');
console.log('- checkLayout()');
console.log('- checkSidebarElement()');
console.log('- checkMenuItems()');
console.log('- checkSessionService()');
console.log('- checkURLAndRoute()');
console.log('- checkCSSAndStyles()');
console.log('- checkConsoleLogs()');
console.log('- checkAll()');
console.log('- testSidebarFunctions()');
console.log('- fixSidebarIssues()');
console.log('- createTestMenu()');
console.log('- useDefaultMenu()');

// Auto-run basic checks
console.log('Auto-running basic checks...');
checkSessionStorage();
checkLayout();
checkSidebarElement();
checkMenuItems();

console.log('=== Sidebar Debug Console Script Loaded ===');
