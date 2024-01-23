namespace HappyWeatherForeCast.Models
{
    public static class DateUtils
    {
        public static List<T> SortByDayOfWeek<T>(List<T> list, Func<T, DateTime> dateSelector)
        {
            return list.OrderBy(x => (int)(dateSelector(x).DayOfWeek + 6) % 7).ToList();
        }
    }
}
