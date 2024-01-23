namespace HappyWeatherForeCast.Models
{
    public class ResponseViewModel<T>
    {
        public T Model { get; set; }
        public bool IsError { get; set; }
        public string Message { get; set; }

        public ResponseViewModel(T model, bool isError = false, string message = "")
        {
            Model = model;
            IsError = isError;
            Message = message;
        }

        public static ResponseViewModel<T> Success(T model) => new ResponseViewModel<T>(model);

        public static ResponseViewModel<T> Failure(string message) => new ResponseViewModel<T>(default, true, message);
    }
}
