'use client'

import { useEffect, useState } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '900']
})

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    uv_index: number
  }
}

function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: '晴朗',
    1: '多云',
    2: '多云',
    3: '阴',
    45: '雾',
    48: '雾',
    51: '小雨',
    53: '小雨',
    55: '小雨',
    61: '雨',
    63: '雨',
    65: '雨',
    71: '雪',
    73: '雪',
    75: '雪',
    80: '阵雨',
    81: '阵雨',
    82: '阵雨',
    95: '雷阵雨',
    96: '雷阵雨',
    99: '雷阵雨',
  }
  return weatherCodes[code] || '未知'
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️' // 晴
  if (code >= 1 && code <= 3) return '⛅' // 多云/阴
  if (code >= 45 && code <= 48) return '🌫️' // 雾
  if (code >= 51 && code <= 55) return '🌧️' // 小雨
  if (code >= 61 && code <= 65) return '🌧️' // 雨
  if (code >= 71 && code <= 75) return '❄️' // 雪
  if (code >= 80 && code <= 82) return '🌦️' // 阵雨
  if (code >= 95 && code <= 99) return '⛈️' // 雷阵雨
  return '☀️'
}

function getWindDirection(degree: number): string {
  const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  return directions[Math.round(degree / 45) % 8]
}

function getWindLevel(speed: number): number {
  // 风速 km/h 转换为风级
  if (speed < 1) return 0
  if (speed < 6) return 1
  if (speed < 12) return 2
  if (speed < 20) return 3
  if (speed < 29) return 4
  if (speed < 39) return 5
  if (speed < 50) return 6
  if (speed < 62) return 7
  if (speed < 75) return 8
  if (speed < 89) return 9
  if (speed < 103) return 10
  if (speed < 117) return 11
  return 12
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return '弱'
  if (uv <= 5) return '中等'
  if (uv <= 7) return '强'
  if (uv <= 10) return '很强'
  return '极强'
}

function isRainy(code: number): boolean {
  // 雨天气代码：51-55, 61-65, 80-82
  return (code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        // 上海的纬度和经度
        const lat = 31.2304
        const lon = 121.4737

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,uv_index&timezone=Asia/Shanghai`
        )

        if (!response.ok) {
          throw new Error('获取天气数据失败')
        }

        const data = await response.json()
        setWeather(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  return (
    <div className={`${inter.variable} min-h-screen flex items-center justify-center p-4 font-sans`} style={{ background: '#18181B' }}>
      <div className="w-full max-w-[400px]">
        {/* 天气卡片 */}
        <div className="rounded-[16px] shadow-2xl p-[32px] text-white relative overflow-hidden" style={{
          width: '400px',
          height: '400px',
          background: `linear-gradient(to bottom, #3A3D35 0%, #2D3028 33%, #1E211A 66%, #1C1F17 100%)`
        }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="mt-4 text-[18px] font-semibold">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[18px] font-semibold">❌ {error}</p>
              <p className="mt-2 text-[18px] font-semibold opacity-80">请刷新页面重试</p>
            </div>
          ) : weather ? (
            <div>
              {/* 城市名称 */}
              <div className="flex items-center justify-center mb-8">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h1 className="text-[18px] font-semibold">上海</h1>
              </div>

              {/* 主要天气信息 */}
              <div className="text-center mb-8">
                {/* 天气图标 */}
                <div className="text-7xl mb-4">
                  {getWeatherIcon(weather.current.weather_code)}
                </div>

                {/* 温度 */}
                <div className="text-[72px] font-black mb-3 tracking-tight" style={{ letterSpacing: '-2px' }}>
                  {Math.round(weather.current.temperature_2m)}°
                </div>

                {/* 天气状况 */}
                <div className="text-[18px] font-semibold">
                  {getWeatherDescription(weather.current.weather_code)}
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                {/* 湿度 */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-3xl mb-1">💧</div>
                  <div className="text-2xl font-bold mb-1">
                    {weather.current.relative_humidity_2m}%
                  </div>
                  <div className="text-[18px] font-semibold opacity-80">湿度</div>
                </div>

                {/* 风速 */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-3xl mb-1">🌬️</div>
                  <div className="text-2xl font-bold mb-1">
                    {getWindLevel(weather.current.wind_speed_10m)}级
                  </div>
                  <div className="text-[18px] font-semibold opacity-80">{getWindDirection(weather.current.wind_direction_10m)}</div>
                </div>

                {/* 紫外线 */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-3xl mb-1">☀️</div>
                  <div className="text-2xl font-bold mb-1">
                    {getUVLevel(weather.current.uv_index)}
                  </div>
                  <div className="text-[18px] font-semibold opacity-80">紫外线</div>
                </div>
              </div>

              {/* 雨滴动画（当下雨时显示） */}
              {isRainy(weather.current.weather_code) && (
                <div className="absolute inset-0 overflow-hidden rounded-[16px] pointer-events-none">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-3 bg-white/40 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animation: `rain ${0.5 + Math.random() * 0.5}s linear infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 页面底部说明 */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>数据来源：Open-Meteo API</p>
        </div>
      </div>
    </div>
  )
}
