using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using NutriSoftware.Application.Common.Interfaces;
using NutriSoftware.Application.DTOs.Dietas;
using NutriSoftware.Application.DTOs.Reportes;

namespace NutriSoftware.Infrastructure.Services;

/// <summary>
/// Composición del plan nutricional en PDF con QuestPDF.
/// Refleja las mismas secciones y esquemas de color que el configurador del
/// frontend, para que la vista previa y el archivo emitido coincidan.
/// </summary>
public class GeneradorPdfQuestPdf : IGeneradorPdf
{
    private static readonly string[] DiasSemana =
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    /// <summary>Mismos esquemas que ofrece el configurador: acento y fondo suave.</summary>
    private static (string Acento, string Suave) Colores(string esquema) => esquema switch
    {
        "azul"    => ("#2563EB", "#EFF6FF"),
        "morado"  => ("#7C3AED", "#F5F3FF"),
        "naranja" => ("#EA580C", "#FFF7ED"),
        _         => ("#0D9F63", "#EDFAF4"),
    };

    public byte[] GenerarPlanNutricional(DatosPlanNutricional datos)
    {
        var cfg = datos.Configuracion;
        var (acento, suave) = Colores(cfg.EsquemaColor);
        var logo = DecodificarLogo(cfg.LogoDataUrl);

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.6f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9).FontFamily(cfg.Fuente, "Segoe UI", "Arial"));

                page.Header().Element(c => Membrete(c, cfg, acento, logo));
                page.Content().Element(c => Cuerpo(c, datos, acento, suave));
                page.Footer().Element(c => PiePagina(c));
            });
        }).GeneratePdf();
    }

    /* ── Membrete ─────────────────────────────────────────────── */

    private static void Membrete(IContainer container, ConfiguracionPdfDto cfg, string acento, byte[]? logo)
    {
        container
            .PaddingBottom(8)
            .BorderBottom(2)
            .BorderColor(acento)
            .Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text(cfg.Titulo).FontSize(17).Bold().FontColor(acento);
                    col.Item().Text(cfg.Consultorio).FontSize(9).FontColor(Colors.Grey.Darken2);
                    col.Item().Text(cfg.Profesional).FontSize(8).FontColor(Colors.Grey.Darken1);

                    if (!string.IsNullOrWhiteSpace(cfg.Contacto))
                        col.Item().Text(cfg.Contacto).FontSize(7.5f).FontColor(Colors.Grey.Medium);
                });

                if (logo is not null)
                    row.ConstantItem(90).AlignRight().AlignMiddle().MaxHeight(45).Image(logo).FitArea();
            });
    }

    /* ── Cuerpo ───────────────────────────────────────────────── */

    private static void Cuerpo(IContainer container, DatosPlanNutricional datos, string acento, string suave)
    {
        var cfg = datos.Configuracion;

        container.PaddingTop(12).Column(col =>
        {
            col.Spacing(14);

            if (cfg.Secciones.DatosPaciente)
                col.Item().Element(c => DatosPaciente(c, datos.Paciente, acento, suave));

            if (cfg.Secciones.Requerimientos)
                col.Item().Element(c => Requerimientos(c, datos.Dieta.Requerimientos, acento, suave));

            if (cfg.Secciones.DietaPorDia)
                col.Item().Element(c => PlanSemanal(c, datos.Dieta, acento));

            if (cfg.Secciones.ListaCompras)
                col.Item().Element(c => ListaCompras(c, datos.ListaCompras, acento));

            if (cfg.Secciones.Recomendaciones && !string.IsNullOrWhiteSpace(cfg.Recomendaciones))
                col.Item().Element(c => Recomendaciones(c, cfg.Recomendaciones!, acento));

            if (cfg.Secciones.Firma)
                col.Item().Element(c => Firma(c, cfg.Profesional));
        });
    }

    private static void Titulo(IContainer container, string texto, string acento) =>
        container.PaddingBottom(4).Text(texto).FontSize(11).Bold().FontColor(acento);

    private static void DatosPaciente(IContainer container, PacienteReporteDto p, string acento, string suave)
    {
        container.Column(col =>
        {
            col.Item().Element(c => Titulo(c, "Datos del paciente", acento));
            col.Item().Background(suave).Padding(8).Text(text =>
            {
                text.Span(p.NombreCompleto).Bold();
                text.Span($"   ·   {p.Edad} años   ·   {(p.Sexo == "M" ? "Masculino" : "Femenino")}");
                if (!string.IsNullOrWhiteSpace(p.Dni)) text.Span($"   ·   DNI {p.Dni}");
            });
        });
    }

    private static void Requerimientos(IContainer container, RequerimientosDto r, string acento, string suave)
    {
        (string Etiqueta, string Valor)[] celdas =
        [
            ("Energía",       $"{r.Kcal:0} kcal"),
            ("Proteínas",     $"{r.ProteinasG:0} g"),
            ("Carbohidratos", $"{r.CarbohidratosG:0} g"),
            ("Grasas",        $"{r.GrasasG:0} g"),
        ];

        container.Column(col =>
        {
            col.Item().Element(c => Titulo(c, "Requerimientos nutricionales", acento));
            col.Item().Row(row =>
            {
                foreach (var celda in celdas)
                {
                    row.RelativeItem().PaddingRight(6).Background(suave).Padding(8).Column(c =>
                    {
                        c.Item().AlignCenter().Text(celda.Valor).FontSize(12).Bold();
                        c.Item().AlignCenter().Text(celda.Etiqueta).FontSize(7.5f).FontColor(Colors.Grey.Darken1);
                    });
                }
            });
        });
    }

    private static void PlanSemanal(IContainer container, DietaDto dieta, string acento)
    {
        container.Column(col =>
        {
            col.Item().Element(c => Titulo(c, "Plan semanal", acento));

            foreach (var dia in dieta.Dias.OrderBy(d => d.DiaSemana))
            {
                var tiemposConAlimentos = dia.Tiempos.Where(t => t.Alimentos.Count > 0).ToList();
                var kcalDia = tiemposConAlimentos
                    .SelectMany(t => t.Alimentos)
                    .Sum(a => a.Energia100 * a.Gramos / 100);

                // Cada día se mantiene entero en una página cuando cabe.
                col.Item().ShowEntire().PaddingBottom(8).Column(bloque =>
                {
                    bloque.Item()
                        .BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .PaddingBottom(2)
                        .Row(row =>
                        {
                            row.RelativeItem().Text(NombreDia(dia.DiaSemana)).FontSize(9.5f).Bold();
                            row.ConstantItem(70).AlignRight()
                               .Text($"{kcalDia:0} kcal").FontSize(8).FontColor(Colors.Grey.Darken1);
                        });

                    if (tiemposConAlimentos.Count == 0)
                    {
                        bloque.Item().PaddingTop(3)
                              .Text("Sin alimentos asignados")
                              .FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                        return;
                    }

                    foreach (var tiempo in tiemposConAlimentos)
                    {
                        bloque.Item().PaddingTop(4).Text(tiempo.Nombre).FontSize(8.5f).Bold()
                              .FontColor(Colors.Grey.Darken3);

                        foreach (var alimento in tiempo.Alimentos)
                        {
                            var kcal = alimento.Energia100 * alimento.Gramos / 100;
                            bloque.Item().PaddingLeft(10).Row(row =>
                            {
                                row.RelativeItem().Text($"{alimento.Nombre} — {alimento.Gramos:0} g").FontSize(8);
                                row.ConstantItem(60).AlignRight()
                                   .Text($"{kcal:0} kcal").FontSize(8).FontColor(Colors.Grey.Darken1);
                            });
                        }
                    }
                });
            }
        });
    }

    private static void ListaCompras(IContainer container, List<ItemCompraDto> items, string acento)
    {
        container.Column(col =>
        {
            col.Item().Element(c => Titulo(c, "Lista de compras semanal", acento));

            if (items.Count == 0)
            {
                col.Item().Text("La dieta aún no tiene alimentos asignados.")
                   .FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                return;
            }

            // Dos columnas: la lista suele ser larga y estrecha.
            var mitad = (int)Math.Ceiling(items.Count / 2.0);

            col.Item().Row(row =>
            {
                row.RelativeItem().PaddingRight(12).Column(c => Renglones(c, items.Take(mitad)));
                row.RelativeItem().Column(c => Renglones(c, items.Skip(mitad)));
            });
        });

        static void Renglones(ColumnDescriptor col, IEnumerable<ItemCompraDto> items)
        {
            foreach (var item in items)
            {
                col.Item().PaddingVertical(1).Row(row =>
                {
                    row.RelativeItem().Text(item.Nombre).FontSize(8);
                    row.ConstantItem(55).AlignRight().Text($"{item.Gramos:0} g").FontSize(8).SemiBold();
                });
            }
        }
    }

    private static void Recomendaciones(IContainer container, string texto, string acento)
    {
        container.Column(col =>
        {
            col.Item().Element(c => Titulo(c, "Recomendaciones generales", acento));
            col.Item().Text(texto).FontSize(8.5f).LineHeight(1.4f).FontColor(Colors.Grey.Darken3);
        });
    }

    private static void Firma(IContainer container, string profesional)
    {
        container.PaddingTop(30).AlignRight().Width(200).Column(col =>
        {
            col.Item().BorderTop(1).BorderColor(Colors.Grey.Darken1).PaddingTop(3)
               .AlignCenter().Text(profesional).FontSize(8.5f).SemiBold();
            col.Item().AlignCenter().Text("Firma y sello").FontSize(7.5f).FontColor(Colors.Grey.Medium);
        });
    }

    private static void PiePagina(IContainer container)
    {
        container.PaddingTop(6).BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(4).Row(row =>
        {
            row.RelativeItem()
               .Text($"Generado el {DateTime.Now:dd/MM/yyyy HH:mm}")
               .FontSize(7).FontColor(Colors.Grey.Medium);

            row.ConstantItem(70).AlignRight().Text(text =>
            {
                text.DefaultTextStyle(t => t.FontSize(7).FontColor(Colors.Grey.Medium));
                text.CurrentPageNumber();
                text.Span(" / ");
                text.TotalPages();
            });
        });
    }

    private static string NombreDia(int indice) =>
        indice >= 0 && indice < DiasSemana.Length ? DiasSemana[indice] : $"Día {indice + 1}";

    /* ── Logo ─────────────────────────────────────────────────── */

    /// <summary>
    /// El logo llega como data URI desde el configurador. Un logo corrupto no
    /// debe impedir la emisión del reporte: se omite y el resto se genera igual.
    /// </summary>
    private static byte[]? DecodificarLogo(string? dataUrl)
    {
        if (string.IsNullOrWhiteSpace(dataUrl)) return null;

        var separador = dataUrl.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
        if (separador < 0) return null;

        try
        {
            return Convert.FromBase64String(dataUrl[(separador + "base64,".Length)..]);
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
