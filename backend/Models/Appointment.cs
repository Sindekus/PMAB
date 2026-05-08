namespace backend.Models;

public class Appointment
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public int AppointmentStatusId { get; set; }

    public AppointmentStatus AppointmentStatus { get; set; } = null!;

    public DateTime ScheduledAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? CustomerNotes { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<AppointmentService> Services { get; set; } = new List<AppointmentService>();

    public ICollection<AppointmentNote> Notes { get; set; } = new List<AppointmentNote>();
}
