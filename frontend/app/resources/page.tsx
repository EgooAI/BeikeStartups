'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { resourceApi, roleApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  UserOutlined,
  RightOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  TeamOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const sections = [
  {
    id: 'investor',
    title: '投资人专区',
    icon: <FundOutlined className="text-3xl" />,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    desc: '发现早期校园创业项目，提前连接年轻创业团队，参与项目路演与投融资对接。',
    features: ['查看认证项目', '收藏项目', '申请查看BP', '报名闭门路演', '发起对接申请'],
  },
  {
    id: 'mentor',
    title: '校外导师专区',
    icon: <ExperimentOutlined className="text-3xl" />,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    desc: '以真实行业经验帮助学生团队完善商业模式、产品路径与市场策略。',
    features: ['认领辅导项目', '参与线上诊断', '发布导师方向', '报名创业训练营'],
  },
  {
    id: 'partner',
    title: '资源方专区',
    icon: <BuildOutlined className="text-3xl" />,
    color: 'from-teal-500 to-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    desc: '为创业团队提供试点场景、技术服务、办公空间、渠道资源与产业合作机会。',
    features: ['发布资源', '匹配项目', '接收合作申请', '参与资源对接会'],
  },
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const res = await resourceApi.list();
      if (res.data) {
        const data = res.data as any;
        setResources(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">连接校内项目与校外资源</h1>
          <p className="text-lg text-gray-200 max-w-3xl">
            贝壳创业俱乐部欢迎投资机构、创业导师、产业资源方、校友企业和孵化平台共同参与校园创新生态建设。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {sections.map((section) => (
          <div key={section.id} className={`${section.bgColor} rounded-2xl p-8 lg:p-10 border ${section.borderColor}`}>
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} text-white flex-shrink-0`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${section.textColor} mb-3`}>{section.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{section.desc}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                  {section.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full ${section.textColor.replace('text', 'bg')}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={user ? '/role-request' : '/register'}
                  className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${section.color} text-white rounded-xl hover:opacity-90 transition-opacity font-medium`}
                >
                  {section.id === 'investor' ? '申请投资人认证' : section.id === 'mentor' ? '成为创业导师' : '发布资源合作'}
                  <ArrowRightOutlined className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Resource Opportunities */}
        <div>
          <h2 className="text-2xl font-bold text-[#0a2a5c] mb-6">开放资源合作机会</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0a2a5c] border-t-transparent" />
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res: any) => (
                <div key={res.id} className="bg-white rounded-xl shadow-custom p-6 border border-gray-100 hover:shadow-custom-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-[#0a2a5c]/5 text-[#0a2a5c] rounded-lg text-xs font-medium">
                      {res.resource_type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0a2a5c] mb-2">{res.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{res.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {res.tags?.split(',').map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">{tag.trim()}</span>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                    联系人: {res.contact}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <BuildOutlined className="text-5xl mb-3 block" />
              <p>暂无开放资源合作机会</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}