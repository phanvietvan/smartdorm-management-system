import axios from 'axios'

export const weatherApi = {
  getCurrentWeather: async () => {
    // Tọa độ TP.HCM: lat=10.762622, lon=106.660172
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=10.762622&longitude=106.660172&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&timezone=auto'
    return axios.get(url)
  }
}
