'use client';

import Link from 'next/link';
import { GoldOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const footerLinks = {
  quick: [
    { name: '项目库', href: '/projects' },
    { name: '招募广场', href: '/recruitments' },
    { name: '创投资源', href: '/resources' },
    { name: '活动路演', href: '/events' },
  ],
  about: [
    { name: '关于贝壳', href: '/about' },
    { name: '合作方式', href: '/about' },
    { name: '联系我们', href: '/about' },
  ],
  support: [
    { name: '帮助中心', href: '/about' },
    { name: '常见问题', href: '/about' },
    
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center">
                <GoldOutlined className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold">贝壳青创汇</span>
            </Link>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-sm">
              让校园创业项目，被更多人看见。连接学生创意、创业团队、校外导师、投资机构与产业资源。
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <MailOutlined className="text-accent" />
                <span>contact@beike-startups.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <PhoneOutlined className="text-accent" />
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <EnvironmentOutlined className="text-accent" />
                <span>北京市海淀区中关村大街1号</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">快速链接</h4>
            <ul className="space-y-3">
              {footerLinks.quick.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">关于我们</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">支持</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} 贝壳创业俱乐部. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">隐私政策</Link>
              <Link href="/about" className="hover:text-white transition-colors">服务条款</Link>
              <Link href="/about" className="hover:text-white transition-colors">Cookie 设置</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
