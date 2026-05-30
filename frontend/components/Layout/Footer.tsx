'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GoldOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, XOutlined, CopyOutlined } from '@ant-design/icons';
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
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
    {
      question: '如何注册成为平台用户？',
      answer: '点击页面右上角的"注册"按钮，填写个人信息并完成邮箱验证即可注册成功。学生用户需要提供学生证照片进行身份认证。'
    },
    {
      question: '如何发布创业项目？',
      answer: '登录后进入"我的项目"页面，点击"发布项目"按钮，按照指引填写项目信息、上传商业计划书即可提交审核。'
    },
    {
      question: '项目审核需要多长时间？',
      answer: '一般情况下，项目审核需要1-3个工作日。审核通过后，项目将在平台上公开展示。'
    },
    {
      question: '如何联系投资人？',
      answer: '在项目详情页面可以查看关注该项目的投资人列表，通过平台提供的私信功能与投资人建立联系。'
    },
    {
      question: '平台是否收取服务费用？',
      answer: '贝壳青创汇对学生创业团队完全免费开放。我们旨在帮助校园创业者获得更多资源和机会。'
    }
  ];

  return (
    <>
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
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="text-gray-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer"
                      >
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-accent">其他</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <button
                        onClick={() => setShowFAQModal(true)}
                        className="text-gray-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer"
                      >
                        {link.name}
                      </button>
                    )}
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

      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">联系我们</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XOutlined />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MailOutlined className="text-primary text-lg" />
                  <span className="text-gray-700">contact@beike-startups.com</span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                >
                  <CopyOutlined />
                  <span>复制</span>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <PhoneOutlined className="text-primary text-lg" />
                  <span className="text-gray-700">400-888-8888</span>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                >
                  <CopyOutlined />
                  <span>复制</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFAQModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFAQModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">常见问题</h3>
              <button
                onClick={() => setShowFAQModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XOutlined />
              </button>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-800 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
