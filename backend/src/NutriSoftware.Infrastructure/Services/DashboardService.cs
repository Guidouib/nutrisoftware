using Microsoft.EntityFrameworkCore;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Services;

public class DashboardService(ApplicationDbContext db) : IDashboardService
{
    public async Task<DashboardStatsDto> GetStatsAsync(Guid nutricionistaId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);
        var firstOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var pacientesActivos = await db.Pacientes
            .CountAsync(p => p.NutricionistaId == nutricionistaId && p.Activo, ct);

        var citasHoy = await db.Citas
            .CountAsync(c => c.NutricionistaId == nutricionistaId
                && c.FechaHora >= todayStart && c.FechaHora < todayEnd, ct);

        var citasMes = await db.Citas
            .CountAsync(c => c.NutricionistaId == nutricionistaId
                && c.FechaHora >= firstOfMonth, ct);

        var pacientesMes = await db.Pacientes
            .CountAsync(p => p.NutricionistaId == nutricionistaId
                && p.FechaCreacion >= firstOfMonth, ct);

        // Se cuentan a traves del paciente: ni Evaluacion ni Dieta guardan el
        // nutricionista, cuelgan del paciente que si lo tiene.
        var evaluacionesMes = await db.Evaluaciones
            .CountAsync(e => e.Paciente.NutricionistaId == nutricionistaId
                && e.FechaCreacion >= firstOfMonth, ct);

        var dietasGeneradas = await db.Dietas
            .CountAsync(d => d.Paciente.NutricionistaId == nutricionistaId, ct);

        var recordatoriosMes = await db.RegistrosConsumo
            .CountAsync(r => r.Paciente.NutricionistaId == nutricionistaId
                && r.FechaCreacion >= firstOfMonth, ct);

        var proximasCitas = await db.Citas
            .Include(c => c.Paciente)
            .Where(c => c.NutricionistaId == nutricionistaId
                && c.Estado == EstadoCita.Programada
                && c.FechaHora >= now)
            .OrderBy(c => c.FechaHora)
            .Take(3)
            .Select(c => new ProximaCitaDto(
                c.Id,
                c.PacienteId,
                c.Paciente.Nombres + " " + c.Paciente.Apellidos,
                c.FechaHora,
                c.TipoConsulta.ToString(),
                c.DuracionMinutos))
            .ToListAsync(ct);

        return new DashboardStatsDto(
            pacientesActivos, citasHoy, citasMes, pacientesMes, proximasCitas,
            evaluacionesMes, dietasGeneradas, recordatoriosMes);
    }
}
