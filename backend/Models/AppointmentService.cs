namespace backend.Models;

public class AppointmentService
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public Appointment Appointment { get; set; } = null!;

    public int WorkshopServiceId { get; set; }

    public WorkshopService WorkshopService { get; set; } = null!;

    public decimal Price { get; set; }

    public string? Notes { get; set; }
}
