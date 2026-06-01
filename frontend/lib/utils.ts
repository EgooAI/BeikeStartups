// frontend/lib/utils.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400',
    pending: 'bg-[#ffb800]/10 text-[#ffb800]',
    approved: 'bg-[#00ff88]/10 text-[#00ff88]',
    rejected: 'bg-red-500/10 text-red-400',
    cancelled: 'bg-gray-500/10 text-gray-400',
    online: 'bg-[#00ff88]/10 text-[#00ff88]',
    offline: 'bg-gray-500/10 text-gray-400',
    active: 'bg-[#00ff88]/10 text-[#00ff88]',
    solved: 'bg-[#00f0ff]/10 text-[#00f0ff]',
    invalid: 'bg-red-500/10 text-red-400',
    accepted: 'bg-[#00ff88]/10 text-[#00ff88]',
  };

  return statusColors[status] || 'bg-gray-500/10 text-gray-400';
}

export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消',
    pending_online: '待上架',
    online: '已上架',
    rejected_online: '上架被拒',
    pending_offline: '待下架',
    offline: '已下架',
    rejected_offline: '下架被拒',
    invalid: '已作废',
    active: '活跃',
    solved: '已解决',
    accepted: '已录取',
  };

  return statusTexts[status] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}