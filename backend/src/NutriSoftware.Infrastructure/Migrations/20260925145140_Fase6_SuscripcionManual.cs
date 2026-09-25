using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriSoftware.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fase6_SuscripcionManual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NotaSuscripcion",
                table: "Nutricionistas",
                type: "text",
                nullable: true);

            // Queda en null para las cuentas que ya existen, y null significa
            // "sin vencimiento": siguen entrando igual que antes. Ponerles una
            // fecha aca las habria bloqueado a todas de golpe.
            migrationBuilder.AddColumn<DateOnly>(
                name: "SuscripcionHasta",
                table: "Nutricionistas",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SuscripcionSuspendida",
                table: "Nutricionistas",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotaSuscripcion",
                table: "Nutricionistas");

            migrationBuilder.DropColumn(
                name: "SuscripcionHasta",
                table: "Nutricionistas");

            migrationBuilder.DropColumn(
                name: "SuscripcionSuspendida",
                table: "Nutricionistas");
        }
    }
}
