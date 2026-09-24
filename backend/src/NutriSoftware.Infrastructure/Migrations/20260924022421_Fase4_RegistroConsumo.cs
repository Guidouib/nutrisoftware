using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriSoftware.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fase4_RegistroConsumo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RegistrosConsumo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    NutricionistaId = table.Column<Guid>(type: "uuid", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosConsumo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosConsumo_Nutricionistas_NutricionistaId",
                        column: x => x.NutricionistaId,
                        principalTable: "Nutricionistas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosConsumo_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemsConsumo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RegistroConsumoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TiempoComida = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    AlimentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    NombreAlimento = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Gramos = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ComposicionJson = table.Column<string>(type: "jsonb", nullable: false),
                    OrigenAlimento = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemsConsumo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemsConsumo_RegistrosConsumo_RegistroConsumoId",
                        column: x => x.RegistroConsumoId,
                        principalTable: "RegistrosConsumo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemsConsumo_AlimentoId",
                table: "ItemsConsumo",
                column: "AlimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemsConsumo_RegistroConsumoId",
                table: "ItemsConsumo",
                column: "RegistroConsumoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosConsumo_NutricionistaId",
                table: "RegistrosConsumo",
                column: "NutricionistaId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosConsumo_PacienteId_Fecha",
                table: "RegistrosConsumo",
                columns: new[] { "PacienteId", "Fecha" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemsConsumo");

            migrationBuilder.DropTable(
                name: "RegistrosConsumo");
        }
    }
}
