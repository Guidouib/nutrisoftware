namespace NutriSoftware.Domain.Enums;

/// <summary>
/// Los siete sub-módulos de evaluación. Se persisten en una sola tabla
/// discriminada por este tipo, tal como plantea el esquema del plan
/// (cada evaluación guarda sus mediciones en <c>datos_json</c>).
/// </summary>
public enum TipoEvaluacion
{
    Antropometria,
    Nino,
    Adolescente,
    Embarazada,
    Bioquimica,
    Clinica,
    Adulto
}
