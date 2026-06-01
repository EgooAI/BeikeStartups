'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThunderboltOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, XOutlined, CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';

const footerLinks = {
  quick: [
    { name: '项目库', href: '/projects' },
    { name: '招募广场', href: '/recruitments' },
    { name: '创投资源', href: '/resources' },
    { name: '活动路演', href: '/events' },
  ],
  about: [
    { name: '关于贝壳', href: '/about' },
    { name: '联系我们', href: null },
  ],
  support: [
    { name: '常见问题', href: null },
  ],
};

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  useEffect(() => {
    const isModalOpen = showContactModal || showFAQModal;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showContactModal, showFAQModal]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@beike-startups.com');
    message.success('邮箱已复制到剪贴板');
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('400-888-8888');
    message.success('电话已复制到剪贴板');
  };

  const faqs = [
    { question: '如何注册成为平台用户？', answer: '点击页面右上角的"注册"按钮，填写个人信息并完成邮箱验证即可注册成功。学生用户需要提供学生证照片进行身份认证。' },
    { question: '如何发布创业项目？', answer: '登录后进入"我的项目"页面，点击"发布项目"按钮，按照指引填写项目信息、上传商业计划书即可提交审核。' },
    { question: '项目审核需要多长时间？', answer: '一般情况下，项目审核需要1-3个工作日。审核通过后，项目将在平台上公开展示。' },
    { question: '如何联系投资人？', answer: '在项目详情页面可以查看关注该项目的投资人列表，通过平台提供的私信功能与投资人建立联系。' },
    { question: '平台是否收取服务费用？', answer: '贝壳青创汇对学生创业团队完全免费开放。我们旨在帮助校园创业者获得更多资源和机会。' },
  ];

  return (
    <>
      <footer className="relative bg-[#060610] text-white overflow-hidden">
        {/* 顶部发光边 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/25 to-transparent" />

        {/* 扫描线纹理 */}
        <div className="absolute inset-0 bg-scanlines opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#b347ea] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <ThunderboltOutlined className="text-lg text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">
                  贝壳<span className="text-[#00f0ff]">青创汇</span>
                </span>
              </Link>
              <p className="text-gray-500 leading-relaxed mb-6 max-w-sm">
                让校园创业项目，被更多人看见。连接学生创意、创业团队、校外导师、投资机构与产业资源。
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-500">
                  <MailOutlined className="text-[#00f0ff]" />
                  <span>contact@beike-startups.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-500">
                  <PhoneOutlined className="text-[#b347ea]" />
                  <span>400-888-8888</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-500">
                  <EnvironmentOutlined className="text-[#ffb800]" />
                  <span>北京市海淀区中关村大街1号</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#00f0ff] mb-6">快速链接</h4>
              <ul className="space-y-3">
                {footerLinks.quick.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#b347ea] mb-6">关于我们</h4>
              <ul className="space-y-3">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <Link href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">{link.name}</Link>
                    ) : (
                      <button onClick={() => setShowContactModal(true)} className="text-gray-500 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer text-sm">{link.name}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#ffb800] mb-6">其他</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <Link href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">{link.name}</Link>
                    ) : (
                      <button onClick={() => setShowFAQModal(true)} className="text-gray-500 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer text-sm">{link.name}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-gray-600 text-sm text-center md:text-left">
                &copy; {new Date().getFullYear()} 贝壳创业俱乐部. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <Link href="/about" className="hover:text-gray-400 transition-colors">隐私政策</Link>
                <Link href="/about" className="hover:text-gray-400 transition-colors">服务条款</Link>
                <Link href="/about" className="hover:text-gray-400 transition-colors">Cookie 设置</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 联系我们弹窗 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-[#0f0f1f] rounded-2xl border border-[#00f0ff]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">联系我们</h3>
              <button onClick={() => setShowContactModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors"><XOutlined /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div className="flex items-center space-x-3">
                  <MailOutlined className="text-[#00f0ff] text-lg" />
                  <span className="text-white text-sm">contact@beike-startups.com</span>
                </div>
                <button onClick={handleCopyEmail} className="flex items-center space-x-1 px-3 py-1.5 bg-[#00f0ff]/10 text-[#00f0ff] rounded-lg hover:bg-[#00f0ff]/20 transition-colors text-sm"><CopyOutlined /><span>复制</span></button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div className="flex items-center space-x-3">
                  <PhoneOutlined className="text-[#b347ea] text-lg" />
                  <span className="text-white text-sm">400-888-8888</span>
                </div>
                <button onClick={handleCopyPhone} className="flex items-center space-x-1 px-3 py-1.5 bg-[#b347ea]/10 text-[#b347ea] rounded-lg hover:bg-[#b347ea]/20 transition-colors text-sm"><CopyOutlined /><span>复制</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ弹窗 */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFAQModal(false)}>
          <div className="bg-[#0f0f1f] rounded-2xl border border-[#00f0ff]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">常见问题</h3>
              <button onClick={() => setShowFAQModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors"><XOutlined /></button>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-white/5 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-200 mb-2">{faq.question}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
