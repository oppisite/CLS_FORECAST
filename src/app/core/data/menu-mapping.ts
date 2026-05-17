/**
 * Menu Mapping Configuration
 * ใช้สำหรับแปลงข้อมูลจากฐานข้อมูลเป็น menu items
 */

export interface MenuMappingConfig {
  groupId: string;
  groupName: string;
  groupIcon: string;
  menus: MenuConfig[];
}

export interface MenuConfig {
  menuId: string;
  menuName: string;
  menuIcon: string;
  menuLink: string;
  submenus?: SubmenuConfig[];
}

export interface SubmenuConfig {
  submenuId: string;
  submenuName: string;
  submenuIcon: string;
  submenuLink: string;
}

/**
 * ข้อมูล mapping ของ menu ตามโครงสร้างฐานข้อมูล
 */
export const MENU_MAPPING: MenuMappingConfig[] = [
  {
    groupId: '1',
    groupName: 'ระบบหลัก',
    groupIcon: 'mdi mdi-view-dashboard',
    menus: [
      {
        menuId: '101',
        menuName: 'Dashboard',
        menuIcon: 'mdi mdi-view-dashboard',
        menuLink: '/pages/dashboards',
        submenus: [
          {
            submenuId: '1001',
            submenuName: 'ภาพรวม',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/dashboards/overview'
          },
          {
            submenuId: '1002',
            submenuName: 'รายละเอียด',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/dashboards/details'
          }
        ]
      },
      {
        menuId: '102',
        menuName: 'E-Monitor',
        menuIcon: 'mdi mdi-monitor',
        menuLink: '/pages/emonitor',
        submenus: [
          {
            submenuId: '1003',
            submenuName: 'การตรวจสอบ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/emonitor/monitoring'
          },
          {
            submenuId: '1004',
            submenuName: 'รายงานสถานะ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/emonitor/status'
          }
        ]
      },
      {
        menuId: '103',
        menuName: 'Analytics',
        menuIcon: 'mdi mdi-chart-line',
        menuLink: '/pages/analytics',
        submenus: [
          {
            submenuId: '1005',
            submenuName: 'การวิเคราะห์ข้อมูล',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/analytics/data'
          },
          {
            submenuId: '1006',
            submenuName: 'กราฟและแผนภูมิ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/analytics/charts'
          }
        ]
      }
    ]
  },
  {
    groupId: '2',
    groupName: 'ระบบรายงาน',
    groupIcon: 'mdi mdi-chart-bar',
    menus: [
      {
        menuId: '201',
        menuName: 'รายงานประจำวัน',
        menuIcon: 'mdi mdi-calendar-today',
        menuLink: '/pages/reports/daily',
        submenus: [
          {
            submenuId: '2001',
            submenuName: 'สรุปข้อมูล',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/daily/summary'
          },
          {
            submenuId: '2002',
            submenuName: 'กราฟแสดงผล',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/daily/charts'
          }
        ]
      },
      {
        menuId: '202',
        menuName: 'รายงานประจำเดือน',
        menuIcon: 'mdi mdi-calendar-month',
        menuLink: '/pages/reports/monthly',
        submenus: [
          {
            submenuId: '2003',
            submenuName: 'สรุปรายเดือน',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/monthly/summary'
          },
          {
            submenuId: '2004',
            submenuName: 'เปรียบเทียบ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/monthly/compare'
          }
        ]
      },
      {
        menuId: '203',
        menuName: 'รายงานประจำปี',
        menuIcon: 'mdi mdi-calendar-year',
        menuLink: '/pages/reports/yearly',
        submenus: [
          {
            submenuId: '2005',
            submenuName: 'สรุปรายปี',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/yearly/summary'
          },
          {
            submenuId: '2006',
            submenuName: 'แนวโน้ม',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/reports/yearly/trends'
          }
        ]
      }
    ]
  },
  {
    groupId: '3',
    groupName: 'ระบบจัดการ',
    groupIcon: 'mdi mdi-cog',
    menus: [
      {
        menuId: '301',
        menuName: 'จัดการข้อมูล',
        menuIcon: 'mdi mdi-database',
        menuLink: '/pages/management/data',
        submenus: [
          {
            submenuId: '3001',
            submenuName: 'ข้อมูลพื้นฐาน',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/management/data/basic'
          },
          {
            submenuId: '3002',
            submenuName: 'ข้อมูลระบบ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/management/data/system'
          }
        ]
      },
      {
        menuId: '302',
        menuName: 'จัดการระบบ',
        menuIcon: 'mdi mdi-server',
        menuLink: '/pages/management/system',
        submenus: [
          {
            submenuId: '3003',
            submenuName: 'การตั้งค่าระบบ',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/management/system/settings'
          },
          {
            submenuId: '3004',
            submenuName: 'การบำรุงรักษา',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/management/system/maintenance'
          }
        ]
      }
    ]
  },
  {
    groupId: '4',
    groupName: 'ระบบตั้งค่า',
    groupIcon: 'mdi mdi-settings',
    menus: [
      {
        menuId: '401',
        menuName: 'ตั้งค่าระบบ',
        menuIcon: 'mdi mdi-cog',
        menuLink: '/pages/settings/system',
        submenus: [
          {
            submenuId: '4001',
            submenuName: 'การตั้งค่าทั่วไป',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/settings/system/general'
          },
          {
            submenuId: '4002',
            submenuName: 'การตั้งค่าขั้นสูง',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/settings/system/advanced'
          }
        ]
      },
      {
        menuId: '402',
        menuName: 'ตั้งค่าผู้ใช้',
        menuIcon: 'mdi mdi-account-cog',
        menuLink: '/pages/settings/user',
        submenus: [
          {
            submenuId: '4003',
            submenuName: 'โปรไฟล์',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/settings/user/profile'
          },
          {
            submenuId: '4004',
            submenuName: 'การแจ้งเตือน',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/settings/user/notifications'
          }
        ]
      }
    ]
  },
  {
    groupId: '5',
    groupName: 'ระบบผู้ใช้',
    groupIcon: 'mdi mdi-account-group',
    menus: [
      {
        menuId: '501',
        menuName: 'จัดการผู้ใช้',
        menuIcon: 'mdi mdi-account-multiple',
        menuLink: '/pages/users',
        submenus: [
          {
            submenuId: '5001',
            submenuName: 'รายชื่อผู้ใช้',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/users/list'
          },
          {
            submenuId: '5002',
            submenuName: 'เพิ่มผู้ใช้ใหม่',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/users/add'
          }
        ]
      },
      {
        menuId: '502',
        menuName: 'สิทธิ์การเข้าถึง',
        menuIcon: 'mdi mdi-shield-account',
        menuLink: '/pages/permissions',
        submenus: [
          {
            submenuId: '5003',
            submenuName: 'จัดการสิทธิ์',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/permissions/manage'
          },
          {
            submenuId: '5004',
            submenuName: 'ประวัติการเข้าถึง',
            submenuIcon: 'mdi mdi-circle-small',
            submenuLink: '/pages/permissions/history'
          }
        ]
      }
    ]
  }
];

