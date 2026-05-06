namespace backend.Models;

public class Vehicle
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public int VehicleBrandId { get; set; }

    public VehicleBrand VehicleBrand { get; set; } = null!;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public string EngineType { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
