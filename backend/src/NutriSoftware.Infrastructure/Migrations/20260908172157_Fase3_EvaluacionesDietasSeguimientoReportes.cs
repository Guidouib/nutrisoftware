using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriSoftware.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fase3_EvaluacionesDietasSeguimientoReportes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Seguimientos_PacienteId",
                table: "Seguimientos");

            migrationBuilder.DropIndex(
                name: "IX_Dietas_PacienteId",
                table: "Dietas");

            migrationBuilder.DropIndex(
                name: "IX_DiasDieta_DietaId",
                table: "DiasDieta");

            // Npgsql no emite el USING para text -> jsonb: hay que darlo a mano.
            migrationBuilder.Sql(
                @"ALTER TABLE ""TiemposComida"" ALTER COLUMN ""TotalesJson"" TYPE jsonb USING ""TotalesJson""::jsonb;");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "TiemposComida",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.Sql(
                @"ALTER TABLE ""TiemposComida"" ALTER COLUMN ""AlimentosJson"" TYPE jsonb USING ""AlimentosJson""::jsonb;");

            migrationBuilder.AddColumn<int>(
                name: "Orden",
                table: "TiemposComida",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "Peso",
                table: "Seguimientos",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)",
                oldPrecision: 6,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.Sql(
                @"ALTER TABLE ""Seguimientos"" ALTER COLUMN ""MedidasJson"" TYPE jsonb USING ""MedidasJson""::jsonb;");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "Fecha",
                table: "Seguimientos",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<int>(
                name: "Cumplimiento",
                table: "Seguimientos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Talla",
                table: "Seguimientos",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PesoObjetivo",
                table: "Pacientes",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Dietas",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<decimal>(
                name: "CarbohidratosObjetivo",
                table: "Dietas",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Fecha",
                table: "Dietas",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Dietas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "GrasasObjetivo",
                table: "Dietas",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ModoIntercambios",
                table: "Dietas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ProteinasObjetivo",
                table: "Dietas",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Evaluaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    DatosJson = table.Column<string>(type: "jsonb", nullable: false),
                    Diagnostico = table.Column<string>(type: "text", nullable: true),
                    Prescripcion = table.Column<string>(type: "text", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Evaluaciones_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PdfsGenerados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietaId = table.Column<Guid>(type: "uuid", nullable: true),
                    Tipo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NombreArchivo = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    Contenido = table.Column<byte[]>(type: "bytea", nullable: false),
                    TamanioBytes = table.Column<long>(type: "bigint", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PdfsGenerados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PdfsGenerados_Dietas_DietaId",
                        column: x => x.DietaId,
                        principalTable: "Dietas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PdfsGenerados_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Seguimientos_PacienteId_Fecha",
                table: "Seguimientos",
                columns: new[] { "PacienteId", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_Dietas_PacienteId_Fecha",
                table: "Dietas",
                columns: new[] { "PacienteId", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_DiasDieta_DietaId_DiaSemana",
                table: "DiasDieta",
                columns: new[] { "DietaId", "DiaSemana" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_PacienteId_Tipo_Fecha",
                table: "Evaluaciones",
                columns: new[] { "PacienteId", "Tipo", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_PdfsGenerados_DietaId",
                table: "PdfsGenerados",
                column: "DietaId");

            migrationBuilder.CreateIndex(
                name: "IX_PdfsGenerados_PacienteId_Fecha",
                table: "PdfsGenerados",
                columns: new[] { "PacienteId", "Fecha" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Evaluaciones");

            migrationBuilder.DropTable(
                name: "PdfsGenerados");

            migrationBuilder.DropIndex(
                name: "IX_Seguimientos_PacienteId_Fecha",
                table: "Seguimientos");

            migrationBuilder.DropIndex(
                name: "IX_Dietas_PacienteId_Fecha",
                table: "Dietas");

            migrationBuilder.DropIndex(
                name: "IX_DiasDieta_DietaId_DiaSemana",
                table: "DiasDieta");

            migrationBuilder.DropColumn(
                name: "Orden",
                table: "TiemposComida");

            migrationBuilder.DropColumn(
                name: "Cumplimiento",
                table: "Seguimientos");

            migrationBuilder.DropColumn(
                name: "Talla",
                table: "Seguimientos");

            migrationBuilder.DropColumn(
                name: "PesoObjetivo",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "CarbohidratosObjetivo",
                table: "Dietas");

            migrationBuilder.DropColumn(
                name: "Fecha",
                table: "Dietas");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Dietas");

            migrationBuilder.DropColumn(
                name: "GrasasObjetivo",
                table: "Dietas");

            migrationBuilder.DropColumn(
                name: "ModoIntercambios",
                table: "Dietas");

            migrationBuilder.DropColumn(
                name: "ProteinasObjetivo",
                table: "Dietas");

            migrationBuilder.Sql(
                @"ALTER TABLE ""TiemposComida"" ALTER COLUMN ""TotalesJson"" TYPE text USING ""TotalesJson""::text;");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "TiemposComida",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.Sql(
                @"ALTER TABLE ""TiemposComida"" ALTER COLUMN ""AlimentosJson"" TYPE text USING ""AlimentosJson""::text;");

            migrationBuilder.AlterColumn<decimal>(
                name: "Peso",
                table: "Seguimientos",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)",
                oldPrecision: 6,
                oldScale: 2);

            migrationBuilder.Sql(
                @"ALTER TABLE ""Seguimientos"" ALTER COLUMN ""MedidasJson"" TYPE text USING ""MedidasJson""::text;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Fecha",
                table: "Seguimientos",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Dietas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_Seguimientos_PacienteId",
                table: "Seguimientos",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Dietas_PacienteId",
                table: "Dietas",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_DiasDieta_DietaId",
                table: "DiasDieta",
                column: "DietaId");
        }
    }
}
