using HappyWeatherForeCast.Models;
using HappyWeatherForeCast.Services.Interfaces;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System;

namespace HappyWeatherForeCast.Services.Implementations
{
    public class ApiService : IApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ResponseViewModel<T>> GetAsync<T>(string endpoint) =>
            await SendRequestAsync<T>(new HttpRequestMessage(HttpMethod.Get, endpoint));

        public async Task<ResponseViewModel<T>> PostAsync<T>(string endpoint, object data) =>
            await SendRequestAsync<T>(CreateHttpRequestMessage(HttpMethod.Post, endpoint, data));

        public async Task<ResponseViewModel<T>> PutAsync<T>(string endpoint, object data) =>
            await SendRequestAsync<T>(CreateHttpRequestMessage(HttpMethod.Put, endpoint, data));

        public async Task<ResponseViewModel<T>> DeleteAsync<T>(string endpoint) =>
            await SendRequestAsync<T>(new HttpRequestMessage(HttpMethod.Delete, endpoint));

        private HttpRequestMessage CreateHttpRequestMessage(HttpMethod method, string endpoint, object data)
        {
            var message = new HttpRequestMessage(method, endpoint)
            {
                Content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json")
            };
            return message;
        }

        private async Task<ResponseViewModel<T>> SendRequestAsync<T>(HttpRequestMessage request)
        {
            try
            {
                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    return ResponseViewModel<T>.Failure($"Error: {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var model = JsonConvert.DeserializeObject<T>(content);
                return ResponseViewModel<T>.Success(model);
            }
            catch (Exception ex)
            {
                return ResponseViewModel<T>.Failure($"Exception: {ex.Message}");
            }
        }

        public string ConstructEndpoint(string baseKey, string resource, string query)
        {
            var baseUrl = _configuration[$"APIEndpoints:{baseKey}:BaseUrl"];
            var apiKey = _configuration[$"APIEndpoints:{baseKey}:ApiKey"];
            return $"{baseUrl}{resource}?key={apiKey}&q={query}";
        }
    }
}
