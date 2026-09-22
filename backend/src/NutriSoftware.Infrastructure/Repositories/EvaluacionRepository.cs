using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;
using NutriSoftware.Domain.Interfaces;
using NutriSoftware.Infrastructure.Data;

namespace NutriSoftware.Infrastructure.Repositories;

public class EvaluacionRepository(ApplicationDbContext db) : IEvaluacionRepository
{
    /// <summary>
    /// Filtra siempre por el nutricionista dueño del paciente: sin este filtro
    /// un id de evaluación ajeno bastaría para leer datos de otro consultorio.
    /// </summary>
    private IQueryable<Evaluacion> DelNutricionista(Guid nutricionistaId) =>
        db.Evaluaciones.Where(e => e.Paciente.NutricionistaId == nutricionistaId);

    public async Task<List<Evaluacion>> ObtenerPorPacienteAsync(
        Guid pacienteId, Guid nutricionistaId, TipoEvaluacion tipo, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(e => e.PacienteId == pacienteId && e.Tipo == tipo)
            .OrderByDescending(e => e.Fecha)
            .ThenByDescending(e => e.FechaCreacion)
            .ToListAsync(ct);

    public async Task<Evaluacion?> ObtenerUltimaAsync(
        Guid pacienteId, Guid nutricionistaId, TipoEvaluacion tipo, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId)
            .Where(e => e.PacienteId == pacienteId && e.Tipo == tipo)
            .OrderByDescending(e => e.Fecha)
            .ThenByDescending(e => e.FechaCreacion)
            .FirstOrDefaultAsync(ct);

    public async Task<Evaluacion?> ObtenerPorIdAsync(Guid id, Guid nutricionistaId, CancellationToken ct) =>
        await DelNutricionista(nutricionistaId).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task AgregarAsync(Evaluacion evaluacion, CancellationToken ct) =>
        await db.Evaluaciones.AddAsync(evaluacion, ct);

    public void Eliminar(Evaluacion evaluacion) => db.Evaluaciones.Remove(evaluacion);

    public async Task<bool> PacientePerteneceAsync(Guid pacienteId, Guid nutricionistaId, CancellationToken ct) =>
        await db.Pacientes.AnyAsync(p => p.Id == pacienteId && p.NutricionistaId == nutricionistaId, ct);

    public async Task GuardarCambiosAsync(CancellationToken ct) => await db.SaveChangesAsync(ct);
}
