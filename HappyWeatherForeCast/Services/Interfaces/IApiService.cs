using HappyWeatherForeCast.Models;

namespace HappyWeatherForeCast.Services.Interfaces
{
    public interface IApiService
    {
        Task<ResponseViewModel<T>> GetAsync<T>(string endpoint);
        Task<ResponseViewModel<T>> PostAsync<T>(string endpoint, object data);
        Task<ResponseViewModel<T>> PutAsync<T>(string endpoint, object data);
        Task<ResponseViewModel<T>> DeleteAsync<T>(string endpoint);
        string ConstructEndpoint(string baseKey, string resource, string query);
    }
}
