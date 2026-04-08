'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    uv_index: number
  }
}

function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: '晴',
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
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&timezone=auto`
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 p-4">
      <div className="w-full max-w-md">
        {/* 天气卡片 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="mt-4 text-lg">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-xl">❌ {error}</p>
              <p className="mt-2 text-sm opacity-80">请刷新页面重试</p>
            </div>
          ) : weather ? (
            <div>
              {/* 城市名称 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold">上海</h1>
              </div>

              {/* 主要天气信息 */}
              <div className="text-center mb-8">
                <div className="text-8xl font-light mb-4">
                  {Math.round(weather.current.temperature_2m)}°
                </div>
                <div className="text-2xl font-normal">
                  {getWeatherDescription(weather.current.weather_code)}
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-xs opacity-80 mb-1">湿度</div>
                  <div className="text-xl font-semibold">
                    {weather.current.relative_humidity_2m}%
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-xs opacity-80 mb-1">风速</div>
                  <div className="text-xl font-semibold">
                    {Math.round(weather.current.wind_speed_10m)} km/h
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-xs opacity-80 mb-1">紫外线</div>
                  <div className="text-xl font-semibold">
                    {Math.round(weather.current.uv_index)}
                  </div>
                </div>
              </div>
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
