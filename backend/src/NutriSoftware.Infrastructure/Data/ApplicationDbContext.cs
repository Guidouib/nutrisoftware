using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;

namespace NutriSoftware.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Nutricionista> Nutricionistas => Set<Nutricionista>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<Alimento> Alimentos => Set<Alimento>();
    public DbSet<Dieta> Dietas => Set<Dieta>();
    public DbSet<DiaDieta> DiasDieta => Set<DiaDieta>();
    public DbSet<TiempoComida> TiemposComida => Set<TiempoComida>();
    public DbSet<Seguimiento> Seguimientos => Set<Seguimiento>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);

        model.Entity<Usuario>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
        });

        model.Entity<RefreshToken>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Usuario)
             .WithMany(u => u.RefreshTokens)
             .HasForeignKey(r => r.UsuarioId);
        });

        model.Entity<Nutricionista>(e =>
        {
            e.HasKey(n => n.Id);
            e.HasOne(n => n.Usuario)
             .WithOne(u => u.Nutricionista)
             .HasForeignKey<Nutricionista>(n => n.UsuarioId);
            e.Property(n => n.Nombres).HasMaxLength(100).IsRequired();
            e.Property(n => n.Apellidos).HasMaxLength(100).IsRequired();
        });

        model.Entity<Paciente>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.Nutricionista)
             .WithMany(n => n.Pacientes)
             .HasForeignKey(p => p.NutricionistaId);
            e.HasOne(p => p.Usuario)
             .WithOne(u => u.Paciente)
             .HasForeignKey<Paciente>(p => p.UsuarioId)
             .IsRequired(false);
            e.Property(p => p.Nombres).HasMaxLength(100).IsRequired();
            e.Property(p => p.Apellidos).HasMaxLength(100).IsRequired();
        });

        model.Entity<Cita>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasOne(c => c.Paciente).WithMany(p => p.Citas).HasForeignKey(c => c.PacienteId);
            e.HasOne(c => c.Nutricionista).WithMany(n => n.Citas).HasForeignKey(c => c.NutricionistaId);
        });

        model.Entity<Alimento>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Nombre).HasMaxLength(200).IsRequired();
            e.Property(a => a.Energia).HasPrecision(10, 2);
            e.Property(a => a.Proteinas).HasPrecision(10, 2);
            e.Property(a => a.Grasas).HasPrecision(10, 2);
            e.Property(a => a.Carbohidratos).HasPrecision(10, 2);
            e.Property(a => a.Fibra).HasPrecision(10, 2);
            e.HasOne(a => a.Nutricionista)
             .WithMany(n => n.AlimentosPersonalizados)
             .HasForeignKey(a => a.NutricionistaId)
             .IsRequired(false);
        });

        model.Entity<Dieta>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasOne(d => d.Paciente).WithMany(p => p.Dietas).HasForeignKey(d => d.PacienteId);
            e.Property(d => d.CaloriasObjetivo).HasPrecision(10, 2);
        });

        model.Entity<DiaDieta>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasOne(d => d.Dieta).WithMany(dt => dt.Dias).HasForeignKey(d => d.DietaId);
        });

        model.Entity<TiempoComida>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasOne(t => t.DiaDieta).WithMany(d => d.TiemposComida).HasForeignKey(t => t.DiaDietaId);
        });

        model.Entity<Seguimiento>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Paciente).WithMany(p => p.Seguimientos).HasForeignKey(s => s.PacienteId);
            e.Property(s => s.Peso).HasPrecision(6, 2);
        });
    }
}