/**
 * Helper functions สำหรับค้นหาข้อมูล menu mapping
 */
export class MenuMappingHelper {
  /**
   * หา group config ตาม groupId
   */
  static getGroupConfig(groupId: string): MenuMappingConfig | undefined {
    return MENU_MAPPING.find(group => group.groupId === groupId);
  }

  /**
   * หา menu config ตาม menuId
   */
  static getMenuConfig(menuId: string): MenuConfig | undefined {
    for (const group of MENU_MAPPING) {
      const menu = group.menus.find(m => m.menuId === menuId);
      if (menu) return menu;
    }
    return undefined;
  }

  /**
   * หา submenu config ตาม submenuId
   */
  static getSubmenuConfig(submenuId: string): SubmenuConfig | undefined {
    for (const group of MENU_MAPPING) {
      for (const menu of group.menus) {
        if (menu.submenus) {
          const submenu = menu.submenus.find(s => s.submenuId === submenuId);
          if (submenu) return submenu;
        }
      }
    }
    return undefined;
  }

  /**
   * หา parent menuId ของ submenu
   */
  static getParentMenuId(submenuId: string): string | undefined {
    for (const group of MENU_MAPPING) {
      for (const menu of group.menus) {
        if (menu.submenus) {
          const submenu = menu.submenus.find(s => s.submenuId === submenuId);
          if (submenu) return menu.menuId;
        }
      }
    }
    return undefined;
  }
}
