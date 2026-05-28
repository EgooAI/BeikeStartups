'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a2a5c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-[#f59e0b] mb-4">贝壳青创汇</h3>
            <p className="text-gray-300 leading-relaxed">
              让校园创业项目，被更多人看见。连接学生创意、创业团队、校外导师、投资机构与产业资源。
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-3">
              <li><Link href="/projects" className="text-gray-300 hover:text-[#f59e0b] transition-colors">项目库</Link></li>
              <li><Link href="/recruitments" className="text-gray-300 hover:text-[#f59e0b] transition-colors">招募广场</Link></li>
              <li><Link href="/resources" className="text-gray-300 hover:text-[#f59e0b] transition-colors">创投资源</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-[#f59e0b] transition-colors">活动路演</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">关于我们</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-[#f59e0b] transition-colors">关于贝壳</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-[#f59e0b] transition-colors">合作方式</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 贝壳创业俱乐部. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}