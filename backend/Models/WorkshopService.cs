namespace backend.Models;

public class WorkshopService
{
    public int Id { get; set; }

    public int ServiceCategoryId { get; set; }

    public ServiceCategory ServiceCategory { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public int EstimatedDurationMinutes { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();
}
