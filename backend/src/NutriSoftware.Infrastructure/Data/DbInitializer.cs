using Microsoft.EntityFrameworkCore;
using NutriSoftware.Domain.Entities;
using NutriSoftware.Domain.Enums;

namespace NutriSoftware.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        if (await db.Alimentos.AnyAsync(a => !a.EsPersonalizado))
            return;

        var alimentos = new List<Alimento>
        {
            // ── TPCA ──────────────────────────────────────────────
            new() { Id=Guid.NewGuid(), Nombre="Quinua",            Fuente=FuenteAlimento.TPCA, Categoria="Cereales y tubérculos", Energia=368, Proteinas=13.0m, Grasas=6.3m,  Carbohidratos=64.2m, Fibra=7.0m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Papa amarilla",     Fuente=FuenteAlimento.TPCA, Categoria="Cereales y tubérculos", Energia=93,  Proteinas=2.1m,  Grasas=0.1m,  Carbohidratos=21.0m, Fibra=1.8m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Kiwicha",           Fuente=FuenteAlimento.TPCA, Categoria="Cereales y tubérculos", Energia=377, Proteinas=13.6m, Grasas=6.5m,  Carbohidratos=66.2m, Fibra=6.7m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Camote",            Fuente=FuenteAlimento.TPCA, Categoria="Cereales y tubérculos", Energia=105, Proteinas=1.6m,  Grasas=0.1m,  Carbohidratos=24.7m, Fibra=1.6m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Maíz morado",       Fuente=FuenteAlimento.TPCA, Categoria="Cereales y tubérculos", Energia=357, Proteinas=7.6m,  Grasas=1.1m,  Carbohidratos=78.5m, Fibra=5.4m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Lúcuma",            Fuente=FuenteAlimento.TPCA, Categoria="Frutas",                Energia=99,  Proteinas=1.5m,  Grasas=0.5m,  Carbohidratos=25.0m, Fibra=1.8m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Camu camu",         Fuente=FuenteAlimento.TPCA, Categoria="Frutas",                Energia=19,  Proteinas=0.5m,  Grasas=0.4m,  Carbohidratos=4.7m,  Fibra=0.6m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Aguaje",            Fuente=FuenteAlimento.TPCA, Categoria="Frutas",                Energia=283, Proteinas=2.5m,  Grasas=18.0m, Carbohidratos=42.0m, Fibra=2.4m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Trucha",            Fuente=FuenteAlimento.TPCA, Categoria="Pescados y mariscos",   Energia=131, Proteinas=20.0m, Grasas=5.7m,  Carbohidratos=0,     Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Cuy",               Fuente=FuenteAlimento.TPCA, Categoria="Carnes y aves",         Energia=149, Proteinas=19.5m, Grasas=8.0m,  Carbohidratos=0,     Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },

            // ── SMAE ──────────────────────────────────────────────
            new() { Id=Guid.NewGuid(), Nombre="Leche entera",      Fuente=FuenteAlimento.SMAE, Categoria="Lácteos y huevos",      Energia=61,  Proteinas=3.1m,  Grasas=3.3m,  Carbohidratos=4.8m,  Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Pechuga de pollo",  Fuente=FuenteAlimento.SMAE, Categoria="Carnes y aves",         Energia=165, Proteinas=31.0m, Grasas=3.6m,  Carbohidratos=0,     Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Arroz blanco",      Fuente=FuenteAlimento.SMAE, Categoria="Cereales y tubérculos", Energia=360, Proteinas=6.8m,  Grasas=0.9m,  Carbohidratos=79.1m, Fibra=0.6m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Frijol negro",      Fuente=FuenteAlimento.SMAE, Categoria="Leguminosas",           Energia=341, Proteinas=21.6m, Grasas=1.4m,  Carbohidratos=61.9m, Fibra=18.4m, EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Aguacate",          Fuente=FuenteAlimento.SMAE, Categoria="Grasas y aceites",      Energia=160, Proteinas=2.0m,  Grasas=14.7m, Carbohidratos=8.5m,  Fibra=6.7m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Tortilla de maíz",  Fuente=FuenteAlimento.SMAE, Categoria="Cereales y tubérculos", Energia=231, Proteinas=6.1m,  Grasas=4.3m,  Carbohidratos=45.0m, Fibra=6.3m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Nopal",             Fuente=FuenteAlimento.SMAE, Categoria="Verduras",              Energia=27,  Proteinas=1.7m,  Grasas=0.3m,  Carbohidratos=5.5m,  Fibra=3.3m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Leche descremada",  Fuente=FuenteAlimento.SMAE, Categoria="Lácteos y huevos",      Energia=35,  Proteinas=3.4m,  Grasas=0.1m,  Carbohidratos=5.0m,  Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },

            // ── USDA ──────────────────────────────────────────────
            new() { Id=Guid.NewGuid(), Nombre="Avena",             Fuente=FuenteAlimento.USDA, Categoria="Cereales y tubérculos", Energia=389, Proteinas=16.9m, Grasas=6.9m,  Carbohidratos=66.3m, Fibra=10.6m, EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Almendras",         Fuente=FuenteAlimento.USDA, Categoria="Grasas y aceites",      Energia=579, Proteinas=21.2m, Grasas=49.9m, Carbohidratos=21.6m, Fibra=12.5m, EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Manzana",           Fuente=FuenteAlimento.USDA, Categoria="Frutas",                Energia=52,  Proteinas=0.3m,  Grasas=0.2m,  Carbohidratos=13.8m, Fibra=2.4m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Salmón atlántico",  Fuente=FuenteAlimento.USDA, Categoria="Pescados y mariscos",   Energia=208, Proteinas=20.4m, Grasas=13.4m, Carbohidratos=0,     Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Espinacas",         Fuente=FuenteAlimento.USDA, Categoria="Verduras",              Energia=23,  Proteinas=2.9m,  Grasas=0.4m,  Carbohidratos=3.6m,  Fibra=2.2m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Huevo entero",      Fuente=FuenteAlimento.USDA, Categoria="Lácteos y huevos",      Energia=155, Proteinas=12.6m, Grasas=10.6m, Carbohidratos=1.1m,  Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Plátano",           Fuente=FuenteAlimento.USDA, Categoria="Frutas",                Energia=89,  Proteinas=1.1m,  Grasas=0.3m,  Carbohidratos=22.8m, Fibra=2.6m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Brócoli",           Fuente=FuenteAlimento.USDA, Categoria="Verduras",              Energia=34,  Proteinas=2.8m,  Grasas=0.4m,  Carbohidratos=6.6m,  Fibra=2.6m,  EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Aceite de oliva",   Fuente=FuenteAlimento.USDA, Categoria="Grasas y aceites",      Energia=884, Proteinas=0,     Grasas=100m,  Carbohidratos=0,     Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
            new() { Id=Guid.NewGuid(), Nombre="Yogur natural",     Fuente=FuenteAlimento.USDA, Categoria="Lácteos y huevos",      Energia=59,  Proteinas=3.5m,  Grasas=3.3m,  Carbohidratos=4.7m,  Fibra=0,     EsPersonalizado=false, FechaCreacion=DateTime.UtcNow },
        };

        await db.Alimentos.AddRangeAsync(alimentos);
        await db.SaveChangesAsync();
    }
}
