namespace backend.Models;

public class AppointmentStatus
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
