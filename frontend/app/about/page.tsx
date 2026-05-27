'use client';

import Link from 'next/link';
import {
  RocketOutlined,
  TeamOutlined,
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  HeartOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const values = [
  { icon: <BulbOutlined className="text-2xl" />, title: '创新驱动', desc: '鼓励校园创新，支持每一个有价值的想法' },
  { icon: <HeartOutlined className="text-2xl" />, title: '真实可信', desc: '所有项目经过认证，确保信息真实可信' },
  { icon: <TeamOutlined className="text-2xl" />, title: '开放协作', desc: '连接多方资源，构建开放协作的创投生态' },
  { icon: <SafetyOutlined className="text-2xl" />, title: '持续成长', desc: '陪伴创业团队从种子阶段走向更大舞台' },
];

const offerings = [
  '项目展示 - 为认证团队提供正式的项目展示页面',
  '团队招募 - 帮助团队招募志同道合的创业伙伴',
  '创业认证 - 为真实创业团队提供官方认证',
  '导师辅导 - 对接校外导师为团队提供专业指导',
  '投资对接 - 连接投资机构与优质创业项目',
  '资源合作 - 匹配产业资源与创业团队需求',
  '活动路演 - 举办创业路演和训练营活动',
  '种子计划 - 为早期项目提供孵化支持',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RocketOutlined className="text-6xl text-[#f59e0b] mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">贝壳创业俱乐部</h1>
          <p className="text-xl text-gray-200">让校园创业项目，被更多人看见。</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission */}
        <section>
          <h2 className="text-3xl font-bold text-[#0a2a5c] mb-6">我们的使命</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            贝壳创业俱乐部致力于打造高校创新创业项目展示与资源匹配平台。
            我们汇聚校内优秀创业团队，连接校外导师、投资人、产业资源方与学生创客，
            让每一个有价值的想法都能获得展示、交流和成长的机会。
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-3xl font-bold text-[#0a2a5c] mb-8">核心价值观</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0a2a5c]/5 text-[#0a2a5c] rounded-2xl mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-[#0a2a5c] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="p-8 bg-amber-50 rounded-2xl border border-amber-100">
          <h2 className="text-2xl font-bold text-[#0a2a5c] mb-4">我们希望解决的问题</h2>
          <p className="text-gray-600 leading-relaxed">
            很多校园创业项目拥有不错的创意和执行力，却缺少被看见的机会；
            很多投资人、导师和企业资源方愿意支持年轻团队，却很难系统地了解校内项目。
            <br /><br />
            贝壳创业俱乐部希望成为连接双方的桥梁，让项目展示更清晰，让资源对接更高效，
            让校园创业氛围更真实、更持续。
          </p>
        </section>

        {/* Offerings */}
        <section>
          <h2 className="text-3xl font-bold text-[#0a2a5c] mb-8">我们提供什么</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offerings.map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-[#f59e0b] rounded-full flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center p-12 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">从一个想法，到一个真正的创业项目</h2>
          <p className="text-gray-200 mb-8">
            贝壳创业俱乐部，陪伴校园创业团队从种子阶段走向更大的舞台。
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-[#f59e0b] text-[#0a2a5c] font-semibold rounded-xl hover:bg-[#f59e0b]/90 transition-all"
          >
            立即加入 <ArrowRightOutlined className="ml-2" />
          </Link>
        </section>
      </div>
    </div>
  );
}