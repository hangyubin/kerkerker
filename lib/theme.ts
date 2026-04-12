// 主题配置接口
export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  hover: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// 主题类型定义
export type ThemeName = 'default' | 'light';

// 主题配置
export const themes: Record<ThemeName, ThemeConfig> = {
  default: {
    name: '默认',
    primary: '#e50914',
    secondary: '#333333',
    background: '#000000',
    surface: '#121212',
    card: '#1e1e1e',
    hover: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#333333',
    accent: '#e50914',
    error: '#e50914',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  light: {
    name: '浅色',
    primary: '#0066cc',
    secondary: '#ff6b00',
    background: '#f8f9fa',
    surface: '#ffffff',
    card: '#f0f2f5',
    hover: '#e8eaed',
    text: '#212529',
    textSecondary: '#495057',
    border: '#dee2e6',
    accent: '#ff0066',
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
  },
};

// 获取当前主题
export function getCurrentTheme(): ThemeName {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    return savedTheme && Object.keys(themes).includes(savedTheme) ? savedTheme : 'default';
  }
  // 服务器端返回默认主题
  return 'default';
}

// 设置主题
export function setTheme(theme: ThemeName): void {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }
}

// 应用主题
export function applyTheme(theme: ThemeName): void {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && document) {
    const themeConfig = themes[theme];
    if (!themeConfig) return;

    // 应用主题变量到根元素
    const root = document.documentElement;
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (key !== 'name') {
        root.style.setProperty(`--theme-${key}`, value);
      }
    });

    // 强制更新整个页面的样式
    document.body.style.backgroundColor = themeConfig.background;
    document.body.style.color = themeConfig.text;
  }
}

// 初始化主题
export function initTheme(): void {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && document) {
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
  }
}
