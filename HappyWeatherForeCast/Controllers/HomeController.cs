using HappyWeatherForeCast.Models;
using HappyWeatherForeCast.Services.Implementations;
using HappyWeatherForeCast.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Threading.Tasks;

namespace HappyWeatherForeCast.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IApiService _apiService;

        public HomeController(ILogger<HomeController> logger, IApiService apiService)
        {
            _logger = logger;
            _apiService = apiService;
        }

        public async Task<IActionResult> Index()
        {

            var location = HttpContext.Session.GetString("SearchLocation");
            ForecastModel model = new ForecastModel();

            if (!string.IsNullOrEmpty(location))
            {
                string endpoint = _apiService.ConstructEndpoint("WeatherAPI", "forecast.json", location + "&days=7&aqi=no&alerts=no");
                var response = await _apiService.GetAsync<ForecastModel>(endpoint);

                if (!response.IsError)
                {
                    model = response.Model;
                }
            }

            return View(model);
        }

        public IActionResult AboutMyself()
        {
            return View();
        }

        public async Task<IActionResult> GetForecastData(string location)
        {
            HttpContext.Session.SetString("SearchLocation", location);
            string endpoint = _apiService.ConstructEndpoint("WeatherAPI", "forecast.json", location + "&days=7&aqi=no&alerts=no");
            var response = await _apiService.GetAsync<ForecastModel>(endpoint);

            if (response.IsError)
            {
                return Json(new { success = false, message = response.Message });
            }
            else
            {
                return Json(new { success = true, data = response.Model });
            }
        }

        public async Task<IActionResult> GetWeatherData(string location)
        {
            string endpoint = _apiService.ConstructEndpoint("WeatherAPI", "search.json", location);
            var response = await _apiService.GetAsync<List<WeatherDataModel>>(endpoint);
            if (response.IsError)
            {
                return Json(new { success = false, message = response.Message });
            }
            else
            {
                return Json(new { success = true, data = response.Model });
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}