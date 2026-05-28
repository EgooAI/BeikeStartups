// frontend/components/Layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 根据用户角色显示不同的菜单
  const isInvestorRole = user?.role === 'investor' || user?.role === 'mentor' || user?.role === 'partner';
  
  const menuItems = [
    { name: '仪表板', href: '/dashboard', icon: '🏠' },
    ...(!isInvestorRole ? [{ name: '创业申请', href: '/applications', icon: '📝' }] : []),
    ...(!isInvestorRole ? [{ name: '我的团队', href: '/teams', icon: '👥' }] : []),
    { name: '项目展示', href: '/projects', icon: '🚀' },
    { name: '人才招聘', href: '/recruitments', icon: '💼' },
    ...(user?.role === 'team' ? [{ name: '对接审核', href: '/dashboard/review', icon: '✅' }] : []),
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-16 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}